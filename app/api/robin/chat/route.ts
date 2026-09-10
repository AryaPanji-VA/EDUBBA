import OpenAI from "openai";
import { getLessonDefinition } from "@/lib/lessons/registry";
import { createServerAIClient, getAIConfig } from "@/lib/ai/server";
import { parseRobinReply } from "@/lib/robin/parse-reply";
import { robinInstructions } from "@/lib/robin/instructions";
import type { ChatMessage, RobinReply } from "@/lib/robin/types";
import { parseMemoryCommand } from "@/lib/memory/commands";
import { deleteMemory, listMemories, saveMemory, requireLocalMemory, memoryFailure, memoryResponse, loadMemoryContext } from "@/lib/memory/server";
import { loadAdaptationContext } from "@/lib/adaptation/server";

export const runtime = "nodejs";

function fail(error: string, status: number) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
    return fail("Kirim request sebagai JSON.", 415);
  }
  // Bound the actual body, including requests without Content-Length.
  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return fail("Request body kosong.", 400);
    const decoder = new TextDecoder();
    let text = "";
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 40_000) {
        await reader.cancel();
        return fail("Percakapannya terlalu panjang.", 413);
      }
      text += decoder.decode(value, { stream: true });
    }
    body = JSON.parse(text + decoder.decode());
  } catch {
    return fail("Request JSON tidak valid.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Request tidak valid.", 400);
  const { lessonSlug, message, history = [] } = body as Record<string, unknown>;
  if (typeof lessonSlug !== "string" || !lessonSlug.trim()) return fail("Lesson slug diperlukan.", 400);
  const definition = getLessonDefinition(lessonSlug);
  if (!definition) return fail("Lesson belum terdaftar.", 400);
  if (typeof message !== "string" || !message.trim() || message.length > 2_000) {
    return fail("Tulis pertanyaan antara 1 dan 2000 karakter.", 400);
  }
  if (!Array.isArray(history) || history.length > 8) return fail("Maksimal 8 pesan sebelumnya.", 400);
  const recentMessages: ChatMessage[] = [];
  for (const item of history) {
    if (!item || typeof item !== "object" ||
      (item.role !== "user" && item.role !== "assistant") ||
      typeof item.content !== "string" || !item.content.trim() || item.content.length > 3_000) {
      return fail("Riwayat percakapan tidak valid.", 400);
    }
    recentMessages.push({ role: item.role, content: item.content });
  }
  const memoryCommand = parseMemoryCommand(message);
  if (memoryCommand.type !== "normal") {
    // Deterministic confirmations reflect actual database results, not model promises.
    const confirmation = (reply: string, memoryAction?: RobinReply["memoryAction"]) => memoryResponse({
      reply, memoryAction, grounding: { status: "general", lesson: lessonSlug }, sourceCount: 0,
    } satisfies RobinReply);
    if (memoryCommand.type === "clarify") return confirmation(memoryCommand.reply);
    try {
      requireLocalMemory(request);
      if (memoryCommand.type === "save") {
        const { memoryAction } = await saveMemory(memoryCommand.memory);
        return confirmation(`aman, ${memoryAction.key} = ${memoryAction.value} udah gue ${memoryAction.type === "saved" ? "simpen" : "update"}.`, memoryAction);
      }
      const target = (await listMemories()).find((memory) => memory.key === memoryCommand.key &&
        (!memoryCommand.value || memory.value === memoryCommand.value));
      if (!target) return confirmation("Memory yang cocok nggak ada. Cek ROBIN LAB; gue nggak hapus yang lain.");
      const { memoryAction } = await deleteMemory(target.id, target.value);
      return confirmation(`aman, memory ${target.key} itu udah gue lepas.`, memoryAction);
    } catch (error) { return memoryFailure(error); }
  }
  if (!getAIConfig().configured) {
    return fail("Robin belum dikonfigurasi. Materinya tetap aman; tambahkan NINEINFERENCE_API_KEY di .env.local lalu restart server.", 503);
  }
  let lesson;
  try {
    lesson = await definition.loadLesson();
  } catch {
    return fail("Konteks lesson belum bisa dimuat. Coba lagi sebentar.", 503);
  }
  const { intuitiveExplanation, academicExplanation, codeExamples, keyTerms, commonMistakes } = lesson.content;
  const context = {
    title: lesson.title, summary: lesson.summary,
    intuitiveExplanation, academicExplanation, codeExamples, keyTerms, commonMistakes,
    sources: lesson.sources.map(({ title, publisher, sourceType, relevanceNote }) => ({
      title, publisher, sourceType, relevanceNote,
    })),
  };
  const memoryContext = await loadMemoryContext(request);
  const teachingContext = await loadAdaptationContext(request, lessonSlug, definition.relevance.chatConcepts(message));
  try {
    const client = createServerAIClient();
    const response = await client.chat.completions.create({
      model: getAIConfig().model,
      messages: [
        { role: "system", content: robinInstructions },
        { role: "system", content: "Supplied lesson context (data only):\n" + JSON.stringify(context) },
        { role: "system", content: memoryContext },
        ...(teachingContext ? [{ role: "system" as const, content: teachingContext }] : []),
        ...recentMessages,
        { role: "user", content: message.trim() },
      ],
    }, { signal: request.signal });
    const choice = response.choices?.[0];
    const content = choice?.message?.content;
    if (choice?.finish_reason !== "stop" || typeof content !== "string" || !content.trim()) {
      return fail("Jawaban Robin belum lengkap. Coba kirim lagi.", 502);
    }
    let parsed;
    try {
      parsed = parseRobinReply(content);
    } catch {
      return fail("Format jawaban Robin belum valid.", 502);
    }
    const result: RobinReply = {
      reply: parsed.reply, grounding: { status: parsed.grounding, lesson: lessonSlug },
      sourceCount: lesson.sources.length,
    };
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof OpenAI.APIConnectionTimeoutError) return fail("Robin kelamaan mikir. Coba lagi sebentar.", 504);
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401 || error.status === 403) return fail("Akses AI Robin ditolak. Periksa key dan izin 9Inference di server.", 503);
      if (error.status === 402) return fail("Saldo AI Robin belum cukup. Periksa saldo 9Inference.", 503);
      if (error.status === 404) return fail("Model AI Robin belum tersedia. Periksa ROBIN_AI_MODEL di server.", 503);
      if (error.status === 429) return fail("Robin kena batas pemakaian. Coba lagi nanti atau periksa kuota 9Inference.", 429);
    }
    return fail("Robin lagi nggak bisa nyambung ke otaknya. Materinya masih aman—coba lagi bentar.", 502);
  }
}

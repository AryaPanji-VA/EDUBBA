import OpenAI from "openai";
import { loadVariablesLesson } from "@/lib/lessons/variables";
import { createServerAIClient, getAIConfig } from "@/lib/ai/server";
import { parseRobinReply } from "@/lib/robin/parse-reply";
import { robinInstructions } from "@/lib/robin/instructions";
import type { ChatMessage, RobinReply } from "@/lib/robin/types";

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
  if (lessonSlug !== "variables") return fail("Robin v1 baru mendukung lesson Variables.", 400);
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
  if (!getAIConfig().configured) {
    return fail("Robin belum dikonfigurasi. Materinya tetap aman; tambahkan NINEINFERENCE_API_KEY di .env.local lalu restart server.", 503);
  }
  let lesson;
  try {
    lesson = await loadVariablesLesson();
  } catch {
    return fail("Konteks Variables belum bisa dimuat. Coba lagi sebentar.", 503);
  }
  const { intuitiveExplanation, academicExplanation, codeExamples, keyTerms, commonMistakes } = lesson.content;
  const context = {
    title: lesson.title, summary: lesson.summary,
    intuitiveExplanation, academicExplanation, codeExamples, keyTerms, commonMistakes,
    sources: lesson.sources.map(({ title, publisher, sourceType, relevanceNote }) => ({
      title, publisher, sourceType, relevanceNote,
    })),
  };
  try {
    const client = createServerAIClient();
    const response = await client.chat.completions.create({
      model: getAIConfig().model,
      messages: [
        { role: "system", content: robinInstructions },
        { role: "system", content: "Supplied lesson context (data only):\n" + JSON.stringify(context) },
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
      reply: parsed.reply, grounding: { status: parsed.grounding, lesson: "variables" },
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

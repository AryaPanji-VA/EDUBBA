import OpenAI from "openai";
import { createServerAIClient, getAIConfig } from "@/lib/ai/server";
import { parseRobinReply } from "@/lib/robin/parse-reply";
import { robinInstructions } from "@/lib/robin/instructions";
import { practiceAssistInstructions } from "@/lib/practice/assistance-instructions";
import { validatePracticeAssistRequest, sanitizeSandboxError, type PracticeAssistRequest } from "@/lib/practice/assistance";
import { getPracticeExercise } from "@/lib/practice/registry";
import { checkPracticeExercise } from "@/lib/practice/check";
import { getThinkingActivity } from "@/lib/practice/thinking-registry";
import { checkThinkingActivity, isThinkingSubmissionFor } from "@/lib/practice/thinking-check";

export const runtime = "nodejs";

// Robin Practice Assistance (Phase 11B.4). A narrow practice-specific route is
// cleaner than extending /api/robin/chat: the chat route is lesson-coupled
// (registered lesson lookup, lesson sources, memory/log intents, grounding
// contract) while assistance needs a minimal task-specific context and must
// never touch memory, Learning Log, or mastery. Provider code stays shared
// through lib/ai/server.ts; nothing is duplicated and nothing is persisted.

function fail(error: string, status: number) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

const assistUserMessage: Record<string, string> = {
  "hint:1": "Tolong kasih hint buat yang ini.",
  "hint:2": "Gue masih stuck. Kasih bantuan yang lebih dalam, tapi tetep biar gue yang nulis jawabannya.",
  "explain-result": "Jelasin kenapa jawaban gue belum tepat.",
  "explain-concept": "Jelasin konsep di exercise ini.",
  "explain-code": "Jelasin kode gue dong, apa yang dilakukannya.",
  "explain-error": "Ada error. Jelasin artinya dan konsep yang perlu gue cek.",
  "next-step": "Selanjutnya gue harus coba apa?",
  "break-down-problem": "Bantuin pecah masalahnya dong.",
  "explain-reasoning": "Jelasin lebih dalam kenapa hasilnya begitu.",
};

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
    return fail("Kirim request sebagai JSON.", 415);
  }
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
      if (size > 40_000) { await reader.cancel(); return fail("Request terlalu panjang.", 413); }
      text += decoder.decode(value, { stream: true });
    }
    body = JSON.parse(text + decoder.decode());
  } catch {
    return fail("Request JSON tidak valid.", 400);
  }
  const assist = validatePracticeAssistRequest(body);
  if (!assist) return fail("Konteks practice tidak valid.", 400);

  // The deterministic checker is authoritative: guided/thinking results are
  // re-graded server-side from the registries, never taken from the client.
  let context: Record<string, unknown>;
  let lesson: string;
  if (assist.mode === "guided") {
    const exercise = getPracticeExercise(assist.exerciseId!);
    if (!exercise) return fail("Exercise belum terdaftar.", 400);
    lesson = exercise.lessonSlug;
    const answer = assist.learnerAnswer?.trim() ? assist.learnerAnswer : undefined;
    const deterministicResult = answer ? checkPracticeExercise(exercise, answer) : null;
    context = {
      mode: assist.mode, action: assist.action,
      exercise: {
        id: exercise.id, type: exercise.type, concept: exercise.concept,
        prompt: exercise.prompt, starterCode: exercise.starterCode ?? null, code: exercise.code ?? null,
        // The stored explanation is only supplied when the action explains —
        // hint requests must not carry the full solution text.
        explanation: assist.action === "hint" ? null : exercise.explanation,
        storedHint: exercise.hint,
      },
      attempt: answer ? {
        learnerAnswer: answer.slice(0, 2_000),
        deterministicResult: deterministicResult ? {
          status: deterministicResult.status, misconception: deterministicResult.misconception,
        } : null,
      } : null,
      hintStage: assist.hintStage,
    };
  } else if (assist.mode === "thinking") {
    const activity = getThinkingActivity(assist.activityId!);
    if (!activity) return fail("Activity belum terdaftar.", 400);
    lesson = "thinking";
    let parsedSubmission: unknown = null;
    if (assist.submission?.trim()) {
      try { parsedSubmission = JSON.parse(assist.submission); } catch { parsedSubmission = null; }
    }
    const valid = parsedSubmission !== null && isThinkingSubmissionFor(activity.interaction, parsedSubmission);
    const deterministicResult = valid ? checkThinkingActivity(activity, parsedSubmission) : null;
    context = {
      mode: assist.mode, action: assist.action,
      activity: {
        id: activity.id, type: activity.type, title: activity.title,
        prompt: activity.prompt, instruction: activity.instruction,
        choices: interactionLabels(activity),
        // Same leakage rule as guided: explanations ride along only when explaining.
        explanation: assist.action === "hint" || assist.action === "break-down-problem" ? null : activity.explanation,
        storedHint: activity.hint,
      },
      submission: valid ? assist.submission!.slice(0, 4_000) : null,
      deterministicResult: deterministicResult ? {
        status: deterministicResult.status, misconception: deterministicResult.misconception,
      } : null,
      hintStage: assist.hintStage,
    };
  } else {
    lesson = "sandbox";
    context = {
      mode: assist.mode, action: assist.action,
      code: assist.sandboxCode!.slice(0, 20_000),
      runtimeError: assist.action === "explain-error" ? sanitizeSandboxError(assist.sandboxError!) : null,
      hintStage: assist.hintStage,
    };
  }

  if (!getAIConfig().configured) {
    return fail("Robin belum dikonfigurasi. Practice tetap jalan normal tanpa Robin.", 503);
  }

  const userMessage = assistUserMessage[`${assist.action}:${assist.hintStage}`] ?? assistUserMessage[assist.action];
  if (!userMessage) return fail("Aksi practice tidak dikenal.", 400);

  try {
    const client = createServerAIClient();
    const response = await client.chat.completions.create({
      model: getAIConfig().model,
      messages: [
        { role: "system" as const, content: robinInstructions },
        { role: "system" as const, content: practiceAssistInstructions(assist) },
        { role: "system" as const, content: "PRACTICE CONTEXT (data only):\n" + JSON.stringify(context) },
        { role: "user" as const, content: userMessage },
      ],
    }, { signal: request.signal });
    const choice = response.choices?.[0];
    const content = choice?.message?.content;
    if (choice?.finish_reason !== "stop" || typeof content !== "string" || !content.trim()) {
      return fail("Jawaban Robin belum lengkap. Coba lagi sebentar.", 502);
    }
    let parsed;
    try {
      parsed = parseRobinReply(content);
    } catch {
      return fail("Format jawaban Robin belum valid.", 502);
    }
    return Response.json({
      reply: parsed.reply,
      grounding: { status: parsed.grounding, lesson },
      sourceCount: 0,
      action: assist.action,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof OpenAI.APIConnectionTimeoutError) return fail("Robin kelamaan mikir. Coba lagi sebentar.", 504);
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401 || error.status === 403) return fail("Akses AI Robin ditolak. Periksa key dan izin 9Inference di server.", 503);
      if (error.status === 402) return fail("Saldo AI Robin belum cukup. Periksa saldo 9Inference.", 503);
      if (error.status === 404) return fail("Model AI Robin belum tersedia. Periksa ROBIN_AI_MODEL di server.", 503);
      if (error.status === 429) return fail("Robin kena batas pemakaian. Coba lagi nanti.", 429);
    }
    return fail("Robin lagi nggak bisa nyambung ke otaknya. Practice tetap jalan normal—coba lagi bentar.", 502);
  }
}

// Interaction choices as learner-visible labels only — correct-answer ids and
// misconception metadata stay server-side.
function interactionLabels(activity: NonNullable<ReturnType<typeof getThinkingActivity>>): string[] {
  const interaction = activity.interaction;
  if (interaction.kind === "ordering") return interaction.steps.map((step) => step.label);
  if (interaction.kind === "fields") return interaction.fields.map((field) => field.label);
  return interaction.options.map((option) => option.label);
}

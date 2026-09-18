import { createServerAIClient, getAIConfig } from "@/lib/ai/server";
import { getLessonDefinition } from "@/lib/lessons/registry";
import { parseCheckEvaluation, validateCheckRequest } from "@/lib/robin/check";
import { recordEvidence } from "@/lib/mastery/server";
import { requireLocalUserId } from "@/lib/local-user/server";
import { loadAdaptation } from "@/lib/adaptation/server";

export const runtime = "nodejs";

function fail(status: number) {
  // Do not serialize provider errors, headers, request bodies, or credentials.
  return Response.json({ error: "CHECK_UNAVAILABLE" }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let localUserId: string;
  try { localUserId = requireLocalUserId(request); } catch { return fail(401); }
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return fail(415);
  let body: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return fail(400);
    const decoder = new TextDecoder();
    let text = "";
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 12_000) { await reader.cancel(); return fail(413); }
      text += decoder.decode(value, { stream: true });
    }
    body = JSON.parse(text + decoder.decode());
  } catch { return fail(400); }
  const input = validateCheckRequest(body);
  if (!input) return fail(400);

  const definition = getLessonDefinition(input.lessonSlug);
  if (!definition) return fail(400);

  if (!getAIConfig().configured) return fail(503);

  try {
    // Reviewed lesson prose is server-controlled; no memory reads/writes are needed.
    // Historical mastery is never sent to the evaluator.
    const response = await createServerAIClient().chat.completions.create({
      model: getAIConfig().model,
      messages: [
        { role: "system", content: definition.check.rubric },
        { role: "system", content: definition.check.contextLabel + ":\n" + JSON.stringify(definition.check.lessonContext) },
        { role: "user", content: JSON.stringify({ question: definition.check.question, learnerAnswer: input.answer, fallbackLanguage: input.language }) },
      ],
    }, { signal: request.signal });
    const choice = response.choices?.[0];
    if (choice?.finish_reason !== "stop" || typeof choice.message?.content !== "string") return fail(502);
    const evaluation = parseCheckEvaluation(choice.message.content, definition.check.concepts, definition.check.misconceptions);
    // Record mastery evidence for the mapped Robin Check concepts. Best-effort, never blocks.
    const { evidenceType, concepts } = definition.mastery.robinCheckSignalToEvidence(evaluation.signal);
    const attemptId = crypto.randomUUID();
    for (const concept of concepts) {
      try { await recordEvidence(localUserId, input.lessonSlug, concept, evidenceType, attemptId); } catch { /* best-effort */ }
    }
    // Adapt only after the original signal has been validated and used for unchanged evidence weights.
    let supportedEvaluation = evaluation;
    if (definition.check.adaptFeedback) {
      try {
        const policy = await loadAdaptation(request, input.lessonSlug, definition.relevance.checkConcepts());
        supportedEvaluation = definition.check.adaptFeedback(evaluation, policy, input.language);
      } catch { /* Keep the original evaluated feedback if adaptation is unavailable. */ }
    }
    return Response.json({ evaluation: supportedEvaluation }, { headers: { "Cache-Control": "no-store" } });
  } catch { return fail(502); }
}

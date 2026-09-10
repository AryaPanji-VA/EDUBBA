import { createServerAIClient, getAIConfig } from "@/lib/ai/server";
import { variablesLessonContent } from "@/content/lessons/programming/variables";
import { robinCheckInstructions } from "@/lib/robin/check-instructions";
import { parseCheckEvaluation, validateCheckRequest } from "@/lib/robin/check";
import { robinCheckSignalToEvidence } from "@/lib/mastery/types";
import { recordEvidence } from "@/lib/mastery/server";
import { loadAdaptation } from "@/lib/adaptation/server";
import { relevantCheckConcepts } from "@/lib/adaptation/relevance";
import { adaptCheckFeedback } from "@/lib/adaptation/check-support";

export const runtime = "nodejs";

function fail(status: number) {
  // Do not serialize provider errors, headers, request bodies, or credentials.
  return Response.json({ error: "CHECK_UNAVAILABLE" }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
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
  if (!getAIConfig().configured) return fail(503);

  try {
    // Reviewed lesson prose is server-controlled; no memory reads/writes are needed.
    const { academicExplanation, codeExamples, keyTerms, commonMistakes } = variablesLessonContent;
    const response = await createServerAIClient().chat.completions.create({
      model: getAIConfig().model,
      messages: [
        { role: "system", content: robinCheckInstructions },
        { role: "system", content: "Variables lesson context (data only):\n" + JSON.stringify({ academicExplanation, codeExamples, keyTerms, commonMistakes }) },
        { role: "user", content: JSON.stringify({ question: "What happens when Python executes x = 5?", learnerAnswer: input.answer, fallbackLanguage: input.language }) },
      ],
    }, { signal: request.signal });
    const choice = response.choices?.[0];
    if (choice?.finish_reason !== "stop" || typeof choice.message?.content !== "string") return fail(502);
    const evaluation = parseCheckEvaluation(choice.message.content);
    // Record mastery evidence for the mapped Robin Check concepts. Best-effort, never blocks.
    const { evidenceType, concepts } = robinCheckSignalToEvidence(evaluation.signal);
    const attemptId = crypto.randomUUID();
    for (const concept of concepts) {
      try { await recordEvidence("variables", concept, evidenceType, attemptId); } catch { /* best-effort */ }
    }
    // Historical mastery is never sent to the evaluator. Adapt only after the
    // original signal has been validated and used for unchanged evidence weights.
    let supportedEvaluation = evaluation;
    try {
      const policy = await loadAdaptation(request, input.lessonSlug, relevantCheckConcepts(input.lessonSlug));
      supportedEvaluation = adaptCheckFeedback(evaluation, policy, input.language);
    } catch { /* Keep the original evaluated feedback if adaptation is unavailable. */ }
    return Response.json({ evaluation: supportedEvaluation }, { headers: { "Cache-Control": "no-store" } });
  } catch { return fail(502); }
}

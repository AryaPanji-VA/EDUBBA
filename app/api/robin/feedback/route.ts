import { createServerAIClient, getAIConfig } from "@/lib/ai/server";
import { getLessonDefinition } from "@/lib/lessons/registry";
import { gradeActivity, parseQuizFeedbackResult, validateQuizFeedbackRequest } from "@/lib/robin/quiz-feedback";
import { recordEvidence } from "@/lib/mastery/server";
import { loadAdaptationContext } from "@/lib/adaptation/server";

export const runtime = "nodejs";

function fail(status: number) {
  return Response.json({ error: "QUIZ_FEEDBACK_UNAVAILABLE" }, { status, headers: { "Cache-Control": "no-store" } });
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
  const input = validateQuizFeedbackRequest(body);
  if (!input) return fail(400);

  const definition = getLessonDefinition(input.lessonSlug);
  if (!definition) return fail(400);

  const activity = definition.activities.find((item) => item.id === input.activityId);
  if (!activity || (activity.type !== "predict" && activity.type !== "practice")) return fail(400);

  const grading = gradeActivity(activity, input.learnerAnswer);
  if (!grading) return fail(400);

  // Record mastery evidence before the AI call: if AI fails, deterministic evidence is still preserved.
  const masteryConcept = definition.mastery.activityConceptToMastery(grading.concept);
  if (masteryConcept) {
    const evidenceType = grading.activityType === "predict"
      ? grading.isCorrect ? "correct_prediction" : "incorrect_prediction"
      : grading.isCorrect ? "correct_practice" : "incorrect_practice";
    try { await recordEvidence(input.lessonSlug, masteryConcept, evidenceType, input.attemptId); } catch {
      console.warn("[ROBIN MASTERY] Evidence recording unavailable; continuing feedback.");
    }
  }

  if (!getAIConfig().configured) return fail(503);

  const teachingContext = await loadAdaptationContext(request, input.lessonSlug,
    definition.relevance.activityConcepts(grading.concept),
    { concept: masteryConcept ?? grading.concept, isCorrect: grading.isCorrect });

  try {
    const quizContext = {
      activityId: input.activityId, activityType: grading.activityType, concept: grading.concept,
      learningPurpose: grading.learningPurpose, isCorrect: grading.isCorrect,
      correctAnswer: grading.correctAnswer ?? null, likelyMisconception: grading.likelyMisconception,
      options: grading.options ?? null,
    };
    const response = await createServerAIClient().chat.completions.create({
      model: getAIConfig().model,
      messages: [
        { role: "system", content: definition.feedback.rubric },
        { role: "system", content: "Quiz activity context (data only):\n" + JSON.stringify(quizContext) },
        ...(teachingContext ? [{ role: "system" as const, content: teachingContext }] : []),
        { role: "user", content: JSON.stringify({ learnerAnswer: input.learnerAnswer, language: input.language }) },
      ],
    }, { signal: request.signal });
    const choice = response.choices?.[0];
    if (choice?.finish_reason !== "stop" || typeof choice.message?.content !== "string") return fail(502);
    const result = parseQuizFeedbackResult(choice.message.content, grading.isCorrect);
    return Response.json({ result }, { headers: { "Cache-Control": "no-store" } });
  } catch { return fail(502); }
}

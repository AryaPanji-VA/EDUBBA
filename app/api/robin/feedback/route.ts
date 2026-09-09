import { createServerAIClient, getAIConfig } from "@/lib/ai/server";
import { variablesActivities } from "@/content/lessons/programming/variables-activities";
import { quizFeedbackInstructions } from "@/lib/robin/quiz-feedback-instructions";
import { gradeActivity, parseQuizFeedbackResult, validateQuizFeedbackRequest } from "@/lib/robin/quiz-feedback";

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

  const activity = variablesActivities.find((item) => item.id === input.activityId);
  if (!activity || (activity.type !== "predict" && activity.type !== "practice")) return fail(400);

  const grading = gradeActivity(activity, input.learnerAnswer);
  if (!grading) return fail(400);

  if (!getAIConfig().configured) return fail(503);

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
        { role: "system", content: quizFeedbackInstructions },
        { role: "system", content: "Quiz activity context (data only):\n" + JSON.stringify(quizContext) },
        { role: "user", content: JSON.stringify({ learnerAnswer: input.learnerAnswer, language: input.language }) },
      ],
    }, { signal: request.signal });
    const choice = response.choices?.[0];
    if (choice?.finish_reason !== "stop" || typeof choice.message?.content !== "string") return fail(502);
    const result = parseQuizFeedbackResult(choice.message.content, grading.isCorrect);
    return Response.json({ result }, { headers: { "Cache-Control": "no-store" } });
  } catch { return fail(502); }
}

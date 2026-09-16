import { recordEvidence } from "@/lib/mastery/server";
import { checkThinkingActivity, isThinkingSubmissionFor } from "@/lib/practice/thinking-check";
import { getThinkingActivity } from "@/lib/practice/thinking-registry";

export const runtime = "nodejs";

function fail(error: string, status: number) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

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
      if (size > 12_000) { await reader.cancel(); return fail("Jawaban terlalu panjang.", 413); }
      text += decoder.decode(value, { stream: true });
    }
    body = JSON.parse(text + decoder.decode());
  } catch {
    return fail("Request JSON tidak valid.", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Request tidak valid.", 400);
  const { activityId, answer, attemptId } = body as Record<string, unknown>;
  if (typeof activityId !== "string" || !activityId || activityId.length > 80) return fail("Activity id tidak valid.", 400);
  if (typeof attemptId !== "string" || !attemptId || attemptId.length > 100) return fail("Attempt id tidak valid.", 400);
  const activity = getThinkingActivity(activityId);
  if (!activity || !isThinkingSubmissionFor(activity.interaction, answer)) return fail("Jawaban activity tidak valid.", 400);

  const result = checkThinkingActivity(activity, answer);
  const evidenceType = result.status === "correct" ? "correct_practice" : "incorrect_practice";
  for (const mapping of activity.masteryEvidence) {
    await recordEvidence(mapping.lessonSlug, mapping.concept, evidenceType, attemptId);
  }

  return Response.json({ result }, { headers: { "Cache-Control": "no-store" } });
}


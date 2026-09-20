import { recordEvidence } from "@/lib/mastery/server";
import { requireLocalUserId } from "@/lib/local-user/server";
import { checkThinkingActivity, isThinkingSubmissionFor } from "@/lib/practice/thinking-check";
import { getThinkingActivity } from "@/lib/practice/thinking-registry";
import { localizeThinkingActivities } from "@/content/practice/thinking/localization";
import { parseRobinLocale } from "@/lib/robin/locale";

export const runtime = "nodejs";

function fail(error: string, status: number) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let localUserId: string;
  try { localUserId = requireLocalUserId(request); } catch { return fail("Pilih local user dulu.", 401); }
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
  const { activityId, answer, attemptId, language } = body as Record<string, unknown>;
  if (typeof activityId !== "string" || !activityId || activityId.length > 80) return fail("Activity id tidak valid.", 400);
  if (typeof attemptId !== "string" || !attemptId || attemptId.length > 100) return fail("Attempt id tidak valid.", 400);
  const activity = getThinkingActivity(activityId);
  if (!activity || !isThinkingSubmissionFor(activity.interaction, answer)) return fail("Jawaban activity tidak valid.", 400);

  // Deterministic result text follows the active EDUBBA locale; ids, correct
  // answers, and mastery evidence are never localized.
  const localizedActivity = localizeThinkingActivities([activity], parseRobinLocale(language))[0];

  const result = checkThinkingActivity(localizedActivity, answer);
  const evidenceType = result.status === "correct" ? "correct_practice" : "incorrect_practice";
  for (const mapping of activity.masteryEvidence) {
    await recordEvidence(localUserId, mapping.lessonSlug, mapping.concept, evidenceType, attemptId);
  }

  return Response.json({ result }, { headers: { "Cache-Control": "no-store" } });
}

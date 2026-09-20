import { getPracticeExercise } from "@/lib/practice/registry";
import { checkPracticeExercise } from "@/lib/practice/check";
import { localizePracticeExercises } from "@/content/practice/python/localization";
import { parseRobinLocale } from "@/lib/robin/locale";
import { recordEvidence } from "@/lib/mastery/server";
import { requireLocalUserId } from "@/lib/local-user/server";

export const runtime = "nodejs";

function fail(error: string, status: number) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

// Deterministic practice grading. No AI in this path: the check must stay
// available and authoritative even when Robin is offline. Mastery evidence is
// recorded best-effort (same convention as Robin Feedback) keyed by the
// learner's stable attempt id, so a refreshed session never duplicates it.
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
  const { exerciseId, answer, attemptId, language } = body as Record<string, unknown>;
  if (typeof exerciseId !== "string" || !exerciseId.trim() || exerciseId.length > 80) return fail("Exercise id tidak valid.", 400);
  if (typeof attemptId !== "string" || !attemptId.trim() || attemptId.length > 100) return fail("Attempt id tidak valid.", 400);
  if (typeof answer !== "string" || !answer.trim() || answer.length > 2_000) return fail("Tulis jawaban antara 1 dan 2000 karakter.", 400);
  const exercise = getPracticeExercise(exerciseId);
  if (!exercise) return fail("Exercise belum terdaftar.", 400);
  // Deterministic result text follows the active EDUBBA locale; grading is
  // unaffected (ids, patterns, and outputs are never localized).
  const localizedExercise = localizePracticeExercises([exercise], parseRobinLocale(language))[0];

  const result = checkPracticeExercise(localizedExercise, answer, parseRobinLocale(language));

  const evidenceType = result.status === "correct" ? "correct_practice" : "incorrect_practice";
  for (const concept of exercise.masteryConcepts) {
    try { await recordEvidence(localUserId, exercise.lessonSlug, concept, evidenceType, attemptId); } catch {
      console.warn("[ROBIN MASTERY] Evidence recording unavailable; continuing practice.");
    }
  }

  return Response.json({ result }, { headers: { "Cache-Control": "no-store" } });
}

import "server-only";
import { createMemorySupabaseClient } from "@/lib/supabase/memory-server";
import { emptyPersistedPracticeState, validatePracticeProgressInput, type PracticeProgress, type PracticeProgressInput } from "./types";
import { requireLocalUserId } from "@/lib/local-user/server";

// Practice progress persistence — mirrors lib/progress/server.ts conventions.
// Single-user local/personal architecture: no auth yet, user_id stays null.

const columns = "id,user_id,local_user_id,course_slug,current_exercise_id,completed_exercise_ids,progress_state,completed_at,created_at,updated_at";

export class PracticeError extends Error {
  constructor(message: string, public status = 503) { super(message); }
}

export function requireLocalPractice(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (process.env.NODE_ENV !== "development" ||
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      (host && host !== url.host) || (origin && origin !== url.origin) ||
      ["cross-site", "same-site"].includes(request.headers.get("sec-fetch-site") ?? "")) {
    throw new PracticeError("Practice progress hanya tersedia di development lokal. Belum ada authentication.", 403);
  }
  try { return requireLocalUserId(request); }
  catch { throw new PracticeError("Pilih local user dulu.", 401); }
}

export function practiceResponse(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function practiceFailure(error: unknown) {
  return practiceResponse(
    { error: error instanceof PracticeError ? error.message : "Practice progress belum tersedia. Coba lagi sebentar." },
    error instanceof PracticeError ? error.status : 503,
  );
}

export async function loadPracticeProgress(localUserId: string, courseSlug: string): Promise<PracticeProgress | null> {
  const client = createMemorySupabaseClient();
  const { data, error } = await client.from("practice_progress")
    .select(columns)
    .eq("local_user_id", localUserId).eq("course_slug", courseSlug)
    .maybeSingle();
  if (error) throw new Error("Practice progress read unavailable.");
  return (data ?? null) as PracticeProgress | null;
}

export async function savePracticeProgress(localUserId: string, input: PracticeProgressInput): Promise<{ progress: PracticeProgress; newlyCompleted: boolean }> {
  const client = createMemorySupabaseClient();
  const existing = await loadPracticeProgress(localUserId, input.courseSlug);
  const existingState = existing?.progress_state ?? emptyPersistedPracticeState;
  const incomingState = input.progressState ?? emptyPersistedPracticeState;
  const payload = {
    local_user_id: localUserId,
    course_slug: input.courseSlug,
    current_exercise_id: input.currentExerciseId ?? existing?.current_exercise_id ?? null,
    completed_exercise_ids: [...new Set([...(existing?.completed_exercise_ids ?? []), ...(input.completedExerciseIds ?? [])])],
    // Attempts are keyed by exercise id; the newest attempt per exercise wins.
    progress_state: {
      attempts: { ...existingState.attempts, ...incomingState.attempts },
      logStatus: { ...existingState.logStatus, ...incomingState.logStatus },
    },
    completed_at: existing?.completed_at ?? input.completedAt ?? null,
  };
  const { data, error } = await client.from("practice_progress")
    .upsert(payload, { onConflict: "local_user_id,course_slug" })
    .select(columns).single();
  if (error) throw new Error("Practice progress write unavailable.");
  const progress = data as PracticeProgress;
  return { progress, newlyCompleted: !existing?.completed_at && Boolean(progress.completed_at) };
}

export { validatePracticeProgressInput };

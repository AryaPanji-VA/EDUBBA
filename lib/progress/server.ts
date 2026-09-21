import "server-only";
import { createMemorySupabaseClient } from "@/lib/supabase/memory-server";
import { defaultCurrentLesson } from "@/data/courses";
import { getLessonDefinition } from "@/lib/lessons/registry";
import { emptyPersistedProgressState, validateProgressInput, type CurrentLesson, type LessonProgress, type LessonProgressInput, type PersistedProgressState } from "./types";
import { requireLocalUserId } from "@/lib/local-user/server";

const columns = "id,user_id,local_user_id,course_slug,lesson_slug,current_activity_id,completed_activity_ids,progress_state,completed_at,created_at,updated_at";

export class ProgressError extends Error {
  constructor(message: string, public status = 503) { super(message); }
}

export function requireLocalProgress(request: Request) {
  try { return requireLocalUserId(request); }
  catch { throw new ProgressError("Pilih local user dulu.", 401); }
}

export function progressResponse(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function progressFailure(error: unknown) {
  return progressResponse(
    { error: error instanceof ProgressError ? error.message : "Lesson progress belum tersedia. Coba lagi sebentar." },
    error instanceof ProgressError ? error.status : 503,
  );
}

export async function loadProgress(localUserId: string, courseSlug: string, lessonSlug: string): Promise<LessonProgress | null> {
  const client = createMemorySupabaseClient();
  const { data, error } = await client.from("lesson_progress")
    .select(columns)
    .eq("local_user_id", localUserId).eq("course_slug", courseSlug).eq("lesson_slug", lessonSlug)
    .maybeSingle();
  if (error) throw new Error("Progress read unavailable.");
  return (data ?? null) as LessonProgress | null;
}

function mergeState(existing: PersistedProgressState | undefined, incoming: PersistedProgressState): PersistedProgressState {
  return {
    answers: { ...(existing?.answers ?? {}), ...incoming.answers },
    robinCheckComplete: Boolean(existing?.robinCheckComplete || incoming.robinCheckComplete),
    learningLogStatus: incoming.learningLogStatus === "none"
      ? existing?.learningLogStatus ?? "none"
      : incoming.learningLogStatus,
  };
}

export async function saveProgress(localUserId: string, input: LessonProgressInput): Promise<{ progress: LessonProgress; newlyCompleted: boolean }> {
  const client = createMemorySupabaseClient();
  const existing = await loadProgress(localUserId, input.courseSlug, input.lessonSlug);
  const payload = {
    local_user_id: localUserId,
    course_slug: input.courseSlug,
    lesson_slug: input.lessonSlug,
    current_activity_id: input.currentActivityId ?? null,
    completed_activity_ids: [...new Set([...(existing?.completed_activity_ids ?? []), ...(input.completedActivityIds ?? [])])],
    progress_state: mergeState(existing?.progress_state, input.progressState ?? emptyPersistedProgressState),
    completed_at: existing?.completed_at ?? input.completedAt ?? null,
  };
  const { data, error } = await client.from("lesson_progress")
    .upsert(payload, { onConflict: "local_user_id,course_slug,lesson_slug" })
    .select(columns).single();
  if (error) throw new Error("Progress write unavailable.");
  const progress = data as LessonProgress;
  return { progress, newlyCompleted: !existing?.completed_at && Boolean(progress.completed_at) };
}

// Resolve the current/last lesson from persisted progress.
// Falls back to the static curriculum map when Supabase is unavailable.
export async function loadCurrentLesson(localUserId: string): Promise<CurrentLesson> {
  try {
    const client = createMemorySupabaseClient();
    const { data, error } = await client.from("lesson_progress")
      .select("course_slug,lesson_slug,current_activity_id,completed_activity_ids,completed_at,updated_at")
      .eq("local_user_id", localUserId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error("Current lesson read unavailable.");
    if (data) {
      const lessonSlug = (data as { lesson_slug: string }).lesson_slug;
      return {
        courseSlug: (data as { course_slug: string }).course_slug,
        lessonSlug,
        currentActivityId: (data as { current_activity_id: string | null }).current_activity_id,
        completedActivityIds: (data as { completed_activity_ids: string[] }).completed_activity_ids ?? [],
        totalActivities: getLessonDefinition(lessonSlug)?.activities.length ?? 0,
        completedAt: (data as { completed_at: string | null }).completed_at,
        updatedAt: (data as { updated_at: string }).updated_at,
      };
    }
  } catch {
    // Fall through to static fallback.
  }
  // Static fallback: derived from the implemented-lesson map, never a
  // hardcoded course. Programming is simply the first course with lessons.
  const { courseSlug, lessonSlug } = defaultCurrentLesson;
  return { courseSlug, lessonSlug, currentActivityId: null, completedActivityIds: [], totalActivities: getLessonDefinition(lessonSlug)?.activities.length ?? 0, completedAt: null, updatedAt: new Date().toISOString() };
}

// Best-effort real course progress (Phase 15): completed lesson counts per
// course from persisted progress. Only served under the same local-dev guard
// as the progress API; any failure returns empty counts (honest neutral state).
export async function loadCompletedLessonCountsByCourse(request: Request): Promise<Record<string, number>> {
  try {
    const localUserId = requireLocalProgress(request);
    const client = createMemorySupabaseClient();
    const { data, error } = await client.from("lesson_progress")
      .select("course_slug")
      .eq("local_user_id", localUserId)
      .not("completed_at", "is", null);
    if (error) return {};
    const counts: Record<string, number> = {};
    for (const row of (data ?? []) as { course_slug: string }[]) {
      counts[row.course_slug] = (counts[row.course_slug] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

export { validateProgressInput };

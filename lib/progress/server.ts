import "server-only";
import { createMemorySupabaseClient } from "@/lib/supabase/memory-server";
import { programmingLessonStateBySlug } from "@/data/courses";
import { getLessonDefinition } from "@/lib/lessons/registry";
import { emptyPersistedProgressState, validateProgressInput, type CurrentLesson, type LessonProgress, type LessonProgressInput, type PersistedProgressState } from "./types";

const columns = "id,user_id,course_slug,lesson_slug,current_activity_id,completed_activity_ids,progress_state,completed_at,created_at,updated_at";

export class ProgressError extends Error {
  constructor(message: string, public status = 503) { super(message); }
}

export function requireLocalProgress(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (process.env.NODE_ENV !== "development" ||
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      (host && host !== url.host) || (origin && origin !== url.origin) ||
      ["cross-site", "same-site"].includes(request.headers.get("sec-fetch-site") ?? "")) {
    throw new ProgressError("Lesson progress hanya tersedia di development lokal. Belum ada authentication.", 403);
  }
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

export async function loadProgress(courseSlug: string, lessonSlug: string): Promise<LessonProgress | null> {
  const client = createMemorySupabaseClient();
  const { data, error } = await client.from("lesson_progress")
    .select(columns)
    .eq("course_slug", courseSlug).eq("lesson_slug", lessonSlug)
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

export async function saveProgress(input: LessonProgressInput): Promise<{ progress: LessonProgress; newlyCompleted: boolean }> {
  const client = createMemorySupabaseClient();
  const existing = await loadProgress(input.courseSlug, input.lessonSlug);
  const payload = {
    course_slug: input.courseSlug,
    lesson_slug: input.lessonSlug,
    current_activity_id: input.currentActivityId ?? null,
    completed_activity_ids: [...new Set([...(existing?.completed_activity_ids ?? []), ...(input.completedActivityIds ?? [])])],
    progress_state: mergeState(existing?.progress_state, input.progressState ?? emptyPersistedProgressState),
    completed_at: existing?.completed_at ?? input.completedAt ?? null,
  };
  const { data, error } = await client.from("lesson_progress")
    .upsert(payload, { onConflict: "course_slug,lesson_slug" })
    .select(columns).single();
  if (error) throw new Error("Progress write unavailable.");
  const progress = data as LessonProgress;
  return { progress, newlyCompleted: !existing?.completed_at && Boolean(progress.completed_at) };
}

// Resolve the current/last lesson from persisted progress.
// Falls back to the static curriculum map when Supabase is unavailable.
export async function loadCurrentLesson(): Promise<CurrentLesson> {
  try {
    const client = createMemorySupabaseClient();
    const { data, error } = await client.from("lesson_progress")
      .select("course_slug,lesson_slug,current_activity_id,completed_activity_ids,completed_at,updated_at")
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
  // Static fallback: use the curriculum map.
  const staticCurrent = Object.entries(programmingLessonStateBySlug).find(([, s]) => s === "current")?.[0] ?? "variables";
  return { courseSlug: "programming", lessonSlug: staticCurrent, currentActivityId: null, completedActivityIds: [], totalActivities: getLessonDefinition(staticCurrent)?.activities.length ?? 0, completedAt: null, updatedAt: new Date().toISOString() };
}

export { validateProgressInput };

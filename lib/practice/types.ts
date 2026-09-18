// Practice progress types and request validation — mirrors lib/progress/types.ts.

export type PracticeAttemptStatus = "correct" | "incorrect" | "partial";

export type PersistedPracticeAttempt = {
  attemptId: string;
  status: PracticeAttemptStatus;
  misconception: string | null;
  // Optional for backward compatibility with rows saved before answer resume.
  answer?: string;
};

// Per-topic Learning Log decision, keyed by lesson slug — mirrors the lesson
// flow's learningLogStatus, one entry per practiced topic.
export type PracticeLogStatus = "pending" | "saved" | "skipped";

export type PersistedPracticeState = {
  attempts: Record<string, PersistedPracticeAttempt>;
  logStatus: Record<string, PracticeLogStatus>;
};

export const emptyPersistedPracticeState: PersistedPracticeState = {
  attempts: {},
  logStatus: {},
};

export type PracticeProgress = {
  id: string;
  user_id: string | null;
  local_user_id: string;
  course_slug: string;
  current_exercise_id: string | null;
  completed_exercise_ids: string[];
  progress_state: PersistedPracticeState;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PracticeProgressInput = {
  courseSlug: string;
  currentExerciseId?: string | null;
  completedExerciseIds?: string[];
  progressState?: PersistedPracticeState;
  completedAt?: string | null;
};

const attemptStatuses: readonly PracticeAttemptStatus[] = ["correct", "incorrect", "partial"];
const logStatuses: readonly PracticeLogStatus[] = ["pending", "saved", "skipped"];

function validatePersistedState(value: unknown): PersistedPracticeState | null {
  if (value === undefined) return emptyPersistedPracticeState;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const state = value as Record<string, unknown>;
  if (Object.keys(state).some((key) => !["attempts", "logStatus"].includes(key))) return null;
  const attempts: Record<string, PersistedPracticeAttempt> = {};
  if (state.attempts !== undefined) {
    if (!state.attempts || typeof state.attempts !== "object" || Array.isArray(state.attempts)) return null;
    const entries = Object.entries(state.attempts as Record<string, unknown>);
    if (entries.length > 60) return null;
    for (const [exerciseId, value] of entries) {
      if (!exerciseId || exerciseId.length > 80 || !value || typeof value !== "object" || Array.isArray(value)) return null;
      const attempt = value as Record<string, unknown>;
      if (Object.keys(attempt).some((key) => !["attemptId", "status", "misconception", "answer"].includes(key)) ||
          typeof attempt.attemptId !== "string" || !attempt.attemptId || attempt.attemptId.length > 100 ||
          typeof attempt.status !== "string" || !attemptStatuses.includes(attempt.status as PracticeAttemptStatus) ||
          (attempt.answer !== undefined &&
           (typeof attempt.answer !== "string" || !attempt.answer.trim() || attempt.answer.length > 2_000)) ||
          (attempt.misconception !== null && attempt.misconception !== undefined &&
           (typeof attempt.misconception !== "string" || !attempt.misconception || attempt.misconception.length > 60))) return null;
      attempts[exerciseId] = {
        attemptId: attempt.attemptId,
        status: attempt.status as PracticeAttemptStatus,
        misconception: typeof attempt.misconception === "string" ? attempt.misconception : null,
        answer: typeof attempt.answer === "string" ? attempt.answer : undefined,
      };
    }
  }
  const logStatus: Record<string, PracticeLogStatus> = {};
  if (state.logStatus !== undefined) {
    if (!state.logStatus || typeof state.logStatus !== "object" || Array.isArray(state.logStatus)) return null;
    const entries = Object.entries(state.logStatus as Record<string, unknown>);
    if (entries.length > 10) return null;
    for (const [lessonSlug, value] of entries) {
      if (!lessonSlug || lessonSlug.length > 60 ||
          typeof value !== "string" || !logStatuses.includes(value as PracticeLogStatus)) return null;
      logStatus[lessonSlug] = value as PracticeLogStatus;
    }
  }
  return { attempts, logStatus };
}

export function validatePracticeProgressInput(value: unknown): PracticeProgressInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (Object.keys(row).some((key) => !["courseSlug", "currentExerciseId", "completedExerciseIds", "progressState", "completedAt"].includes(key))) return null;
  if (typeof row.courseSlug !== "string" || !row.courseSlug.trim() || row.courseSlug.length > 60) return null;
  if (row.currentExerciseId !== undefined && row.currentExerciseId !== null && (typeof row.currentExerciseId !== "string" || !row.currentExerciseId || row.currentExerciseId.length > 80)) return null;
  if (row.completedExerciseIds !== undefined && (!Array.isArray(row.completedExerciseIds) || row.completedExerciseIds.length > 60 || row.completedExerciseIds.some((id) => typeof id !== "string" || !id || id.length > 80))) return null;
  const progressState = validatePersistedState(row.progressState);
  if (!progressState) return null;
  if (row.completedAt !== undefined && row.completedAt !== null &&
      (typeof row.completedAt !== "string" || !row.completedAt || row.completedAt.length > 100 || Number.isNaN(Date.parse(row.completedAt)))) return null;
  return {
    courseSlug: row.courseSlug.trim(),
    currentExerciseId: typeof row.currentExerciseId === "string" ? row.currentExerciseId : row.currentExerciseId ?? null,
    completedExerciseIds: Array.isArray(row.completedExerciseIds) ? row.completedExerciseIds as string[] : [],
    progressState,
    completedAt: typeof row.completedAt === "string" ? row.completedAt : null,
  };
}

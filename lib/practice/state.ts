import { emptyPersistedPracticeState, type PersistedPracticeAttempt, type PersistedPracticeState, type PracticeLogStatus } from "./types";

// Pure practice progress state transitions — mirrors lib/progress/state.ts.

export type RuntimePracticeState = {
  currentExerciseId: string | null;
  completedExerciseIds: string[];
  attempts: Record<string, PersistedPracticeAttempt>;
  logStatus: Record<string, PracticeLogStatus>;
  completedAt: string | null;
  isLoaded: boolean;
};

export type SavedPracticeState = {
  current_exercise_id: string | null;
  completed_exercise_ids: string[];
  progress_state?: PersistedPracticeState;
  completed_at: string | null;
};

export function freshPracticeState(isLoaded = false): RuntimePracticeState {
  return {
    currentExerciseId: null,
    completedExerciseIds: [],
    attempts: {},
    logStatus: {},
    completedAt: null,
    isLoaded,
  };
}

export function hydratePracticeState(saved: SavedPracticeState | null): RuntimePracticeState {
  if (!saved) return freshPracticeState(true);
  const persisted = saved.progress_state ?? emptyPersistedPracticeState;
  return {
    currentExerciseId: saved.current_exercise_id ?? null,
    completedExerciseIds: saved.completed_exercise_ids ?? [],
    attempts: persisted.attempts ?? {},
    logStatus: persisted.logStatus ?? {},
    completedAt: saved.completed_at ?? null,
    isLoaded: true,
  };
}

export function resolvePracticeAttemptId(
  previousAttempt: PersistedPracticeAttempt | undefined,
  answer: string,
  createAttemptId: () => string,
): string {
  return previousAttempt?.answer === answer ? previousAttempt.attemptId : createAttemptId();
}

// Record one checked attempt. Only a correct attempt completes an exercise;
// the attempt id is stable so refreshed sessions never duplicate evidence.
export function recordPracticeAttempt(
  current: RuntimePracticeState,
  exerciseId: string,
  attempt: PersistedPracticeAttempt,
): RuntimePracticeState {
  return {
    ...current,
    completedExerciseIds: attempt.status === "correct"
      ? [...new Set([...current.completedExerciseIds, exerciseId])]
      : current.completedExerciseIds,
    attempts: { ...current.attempts, [exerciseId]: attempt },
  };
}

export function movePracticeExercise(current: RuntimePracticeState, exerciseId: string | null): RuntimePracticeState {
  return { ...current, currentExerciseId: exerciseId };
}

// When every exercise of a topic is completed, that topic becomes a pending
// Learning Log offer (if no decision has been recorded yet).
export function offerPracticeLog(
  current: RuntimePracticeState,
  lessonSlug: string,
  isTopicComplete: boolean,
): RuntimePracticeState {
  if (!isTopicComplete || current.logStatus[lessonSlug]) return current;
  return { ...current, logStatus: { ...current.logStatus, [lessonSlug]: "pending" } };
}

export function decidePracticeLog(current: RuntimePracticeState, lessonSlug: string, status: Exclude<PracticeLogStatus, "pending">): RuntimePracticeState {
  return { ...current, logStatus: { ...current.logStatus, [lessonSlug]: status } };
}

export function completePracticeSession(current: RuntimePracticeState, completedAt: string): RuntimePracticeState {
  return current.completedAt ? current : { ...current, completedAt };
}

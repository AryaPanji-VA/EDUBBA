import { emptyPersistedProgressState, type LearningLogOfferStatus, type PersistedAnswer, type PersistedProgressState } from "./types";

export type RuntimeProgressState = {
  step: number;
  completedActivityIds: string[];
  answers: Record<string, PersistedAnswer>;
  robinCheckComplete: boolean;
  learningLogStatus: LearningLogOfferStatus;
  complete: boolean;
  completedAt: string | null;
  isLoaded: boolean;
};

export type SavedProgressState = {
  current_activity_id: string | null;
  completed_activity_ids: string[];
  progress_state?: PersistedProgressState;
  completed_at: string | null;
};

export function freshProgressState(isLoaded = false): RuntimeProgressState {
  return {
    step: 0,
    completedActivityIds: [],
    answers: {},
    robinCheckComplete: false,
    learningLogStatus: "none",
    complete: false,
    completedAt: null,
    isLoaded,
  };
}

export function hydrateProgressState(saved: SavedProgressState | null, activityIds: string[]): RuntimeProgressState {
  if (!saved) return freshProgressState(true);
  const savedStep = saved.current_activity_id ? activityIds.indexOf(saved.current_activity_id) : -1;
  const persisted = saved.progress_state ?? emptyPersistedProgressState;
  return {
    step: savedStep >= 0 ? savedStep : 0,
    completedActivityIds: saved.completed_activity_ids ?? [],
    answers: persisted.answers ?? {},
    robinCheckComplete: persisted.robinCheckComplete ?? false,
    learningLogStatus: persisted.learningLogStatus ?? "none",
    complete: saved.completed_at != null,
    completedAt: saved.completed_at,
    isLoaded: true,
  };
}

export function advanceProgress(current: RuntimeProgressState, nextStep: number, activityIds: string[]): RuntimeProgressState {
  const completedActivityIds = nextStep > current.step
    ? [...new Set([...current.completedActivityIds, activityIds[current.step]])]
    : current.completedActivityIds;
  return { ...current, step: nextStep, completedActivityIds };
}

export function submitProgressAnswer(current: RuntimeProgressState, activityId: string, answer: PersistedAnswer): RuntimeProgressState {
  return {
    ...current,
    completedActivityIds: [...new Set([...current.completedActivityIds, activityId])],
    answers: { ...current.answers, [activityId]: answer },
  };
}

export function completeLessonProgress(current: RuntimeProgressState, activityId: string, completedAt: string): RuntimeProgressState {
  return {
    ...current,
    completedActivityIds: [...new Set([...current.completedActivityIds, activityId])],
    learningLogStatus: "pending",
    complete: true,
    completedAt,
  };
}

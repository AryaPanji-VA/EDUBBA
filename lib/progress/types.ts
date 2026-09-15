// Lesson Progress types and request validation.

export type PersistedAnswer = { value: string; attemptId: string };
export type LearningLogOfferStatus = "none" | "pending" | "saved" | "skipped";

export type PersistedProgressState = {
  answers: Record<string, PersistedAnswer>;
  robinCheckComplete: boolean;
  learningLogStatus: LearningLogOfferStatus;
};

export const emptyPersistedProgressState: PersistedProgressState = {
  answers: {},
  robinCheckComplete: false,
  learningLogStatus: "none",
};

export type LessonProgress = {
  id: string;
  user_id: string | null;
  course_slug: string;
  lesson_slug: string;
  current_activity_id: string | null;
  completed_activity_ids: string[];
  progress_state: PersistedProgressState;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LessonProgressInput = {
  lessonSlug: string;
  courseSlug: string;
  currentActivityId?: string | null;
  completedActivityIds?: string[];
  progressState?: PersistedProgressState;
  completedAt?: string | null;
};

export type CurrentLesson = {
  courseSlug: string;
  lessonSlug: string;
  currentActivityId: string | null;
  completedActivityIds: string[];
  totalActivities: number;
  completedAt: string | null;
  updatedAt: string;
};

function validatePersistedState(value: unknown): PersistedProgressState | null {
  if (value === undefined) return emptyPersistedProgressState;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const state = value as Record<string, unknown>;
  if (Object.keys(state).some((key) => !["answers", "robinCheckComplete", "learningLogStatus"].includes(key))) return null;
  if (!state.answers || typeof state.answers !== "object" || Array.isArray(state.answers)) return null;
  const answerEntries = Object.entries(state.answers as Record<string, unknown>);
  if (answerEntries.length > 30) return null;
  const answers: Record<string, PersistedAnswer> = {};
  for (const [activityId, value] of answerEntries) {
    if (!activityId || activityId.length > 60 || !value || typeof value !== "object" || Array.isArray(value)) return null;
    const answer = value as Record<string, unknown>;
    if (Object.keys(answer).some((key) => !["value", "attemptId"].includes(key)) ||
        typeof answer.value !== "string" || !answer.value.trim() || answer.value.length > 2_000 ||
        typeof answer.attemptId !== "string" || !answer.attemptId || answer.attemptId.length > 100) return null;
    answers[activityId] = { value: answer.value, attemptId: answer.attemptId };
  }
  if (typeof state.robinCheckComplete !== "boolean" ||
      !["none", "pending", "saved", "skipped"].includes(String(state.learningLogStatus))) return null;
  return {
    answers,
    robinCheckComplete: state.robinCheckComplete,
    learningLogStatus: state.learningLogStatus as LearningLogOfferStatus,
  };
}

export function validateProgressInput(value: unknown): LessonProgressInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (Object.keys(row).some((key) => !["lessonSlug", "courseSlug", "currentActivityId", "completedActivityIds", "progressState", "completedAt"].includes(key))) return null;
  if (typeof row.lessonSlug !== "string" || !row.lessonSlug.trim() || row.lessonSlug.length > 60) return null;
  if (typeof row.courseSlug !== "string" || !row.courseSlug.trim() || row.courseSlug.length > 60) return null;
  if (row.currentActivityId !== undefined && row.currentActivityId !== null && (typeof row.currentActivityId !== "string" || row.currentActivityId.length > 60)) return null;
  if (row.completedActivityIds !== undefined && (!Array.isArray(row.completedActivityIds) || row.completedActivityIds.length > 30 || row.completedActivityIds.some((item) => typeof item !== "string" || item.length > 60))) return null;
  const progressState = validatePersistedState(row.progressState);
  if (!progressState) return null;
  if (row.completedAt !== undefined && row.completedAt !== null &&
      (typeof row.completedAt !== "string" || row.completedAt.length > 100 || Number.isNaN(Date.parse(row.completedAt)))) return null;
  return {
    lessonSlug: row.lessonSlug.trim(),
    courseSlug: row.courseSlug.trim(),
    currentActivityId: typeof row.currentActivityId === "string" ? row.currentActivityId : row.currentActivityId ?? null,
    completedActivityIds: Array.isArray(row.completedActivityIds) ? row.completedActivityIds as string[] : [],
    progressState,
    completedAt: typeof row.completedAt === "string" ? row.completedAt : null,
  };
}

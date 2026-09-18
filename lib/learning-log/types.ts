// Learning Log types and validation — mirrors lib/memory/types.ts pattern.

export type LogIntent =
  | { type: "normal" }
  | { type: "save_log" }
  | { type: "recall_log" }
  | { type: "continue_learning" };

export type LearningLogInput = {
  courseSlug: string;
  lessonSlug: string;
  summary: string;
  conceptsLearned?: string[];
  weakConcepts?: string[];
  misconceptions?: string[];
  nextStep?: string;
  masterySnapshot?: Record<string, string>;
};

export type LearningLog = {
  id: string;
  user_id: string | null;
  local_user_id: string;
  course_slug: string;
  lesson_slug: string;
  summary: string;
  concepts_learned: string[] | null;
  weak_concepts: string[] | null;
  misconceptions: string[] | null;
  next_step: string | null;
  mastery_snapshot: Record<string, string> | null;
  created_at: string;
  updated_at: string;
};

export type LearningLogSummary = {
  id: string;
  lesson_slug: string;
  summary: string;
  concepts_learned: string[];
  weak_concepts: string[];
  next_step: string | null;
  created_at: string;
};

export function validateLearningLog(value: unknown): LearningLogInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (Object.keys(row).some((key) => !["courseSlug", "lessonSlug", "summary", "conceptsLearned", "weakConcepts", "misconceptions", "nextStep", "masterySnapshot"].includes(key)))
    return null;
  if (typeof row.courseSlug !== "string" || !row.courseSlug.trim() || row.courseSlug.length > 60) return null;
  if (typeof row.lessonSlug !== "string" || !row.lessonSlug.trim() || row.lessonSlug.length > 60) return null;
  if (typeof row.summary !== "string" || !row.summary.trim() || row.summary.length > 2000) return null;
  if (row.conceptsLearned !== undefined && (!Array.isArray(row.conceptsLearned) || row.conceptsLearned.length > 20 || row.conceptsLearned.some((v) => typeof v !== "string"))) return null;
  if (row.weakConcepts !== undefined && (!Array.isArray(row.weakConcepts) || row.weakConcepts.length > 20 || row.weakConcepts.some((v) => typeof v !== "string"))) return null;
  if (row.misconceptions !== undefined && (!Array.isArray(row.misconceptions) || row.misconceptions.length > 10 || row.misconceptions.some((v) => typeof v !== "string"))) return null;
  if (row.nextStep !== undefined && (typeof row.nextStep !== "string" || row.nextStep.length > 500)) return null;
  if (row.masterySnapshot !== undefined && (typeof row.masterySnapshot !== "object" || Array.isArray(row.masterySnapshot))) return null;
  return {
    courseSlug: row.courseSlug.trim(),
    lessonSlug: row.lessonSlug.trim(),
    summary: row.summary.trim(),
    conceptsLearned: Array.isArray(row.conceptsLearned) ? row.conceptsLearned : undefined,
    weakConcepts: Array.isArray(row.weakConcepts) ? row.weakConcepts : undefined,
    misconceptions: Array.isArray(row.misconceptions) ? row.misconceptions : undefined,
    nextStep: typeof row.nextStep === "string" ? row.nextStep : undefined,
    masterySnapshot: typeof row.masterySnapshot === "object" && !Array.isArray(row.masterySnapshot) ? row.masterySnapshot as Record<string, string> : undefined,
  };
}

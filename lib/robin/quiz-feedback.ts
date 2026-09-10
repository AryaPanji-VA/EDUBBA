import type { LessonActivity } from "@/content/lessons/activities";

export const quizMisconceptions = [
  "first_assignment_persists",
  "assignment_history",
  "reassignment_invalid",
  "prints_name_text",
  "declaration_required",
] as const;

export type QuizFeedbackRequest = {
  activityId: string;
  lessonSlug: string;
  language: "id" | "en";
  learnerAnswer: string;
  attemptId: string;
};

export type QuizGrading = {
  isCorrect: boolean;
  concept: string;
  learningPurpose: string;
  likelyMisconception: string | null;
  activityType: LessonActivity["type"];
  options?: string[];
  correctAnswer?: string;
};

export type QuizFollowUp = { prompt: string; code: string; options: string[] };

export type QuizFeedbackResult = {
  feedback: string;
  followUp: QuizFollowUp | null;
  diagnosedMisconception: string | null;
};

export function validateQuizFeedbackRequest(value: unknown): QuizFeedbackRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (Object.keys(row).some((key) => !["activityId", "lessonSlug", "language", "learnerAnswer", "attemptId"].includes(key)) ||
      typeof row.activityId !== "string" || !row.activityId.trim() ||
      typeof row.lessonSlug !== "string" || !row.lessonSlug.trim() ||
      (row.language !== "id" && row.language !== "en") ||
      typeof row.learnerAnswer !== "string" || !row.learnerAnswer.trim() || row.learnerAnswer.length > 2_000 ||
      typeof row.attemptId !== "string" || !row.attemptId.trim() || row.attemptId.length > 100) return null;
  return { activityId: row.activityId.trim(), lessonSlug: row.lessonSlug.trim(), language: row.language, learnerAnswer: row.learnerAnswer, attemptId: row.attemptId.trim() };
}

export function gradeActivity(activity: LessonActivity, learnerAnswer: string): QuizGrading | null {
  const answer = learnerAnswer.trim();
  if (activity.type === "predict") {
    if (!activity.correctAnswer || !activity.options) return null;
    const isCorrect = answer === activity.correctAnswer;
    return {
      isCorrect, concept: activity.concept,
      learningPurpose: activity.learningPurpose ?? "Quiz feedback.",
      likelyMisconception: activity.misconceptionsByAnswer?.[answer] ?? null,
      activityType: activity.type, options: activity.options, correctAnswer: activity.correctAnswer,
    };
  }
  if (activity.type === "practice") {
    return {
      isCorrect: activity.checkAnswer ? activity.checkAnswer(answer) : false, concept: activity.concept,
      learningPurpose: activity.learningPurpose ?? "Quiz feedback.",
      likelyMisconception: null, activityType: activity.type,
    };
  }
  return null;
}

export function parseQuizFeedbackResult(text: string, isCorrect: boolean): QuizFeedbackResult {
  if (text.length > 6_000) throw new Error("Invalid feedback.");
  const row = JSON.parse(text.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, "$1"));
  if (!row || typeof row !== "object" || Array.isArray(row) || Object.keys(row).length !== 3 ||
      Object.keys(row).some((key) => !["feedback", "followUp", "diagnosedMisconception"].includes(key))) {
    throw new Error("Invalid feedback.");
  }
  if (typeof row.feedback !== "string" || !row.feedback.trim() || row.feedback.length > 1_200 ||
      /https?:\/\/|\b(?:sb_secret_|sk-)|\b\d+(?:\.\d+)?\s*%/i.test(row.feedback)) throw new Error("Invalid feedback.");
  if (row.diagnosedMisconception !== null &&
      (typeof row.diagnosedMisconception !== "string" || !(quizMisconceptions as readonly string[]).includes(row.diagnosedMisconception))) {
    throw new Error("Invalid feedback.");
  }
  if (row.followUp !== null) {
    if (!row.followUp || typeof row.followUp !== "object" || Array.isArray(row.followUp) ||
        Object.keys(row.followUp).length !== 3 ||
        Object.keys(row.followUp).some((key) => !["prompt", "code", "options"].includes(key))) throw new Error("Invalid feedback.");
    const followUp = row.followUp as Record<string, unknown>;
    if (typeof followUp.prompt !== "string" || !followUp.prompt.trim() || followUp.prompt.length > 300 ||
        typeof followUp.code !== "string" || followUp.code.length > 200 ||
        !Array.isArray(followUp.options) || followUp.options.length < 2 || followUp.options.length > 4 ||
        new Set(followUp.options).size !== followUp.options.length ||
        followUp.options.some((option: unknown) => typeof option !== "string" || option.length > 100)) throw new Error("Invalid feedback.");
  }
  if (isCorrect && row.followUp !== null) throw new Error("Invalid feedback.");
  return {
    feedback: row.feedback.trim(),
    followUp: row.followUp, diagnosedMisconception: row.diagnosedMisconception,
  };
}

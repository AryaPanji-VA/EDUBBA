export type LessonActivity = {
  id: string;
  type: "intro" | "explain" | "example" | "predict" | "practice" | "formalize" | "robin_check" | "connect";
  title: string;
  concept: string;
  content: string[];
  code?: string;
  options?: string[];
  optionLabels?: Record<string, string>;
  correctAnswer?: string;
  explanation?: string;
  learningPurpose?: string;
  misconceptionsByAnswer?: Record<string, string>;
  // Lesson-owned deterministic checker for free-text practice activities.
  // Absent means the answer cannot be verified and must not count as correct.
  checkAnswer?: (answer: string) => boolean;
};

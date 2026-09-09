export type LessonActivity = {
  id: string;
  type: "intro" | "explain" | "example" | "predict" | "practice" | "formalize" | "robin_check" | "connect";
  title: string;
  concept: string;
  content: string[];
  code?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
};

// A narrow exercise checker, not a Python interpreter. Keep case and token boundaries.
export function isListenersAnswerCorrect(answer: string): boolean {
  return /^listeners\s*=\s*(150|listeners\s*\+\s*30)$/.test(answer.trim());
}

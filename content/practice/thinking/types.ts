export type ThinkingActivityType =
  | "decomposition"
  | "pattern-recognition"
  | "abstraction"
  | "algorithm-ordering"
  | "trace-program"
  | "pseudocode"
  | "debug-reasoning";

export type ThinkingOption = {
  id: string;
  label: string;
  misconception?: { code: string; note: string };
};

export type ThinkingInteraction =
  | { kind: "single-choice"; options: ThinkingOption[]; correctOptionId: string }
  | { kind: "multi-select"; options: ThinkingOption[]; correctOptionIds: string[]; partialFeedback: string }
  | { kind: "ordering"; steps: ThinkingOption[]; correctOrder: string[] }
  | { kind: "fields"; fields: { id: string; label: string; placeholder?: string; expected: string }[]; partialFeedback: string };

export type ThinkingMasteryEvidence = {
  lessonSlug: "variables" | "data-types" | "conditionals" | "loops" | "functions";
  concept: string;
};

export type ThinkingActivity = {
  id: string;
  title: string;
  type: ThinkingActivityType;
  lessonSlugs: ("variables" | "data-types" | "conditionals" | "loops" | "functions")[];
  concepts: string[];
  difficulty: "beginner";
  prompt: string;
  instruction: string;
  hint: string;
  explanation: string;
  interaction: ThinkingInteraction;
  masteryEvidence: ThinkingMasteryEvidence[];
  code?: string;
  sandboxCode?: string;
};

export type ThinkingSubmission =
  | { kind: "single-choice"; optionId: string }
  | { kind: "multi-select"; selectedIds: string[] }
  | { kind: "ordering"; orderedIds: string[] }
  | { kind: "fields"; values: Record<string, string> };

import type { LessonMasteryConfig } from "@/lib/mastery/types";

const userInputConcepts = ["user_input", "input_returns_string", "input_conversion"] as const;

const activityConceptMap: Record<string, string> = {
  why_input: "user_input",
  input_intuition: "user_input",
  input_vs_output: "user_input",
  input_returns_string: "input_returns_string",
  input_conversion: "input_conversion",
  predict_input_type: "input_returns_string",
  predict_compact: "input_conversion",
  predict_spot: "input_returns_string",
  explain_input: "user_input",
};

const robinCheckConcepts: string[] = ["user_input", "input_returns_string", "input_conversion"];

export const userInputMasteryConfig: LessonMasteryConfig = {
  concepts: userInputConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_input: ["user_input"],
  input_intuition: ["user_input"],
  input_vs_output: ["user_input"],
  input_returns_string: ["input_returns_string"],
  input_conversion: ["input_conversion", "input_returns_string"],
  predict_input_type: ["input_returns_string"],
  predict_compact: ["input_conversion"],
  predict_spot: ["input_returns_string"],
  explain_input: ["user_input", "input_returns_string", "input_conversion"],
};

export const userInputRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["user_input", "input_returns_string", "input_conversion"]; },
  chatConcepts(message: string): string[] {
    if (/\b(convert|konversi|int\(|float\(|jadi angka|two-step|compact)\b/i.test(message)) return ["input_conversion"];
    if (/\b(str|string|type|tipe|digit|angka yang diketik)\b/i.test(message)) return ["input_returns_string"];
    if (/\b(input|prompt|user|masuk|print)\b/i.test(message)) return ["user_input"];
    return [];
  },
};

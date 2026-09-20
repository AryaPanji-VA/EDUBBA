import type { LessonMasteryConfig } from "@/lib/mastery/types";

const tryExceptBasicsConcepts = ["error_as_signal", "try_except_flow", "valueerror_handling"] as const;

const activityConceptMap: Record<string, string> = {
  why_errors: "error_as_signal",
  crash_model: "error_as_signal",
  try_except_flow: "try_except_flow",
  error_as_signal: "error_as_signal",
  valueerror_handling: "valueerror_handling",
  handle_valueerror: "valueerror_handling",
  explain_try_except: "try_except_flow",
};

const robinCheckConcepts: string[] = ["error_as_signal", "try_except_flow", "valueerror_handling"];

export const tryExceptBasicsMasteryConfig: LessonMasteryConfig = {
  concepts: tryExceptBasicsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_errors: ["error_as_signal"],
  crash_model: ["error_as_signal", "try_except_flow"],
  try_except_flow: ["try_except_flow"],
  error_as_signal: ["error_as_signal"],
  valueerror_handling: ["valueerror_handling"],
  handle_valueerror: ["try_except_flow", "valueerror_handling"],
  explain_try_except: ["error_as_signal", "try_except_flow", "valueerror_handling"],
};

export const tryExceptBasicsRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["error_as_signal", "try_except_flow", "valueerror_handling"]; },
  chatConcepts(message: string): string[] {
    if (/\b(valueerror|value\s*error|konversi|convert)\b|\bint\b|int\s*\(/i.test(message)) return ["valueerror_handling"];
    if (/\b(try|except|tangani|fallback)\b/i.test(message)) return ["try_except_flow"];
    if (/\b(crash|berhenti|error|gagal)\b/i.test(message)) return ["error_as_signal"];
    return [];
  },
};

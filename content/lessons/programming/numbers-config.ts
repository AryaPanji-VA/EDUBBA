import type { LessonMasteryConfig } from "@/lib/mastery/types";

const numbersConcepts = ["numeric_values", "integer_float", "basic_calculation"] as const;

const activityConceptMap: Record<string, string> = {
  why_numbers: "numeric_values",
  numbers_intuition: "integer_float",
  numeric_values: "numeric_values",
  integer_float: "integer_float",
  basic_calculation: "basic_calculation",
  explain_numbers: "numeric_values",
};

const robinCheckConcepts: string[] = ["numeric_values", "integer_float", "basic_calculation"];

export const numbersMasteryConfig: LessonMasteryConfig = {
  concepts: numbersConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_numbers: ["numeric_values"],
  numbers_intuition: ["integer_float"],
  numeric_values: ["numeric_values", "integer_float"],
  integer_float: ["integer_float"],
  basic_calculation: ["basic_calculation", "numeric_values"],
  explain_numbers: ["numeric_values", "integer_float", "basic_calculation"],
};

export const numbersRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["numeric_values", "integer_float", "basic_calculation"]; },
  chatConcepts(message: string): string[] {
    if (/\b(hitung|hitungan|calculation|kalkulasi|\+|\*|tambah|kurang|bagi)\b/i.test(message)) return ["basic_calculation"];
    if (/\b(int|float|desimal|bulat|5\.0|titik)\b/i.test(message)) return ["integer_float"];
    if (/\b(number|angka|numeric|score|temperature|nilai angka)\b/i.test(message)) return ["numeric_values"];
    return [];
  },
};

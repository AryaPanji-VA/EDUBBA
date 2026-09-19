import type { LessonMasteryConfig } from "@/lib/mastery/types";

const stringsConcepts = ["string_value", "string_concatenation", "string_indexing"] as const;

const activityConceptMap: Record<string, string> = {
  why_strings: "string_value",
  strings_intuition: "string_value",
  string_value: "string_value",
  string_concatenation: "string_concatenation",
  string_indexing: "string_indexing",
  explain_strings: "string_value",
};

const robinCheckConcepts: string[] = ["string_value", "string_concatenation", "string_indexing"];

export const stringsMasteryConfig: LessonMasteryConfig = {
  concepts: stringsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_strings: ["string_value"],
  strings_intuition: ["string_value", "string_indexing"],
  string_value: ["string_value"],
  string_concatenation: ["string_concatenation"],
  string_indexing: ["string_indexing"],
  explain_strings: ["string_value", "string_concatenation", "string_indexing"],
};

export const stringsRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["string_value", "string_concatenation", "string_indexing"]; },
  chatConcepts(message: string): string[] {
    if (/\b(index|indeks|posisi|huruf ke-|character ke|\[0\]|\[1\]|mulai dari 0)\b/i.test(message)) return ["string_indexing"];
    if (/\b(gabung|concat|menyatukan|menempel)\b|\+/i.test(message)) return ["string_concatenation"];
    if (/\b(string|teks|kutip|quote|len|panjang)\b/i.test(message)) return ["string_value"];
    return [];
  },
};

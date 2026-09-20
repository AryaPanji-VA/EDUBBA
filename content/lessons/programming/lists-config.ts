import type { LessonMasteryConfig } from "@/lib/mastery/types";

const listsConcepts = ["list_literal", "zero_based_index", "list_mutation"] as const;

const activityConceptMap: Record<string, string> = {
  why_list: "list_literal",
  list_intuition: "list_literal",
  zero_index: "zero_based_index",
  read_by_index: "zero_based_index",
  list_mutation: "list_mutation",
  list_length: "zero_based_index",
  list_write: "list_literal",
  explain_list: "list_literal",
};

const robinCheckConcepts: string[] = ["list_literal", "zero_based_index", "list_mutation"];

export const listsMasteryConfig: LessonMasteryConfig = {
  concepts: listsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_list: ["list_literal"],
  list_intuition: ["list_literal"],
  zero_index: ["zero_based_index"],
  read_by_index: ["zero_based_index"],
  list_mutation: ["list_mutation", "zero_based_index"],
  list_length: ["zero_based_index", "list_literal"],
  list_write: ["list_literal", "zero_based_index"],
  explain_list: ["list_literal", "zero_based_index", "list_mutation"],
};

export const listsRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["list_literal", "zero_based_index", "list_mutation"]; },
  chatConcepts(message: string): string[] {
    if (/\b(mutab|ubah item|ganti item|replace|mutate|update|names\[|reassign)\b/i.test(message)) return ["list_mutation"];
    if (/\b(index|indeks|zero|nol|posisi|urutan|order|len|panjang|hitung)\b/i.test(message)) return ["zero_based_index"];
    if (/\b(list|daftar|\[\]|item|elemen|element|nama)\b/i.test(message)) return ["list_literal"];
    return [];
  },
};

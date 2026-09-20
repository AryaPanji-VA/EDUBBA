import type { LessonMasteryConfig } from "@/lib/mastery/types";

const tuplesConcepts = ["tuple_literal", "tuple_indexing", "tuple_immutable"] as const;

const activityConceptMap: Record<string, string> = {
  why_tuple: "tuple_literal",
  tuple_intuition: "tuple_literal",
  tuple_vs_list: "tuple_immutable",
  tuple_indexing: "tuple_indexing",
  tuple_immutable: "tuple_immutable",
  tuple_choice: "tuple_immutable",
  tuple_write: "tuple_literal",
  explain_tuple: "tuple_literal",
};

const robinCheckConcepts: string[] = ["tuple_literal", "tuple_indexing", "tuple_immutable"];

export const tuplesMasteryConfig: LessonMasteryConfig = {
  concepts: tuplesConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_tuple: ["tuple_literal"],
  tuple_intuition: ["tuple_literal"],
  tuple_vs_list: ["tuple_immutable", "tuple_literal"],
  tuple_indexing: ["tuple_indexing"],
  tuple_immutable: ["tuple_immutable"],
  tuple_choice: ["tuple_immutable", "tuple_literal"],
  tuple_write: ["tuple_literal", "tuple_indexing"],
  explain_tuple: ["tuple_literal", "tuple_indexing", "tuple_immutable"],
};

export const tuplesRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["tuple_literal", "tuple_indexing", "tuple_immutable"]; },
  chatConcepts(message: string): string[] {
    if (/\b(immutable|fixed|tetap|ubah|ganti|change|assign|refuse|ditolak|error)\b/i.test(message)) return ["tuple_immutable"];
    if (/\b(index|indeks|point\[|read|baca|print)\b/i.test(message)) return ["tuple_indexing"];
    if (/\b(tuple|kurung|parentheses|bracket|literal|buat)\b/i.test(message)) return ["tuple_literal"];
    return [];
  },
};

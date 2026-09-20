import type { LessonMasteryConfig } from "@/lib/mastery/types";

const setsConcepts = ["set_uniqueness", "set_membership", "set_unordered"] as const;

const activityConceptMap: Record<string, string> = {
  why_sets: "set_uniqueness",
  set_intuition: "set_uniqueness",
  unique_model: "set_uniqueness",
  set_uniqueness: "set_uniqueness",
  set_membership: "set_membership",
  set_unordered: "set_unordered",
  build_set: "set_uniqueness",
  explain_set: "set_uniqueness",
};

const robinCheckConcepts: string[] = ["set_uniqueness", "set_membership", "set_unordered"];

export const setsMasteryConfig: LessonMasteryConfig = {
  concepts: setsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_sets: ["set_uniqueness"],
  set_intuition: ["set_uniqueness", "set_membership"],
  unique_model: ["set_uniqueness", "set_membership", "set_unordered"],
  set_uniqueness: ["set_uniqueness"],
  set_membership: ["set_membership"],
  set_unordered: ["set_unordered"],
  build_set: ["set_uniqueness", "set_membership"],
  explain_set: ["set_uniqueness", "set_membership", "set_unordered"],
};

export const setsRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["set_uniqueness", "set_membership", "set_unordered"]; },
  chatConcepts(message: string): string[] {
    if (/\b(urutan|order|ordered|unordered|index|indeks|posisi|positional)\b|tags\s*\[/i.test(message)) return ["set_unordered"];
    if (/\b(unique|unik|duplikat|dobel|ganda|collapse|len\s*\()\b/i.test(message)) return ["set_uniqueness"];
    if (/\b(membership|\bin\b|ada nggak|nggak ada)\b/i.test(message)) return ["set_membership"];
    if (/\b(set|himpunan)\b|\{/i.test(message)) return ["set_uniqueness", "set_membership"];
    return [];
  },
};

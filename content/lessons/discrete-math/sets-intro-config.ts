import type { LessonMasteryConfig } from "@/lib/mastery/types";

// Sets intro lesson-owned mastery configuration (standard lesson).

const setsIntroConcepts = ["set", "membership", "subset"] as const;

const activityConceptMap: Record<string, string> = {
  why_sets: "set",
  set_intuition: "set",
  notation_intro: "membership",
  membership_check: "membership",
  subset_check: "subset",
  element_vs_subset: "subset",
  empty_set: "subset",
  applying_relations: "membership",
  explain_sets: "set",
};

const robinCheckConcepts: string[] = ["set", "membership", "subset"];

export const setsIntroMasteryConfig: LessonMasteryConfig = {
  concepts: setsIntroConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_sets: ["set"],
  set_intuition: ["set"],
  notation_intro: ["membership", "set"],
  membership_check: ["membership"],
  subset_check: ["subset"],
  element_vs_subset: ["subset", "membership"],
  empty_set: ["subset"],
  applying_relations: ["membership"],
  explain_sets: ["set", "membership", "subset"],
};

export const setsIntroRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["set", "membership", "subset"]; },
  chatConcepts(message: string): string[] {
    if (/[⊆⊂]|subset|himpunan bagian/i.test(message)) return ["subset"];
    if (/[∈∉]|member|anggota|elemen/i.test(message)) return ["membership"];
    if (/\b(set|himpunan|kumpulan|empty set|himpunan kosong|∅)\b/i.test(message)) return ["set"];
    return [];
  },
};

import type { LessonMasteryConfig } from "@/lib/mastery/types";

const rangeLoopPatternsConcepts = ["range_sequence", "range_boundaries", "range_step"] as const;

const activityConceptMap: Record<string, string> = {
  why_range: "range_sequence",
  range_intuition: "range_sequence",
  predict_range3: "range_boundaries",
  predict_start: "range_boundaries",
  predict_step: "range_step",
  pattern_count: "range_sequence",
  explain_range: "range_boundaries",
};

const robinCheckConcepts: string[] = ["range_sequence", "range_boundaries", "range_step"];

export const rangeLoopPatternsMasteryConfig: LessonMasteryConfig = {
  concepts: rangeLoopPatternsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_range: ["range_sequence"],
  range_intuition: ["range_sequence"],
  predict_range3: ["range_boundaries", "range_sequence"],
  predict_start: ["range_boundaries"],
  predict_step: ["range_step", "range_boundaries"],
  pattern_count: ["range_sequence", "range_boundaries"],
  explain_range: ["range_sequence", "range_boundaries", "range_step"],
};

export const rangeLoopPatternsRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["range_sequence", "range_boundaries", "range_step"]; },
  chatConcepts(message: string): string[] {
    if (/\b(step|loncat|lompat|stride|melompat)\b/i.test(message)) return ["range_step"];
    if (/\b(stop|batas|boundary|excluded|include|ikut|inklusif|off-by-one|off by one|terakhir)\b/i.test(message)) return ["range_boundaries"];
    if (/\b(range|start|mulai|deret|sequence|iterasi|count|hitung|for)\b/i.test(message)) return ["range_sequence"];
    return [];
  },
};

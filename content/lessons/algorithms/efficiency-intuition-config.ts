import type { LessonMasteryConfig } from "@/lib/mastery/types";

const efficiencyIntuitionConcepts = ["growth_rate", "search_strategies"] as const;

const activityConceptMap: Record<string, string> = {
  why_efficiency: "growth_rate",
  efficiency_intuition: "growth_rate",
  linear_vs_binary: "search_strategies",
  growth_measure: "growth_rate",
  logarithmic_growth: "search_strategies",
  preconditions: "search_strategies",
  applying_growth: "growth_rate",
  explain_efficiency: "growth_rate",
};

const robinCheckConcepts: string[] = ["growth_rate"];

export const efficiencyIntuitionMasteryConfig: LessonMasteryConfig = {
  concepts: efficiencyIntuitionConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_efficiency: ["growth_rate"],
  efficiency_intuition: ["growth_rate"],
  linear_vs_binary: ["search_strategies", "growth_rate"],
  growth_measure: ["growth_rate"],
  logarithmic_growth: ["search_strategies"],
  preconditions: ["search_strategies"],
  applying_growth: ["growth_rate"],
  explain_efficiency: ["growth_rate", "search_strategies"],
};

export const efficiencyIntuitionRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["growth_rate"]; },
  chatConcepts(message: string): string[] {
    if (/\b(linear|linier|logarithm|logaritm|growth|pertumbuhan|big.?o|complexity)\b/i.test(message)) return ["growth_rate"];
    if (/\b(binary search|linear search|pencarian biner|sorted|urut)\b/i.test(message)) return ["search_strategies"];
    return [];
  },
};

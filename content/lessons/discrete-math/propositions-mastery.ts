import type { LessonMasteryConfig } from "@/lib/mastery/types";

// Propositions lesson-owned mastery configuration.
// The generic engine never needs to know what "conjunction" means.

const propositionsConcepts = ["proposition", "truth_value", "negation", "conjunction", "disjunction"] as const;

const activityConceptMap: Record<string, string> = {
  why_logic: "proposition",
  proposition_intuition: "proposition",
  proposition_symbols: "proposition",
  identifying_propositions: "proposition",
  proposition_truth_value: "truth_value",
  negation_intro: "negation",
  evaluating_negation: "negation",
  conjunction_table: "conjunction",
  evaluating_conjunction: "conjunction",
  disjunction_intro: "disjunction",
  evaluating_disjunction: "disjunction",
  explain_conjunction: "conjunction",
};

const robinCheckConcepts: string[] = ["proposition", "truth_value", "conjunction"];

export const propositionsMasteryConfig: LessonMasteryConfig = {
  concepts: propositionsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

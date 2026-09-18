import type { LessonMasteryConfig } from "@/lib/mastery/types";

const distributedBasicsConcepts = ["distribution_model", "failure_handling"] as const;

const activityConceptMap: Record<string, string> = {
  why_distributed: "distribution_model",
  db_intuition: "distribution_model",
  partial_failure: "failure_handling",
  message_passing: "distribution_model",
  failure_modes: "failure_handling",
  coordination_cost: "distribution_model",
  applying_ft: "failure_handling",
  explain_distributed: "distribution_model",
};

const robinCheckConcepts: string[] = ["distribution_model", "failure_handling"];

export const distributedBasicsMasteryConfig: LessonMasteryConfig = {
  concepts: distributedBasicsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_distributed: ["distribution_model"],
  db_intuition: ["distribution_model"],
  partial_failure: ["failure_handling"],
  message_passing: ["distribution_model"],
  failure_modes: ["failure_handling"],
  coordination_cost: ["distribution_model"],
  applying_ft: ["failure_handling"],
  explain_distributed: ["distribution_model", "failure_handling"],
};

export const distributedBasicsRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["distribution_model", "failure_handling"]; },
  chatConcepts(message: string): string[] {
    if (/\b(fail|gagal|crash|mati|toleran|partial)\b/i.test(message)) return ["failure_handling"];
    if (/\b(distribut|terdistribusi|message|pesan|server|replica|network)\b/i.test(message)) return ["distribution_model"];
    return [];
  },
};

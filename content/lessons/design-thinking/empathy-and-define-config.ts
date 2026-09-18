import type { LessonMasteryConfig } from "@/lib/mastery/types";

const empathyAndDefineConcepts = ["empathy", "problem_definition"] as const;

const activityConceptMap: Record<string, string> = {
  why_empathy: "empathy",
  empathy_intuition: "empathy",
  observation_vs_assumption: "empathy",
  classifying_statements: "empathy",
  pov_structure: "problem_definition",
  evaluating_pov: "problem_definition",
  applying_classification: "empathy",
  explain_empathy_define: "problem_definition",
};

const robinCheckConcepts: string[] = ["empathy", "problem_definition"];

export const empathyAndDefineMasteryConfig: LessonMasteryConfig = {
  concepts: empathyAndDefineConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_empathy: ["empathy"],
  empathy_intuition: ["empathy"],
  observation_vs_assumption: ["empathy"],
  classifying_statements: ["empathy"],
  pov_structure: ["problem_definition"],
  evaluating_pov: ["problem_definition"],
  applying_classification: ["empathy"],
  explain_empathy_define: ["empathy", "problem_definition"],
};

export const empathyAndDefineRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["empathy", "problem_definition"]; },
  chatConcepts(message: string): string[] {
    if (/\b(observasi|observation|asumsi|assumption|inference|interpretasi)\b/i.test(message)) return ["empathy"];
    if (/\b(pov|point of view|problem statement|define|definisi masalah)\b/i.test(message)) return ["problem_definition"];
    if (/\b(empath|empati|user research|wawancara|interview)\b/i.test(message)) return ["empathy"];
    return [];
  },
};

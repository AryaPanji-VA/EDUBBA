import type { LessonMasteryConfig } from "@/lib/mastery/types";

const whatIsAnAlgorithmConcepts = ["algorithm_definition", "algorithm_properties"] as const;

const activityConceptMap: Record<string, string> = {
  why_algorithm: "algorithm_definition",
  algorithm_intuition: "algorithm_definition",
  algorithm_vs_program: "algorithm_definition",
  ambiguity_check: "algorithm_properties",
  termination_check: "algorithm_properties",
  applying_properties: "algorithm_properties",
  explain_algorithm: "algorithm_definition",
};

const robinCheckConcepts: string[] = ["algorithm_definition", "algorithm_properties"];

export const whatIsAnAlgorithmMasteryConfig: LessonMasteryConfig = {
  concepts: whatIsAnAlgorithmConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_algorithm: ["algorithm_definition"],
  algorithm_intuition: ["algorithm_definition"],
  algorithm_vs_program: ["algorithm_definition"],
  ambiguity_check: ["algorithm_properties"],
  termination_check: ["algorithm_properties"],
  applying_properties: ["algorithm_properties"],
  explain_algorithm: ["algorithm_definition", "algorithm_properties"],
};

export const whatIsAnAlgorithmRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["algorithm_definition", "algorithm_properties"]; },
  chatConcepts(message: string): string[] {
    if (/\b(ambigu|ambigu|jelas|unambiguous|terminat|berhenti|selesai)\b/i.test(message)) return ["algorithm_properties"];
    if (/\b(algorithm|algoritma|program|pseudocode|procedure|prosedur)\b/i.test(message)) return ["algorithm_definition"];
    return [];
  },
};

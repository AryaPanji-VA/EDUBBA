import type { LessonMasteryConfig } from "@/lib/mastery/types";

// Variables lesson-owned mastery configuration.
// The generic engine never needs to know what "reassignment" means.

const variablesConcepts = ["variable", "assignment", "reassignment", "expression", "name_binding", "identifier_naming"] as const;

const activityConceptMap: Record<string, string> = {
  named_values: "variable",
  reading_a_name: "variable",
  assignment: "assignment",
  reassignment: "reassignment",
  name_binding: "name_binding",
};

const robinCheckConcepts: string[] = ["assignment", "name_binding", "variable"];

export const variablesMasteryConfig: LessonMasteryConfig = {
  concepts: variablesConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

import type { LessonMasteryConfig } from "@/lib/mastery/types";

const dataTypesConcepts = ["data_type", "integer", "float", "string", "boolean", "type_inspection"] as const;

const activityConceptMap: Record<string, string> = {
  data_type: "data_type",
  integer: "integer",
  float: "float",
  string: "string",
  boolean: "boolean",
  type_inspection: "type_inspection",
};

const checkConcepts: string[] = ["data_type", "string", "integer"];

export const dataTypesMasteryConfig: LessonMasteryConfig = {
  concepts: dataTypesConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: checkConcepts };
  },
};

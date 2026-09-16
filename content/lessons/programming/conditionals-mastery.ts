import type { LessonMasteryConfig } from "@/lib/mastery/types";

// Conditionals lesson-owned mastery configuration.
// The generic engine never needs to know what "branch selection" means.

const conditionalsConcepts = ["conditional_flow", "comparison_expression", "branch_selection", "input_conversion"] as const;

const activityConceptMap: Record<string, string> = {
  decision_making: "conditional_flow",
  if_else: "conditional_flow",
  branch_trace: "branch_selection",
  elif_chain: "branch_selection",
  comparison: "comparison_expression",
  writing_condition: "comparison_expression",
  input_condition: "input_conversion",
  conditional_flow: "conditional_flow",
  comparison_expression: "comparison_expression",
  branch_selection: "branch_selection",
  input_conversion: "input_conversion",
};

const checkConcepts: string[] = ["conditional_flow", "comparison_expression", "branch_selection"];

export const conditionalsMasteryConfig: LessonMasteryConfig = {
  concepts: conditionalsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: checkConcepts };
  },
};

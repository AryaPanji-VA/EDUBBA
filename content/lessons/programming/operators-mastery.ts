import type { LessonMasteryConfig } from "@/lib/mastery/types";

const operatorsConcepts = ["arithmetic_operations", "comparison_operators", "logical_operators", "operator_precedence"] as const;
const activityConceptMap: Record<string, string> = {
  operator_bridge: "comparison_operators", expression_model: "arithmetic_operations",
  precedence_trace: "operator_precedence", arithmetic_trace: "arithmetic_operations",
  comparison_trace: "comparison_operators", logical_trace: "logical_operators", writing_expression: "arithmetic_operations",
  operator_system: "operator_precedence", arithmetic_operations: "arithmetic_operations",
  comparison_operators: "comparison_operators", logical_operators: "logical_operators",
  operator_precedence: "operator_precedence",
};

export const operatorsMasteryConfig: LessonMasteryConfig = {
  concepts: operatorsConcepts,
  activityConceptToMastery: (concept) => activityConceptMap[concept] ?? null,
  robinCheckSignalToEvidence: (signal) => ({
    evidenceType: signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky",
    concepts: ["comparison_operators", "logical_operators", "operator_precedence"],
  }),
};

import type { LessonMasteryConfig } from "@/lib/mastery/types";

// Functions lesson-owned mastery configuration.
// The generic engine never needs to know what "parameters" means.

const functionsConcepts = ["function_definition", "function_call", "parameters_arguments", "return_values"] as const;

const activityConceptMap: Record<string, string> = {
  reuse_need: "function_definition",
  define_function: "function_definition",
  call_trace: "function_call",
  return_trace: "return_values",
  print_return_compare: "return_values",
  writing_function: "parameters_arguments",
  function_state: "function_call",
  function_definition: "function_definition",
  function_call: "function_call",
  parameters_arguments: "parameters_arguments",
  return_values: "return_values",
};

const checkConcepts: string[] = ["function_definition", "function_call", "return_values"];

export const functionsMasteryConfig: LessonMasteryConfig = {
  concepts: functionsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: checkConcepts };
  },
};

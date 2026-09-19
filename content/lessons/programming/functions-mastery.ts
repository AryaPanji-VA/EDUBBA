import type { LessonMasteryConfig } from "@/lib/mastery/types";

// Functions lesson-owned mastery configuration.
// The generic engine never needs to know what a "def" or a "call" means.
// parameters_arguments and return_values stay in `concepts` as legacy
// vocabulary (earlier mastery rows still validate) — the current lesson flow
// only produces evidence for definition and call.

const functionsConcepts = ["function_definition", "function_call", "parameters_arguments", "return_values"] as const;

const activityConceptMap: Record<string, string> = {
  reuse_need: "function_definition",
  define_function: "function_definition",
  call_trace: "function_call",
  definition_no_run: "function_definition",
  writing_function: "function_definition",
  function_state: "function_call",
  define_call_model: "function_definition",
  function_definition: "function_definition",
  function_call: "function_call",
};

const checkConcepts: string[] = ["function_definition", "function_call"];

export const functionsMasteryConfig: LessonMasteryConfig = {
  concepts: functionsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: checkConcepts };
  },
};

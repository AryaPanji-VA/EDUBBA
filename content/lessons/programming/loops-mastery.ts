import type { LessonMasteryConfig } from "@/lib/mastery/types";

// Loops lesson-owned mastery configuration.
// The generic engine never needs to know what "range boundaries" means.

const loopsConcepts = ["loop_iteration", "range_boundaries", "while_condition", "counter_accumulator"] as const;

const activityConceptMap: Record<string, string> = {
  repetition_need: "loop_iteration",
  for_loop: "loop_iteration",
  range_trace: "range_boundaries",
  while_trace: "while_condition",
  accumulator_trace: "counter_accumulator",
  while_condition: "while_condition",
  loop_state: "counter_accumulator",
  loop_iteration: "loop_iteration",
  range_boundaries: "range_boundaries",
  while_condition_key: "while_condition",
  counter_accumulator: "counter_accumulator",
};

const checkConcepts: string[] = ["loop_iteration", "range_boundaries", "while_condition"];

export const loopsMasteryConfig: LessonMasteryConfig = {
  concepts: loopsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: checkConcepts };
  },
};

import type { LessonMasteryConfig } from "@/lib/mastery/types";

// For Loops lesson-owned mastery configuration.
// Legacy concept keys are preserved so persisted mastery/practice vocabulary
// keeps validating; the lesson itself now teaches only for-loop iteration.

const loopsConcepts = ["loop_iteration", "range_boundaries", "while_condition", "counter_accumulator"] as const;

const activityConceptMap: Record<string, string> = {
  repetition_need: "loop_iteration",
  for_loop: "loop_iteration",
  for_trace: "loop_iteration",
  for_body_trace: "loop_iteration",
  iteration_count: "loop_iteration",
  for_write: "loop_iteration",
  for_model: "loop_iteration",
  loop_iteration: "loop_iteration",
};

const checkConcepts: string[] = ["loop_iteration"];

export const loopsMasteryConfig: LessonMasteryConfig = {
  concepts: loopsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: checkConcepts };
  },
};

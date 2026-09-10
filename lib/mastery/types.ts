// Phase 8E concept mastery: what the learner appears to understand.
// Lesson completion (page progress) is never mastery evidence.

export const masteryConcepts = ["variable", "assignment", "reassignment", "expression", "name_binding", "identifier_naming"] as const;
export type MasteryConcept = (typeof masteryConcepts)[number];

export const masteryStates = ["unseen", "shaky", "developing", "strong"] as const;
export type MasteryState = (typeof masteryStates)[number];

export const evidenceTypes = [
  "correct_prediction", "incorrect_prediction", "correct_practice", "incorrect_practice",
  "robin_check_strong", "robin_check_developing", "robin_check_shaky",
] as const;
export type EvidenceType = (typeof evidenceTypes)[number];

export type ConceptMastery = {
  lesson_slug: string;
  concept_key: MasteryConcept;
  state: MasteryState;
  evidence_count: number;
  success_count: number;
  struggle_count: number;
  last_evidence_type: EvidenceType | null;
  last_evidence_at: string | null;
  last_attempt_id: string | null;
};

export type MasterySummary = {
  lesson: string;
  concepts: { concept: MasteryConcept; state: MasteryState; evidenceCount: number }[];
};

// Activity concept strings (variables-activities.ts) → mastery concept keys.
// Only objective activities (predict/practice) generate evidence today.
const activityConceptMap: Record<string, MasteryConcept> = {
  named_values: "variable",
  reading_a_name: "variable",
  assignment: "assignment",
  reassignment: "reassignment",
  name_binding: "name_binding",
};

export function activityConceptToMastery(activityConcept: string): MasteryConcept | null {
  return activityConceptMap[activityConcept] ?? null;
}

// Robin Check tests the x = 5 mental model as a whole: the name, the value/object,
// and the assignment binding. A signal therefore maps to all three concepts,
// not to individual recognizedConcepts (the AI cannot invent concept keys).
const robinCheckConcepts: MasteryConcept[] = ["assignment", "name_binding", "variable"];

export function robinCheckSignalToEvidence(signal: "strong" | "developing" | "shaky"): { evidenceType: EvidenceType; concepts: MasteryConcept[] } {
  const evidenceType: EvidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
  return { evidenceType, concepts: robinCheckConcepts };
}

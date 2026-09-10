// Generic mastery types shared across all lessons.
// Lesson-specific concept lists and activity→concept mappings live in
// the lesson's own config module (e.g. content/lessons/programming/variables-mastery.ts).

export const masteryStates = ["unseen", "shaky", "developing", "strong"] as const;
export type MasteryState = (typeof masteryStates)[number];

export const evidenceTypes = [
  "correct_prediction", "incorrect_prediction", "correct_practice", "incorrect_practice",
  "robin_check_strong", "robin_check_developing", "robin_check_shaky",
] as const;
export type EvidenceType = (typeof evidenceTypes)[number];

// Lesson-owned: the set of concept keys tracked for a lesson.
// The engine accepts any string; the lesson validates its own concepts.
export type MasteryConcept = string;

export type ConceptMastery = {
  lesson_slug: string;
  concept_key: string;
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
  concepts: { concept: string; state: MasteryState; evidenceCount: number }[];
};

// Lesson-owned contract: each lesson provides these mappings.
export type LessonMasteryConfig = {
  concepts: readonly string[];
  activityConceptToMastery: (activityConcept: string) => string | null;
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => { evidenceType: EvidenceType; concepts: string[] };
};

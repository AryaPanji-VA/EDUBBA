// Practice Lab exercise definition model (Phase 11B).
// A PracticeExercise is a small, self-contained coding-gym item grounded in a
// registered lesson. Checking is deterministic: content files carry data-only
// checker configuration, lib/practice/check.ts interprets it. No AI grading.

export type PracticeExerciseType = "predict_output" | "fix_code" | "write_code";

export type PracticeExerciseLanguage = "python";

// One structural requirement the learner's code must satisfy.
// `source` is a RegExp source matched against whitespace-normalized code.
export type PracticeCodePattern = {
  source: string;
  description: string;
};

// A recognizable wrong output for predict_output, tagged with a misconception.
export type PracticeMisconceptionOutput = {
  output: string;
  misconception: string;
  note: string;
};

// A wrong code shape for fix_code/write_code, tagged with a misconception.
export type PracticeMisconceptionPattern = {
  source: string;
  misconception: string;
  note: string;
};

export type PracticeExercise = {
  // Stable unique id, e.g. "variables-predict-1". Doubles as the resume anchor
  // and as part of stable practice attempt ids for mastery deduplication.
  id: string;
  // The registered lesson this exercise is grounded in (mastery + Robin context).
  lessonSlug: string;
  // Human-facing concept label, e.g. "Reassignment".
  concept: string;
  type: PracticeExerciseType;
  language: PracticeExerciseLanguage;
  prompt: string;
  // Deterministic, offline hint shown on demand. Robin is optional on top.
  hint: string;
  // Deterministic explanation shown after a check.
  explanation: string;
  // Mastery concept keys (validated against the lesson's mastery config).
  masteryConcepts: readonly string[];
  // predict_output: code to read and the exact printed output.
  code?: string;
  expectedOutput?: string;
  misconceptionOutputs?: readonly PracticeMisconceptionOutput[];
  // fix_code: the broken starter shown for editing.
  // write_code: optional starter the learner extends.
  starterCode?: string;
  // fix_code: all must match. write_code: all → correct, some → partial.
  requiredPatterns?: readonly PracticeCodePattern[];
  misconceptionPatterns?: readonly PracticeMisconceptionPattern[];
  // Verification anchor: the canonical solution every required pattern must
  // match. Used by tests (and as a reviewer reference), not shown as a gate.
  sampleSolution?: string;
};

export type PracticeCheckStatus = "correct" | "incorrect" | "partial";

export type PracticeCheckResult = {
  status: PracticeCheckStatus;
  // Recognized misconception code, or null.
  misconception: string | null;
  // Learner-readable note explaining the misconception, or null.
  misconceptionNote: string | null;
  explanation: string;
};

export type PracticeTopic = {
  // Registered lesson slug this topic practices.
  lessonSlug: string;
  title: string;
  exercises: PracticeExercise[];
};

export type PracticeTrack = {
  slug: string;
  title: string;
  description: string;
  topics: PracticeTopic[];
};

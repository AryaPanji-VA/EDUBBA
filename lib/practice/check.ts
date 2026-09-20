import type { PracticeCheckResult, PracticeCodePattern, PracticeExercise } from "@/content/practice/types";

// Deterministic practice checking. Content files carry data-only pattern
// configuration; this module interprets it. No AI, no code execution —
// grading must stay correct and available even when Robin is offline.

// Normalize predicted output: trim edges and normalize newlines.
// The comparison itself stays case-sensitive: Python output is exact.
export function normalizeOutput(value: string): string {
  return value.trim().replace(/\r\n?/g, "\n");
}

// Normalize code for pattern matching: unify newlines, trim trailing
// whitespace per line, trim the edges. Inner structure is preserved so
// order-sensitive patterns can distinguish "assign before print" from
// "print before assign".
export function normalizeCode(value: string): string {
  return value.replace(/\r\n?/g, "\n").split("\n").map((line) => line.trimEnd()).join("\n").trim();
}

// An invalid pattern in content must never grade a false "correct":
// compilation failures are treated as unmatched (fail closed).
function safeTest(source: string, code: string): boolean {
  try {
    return new RegExp(source).test(code);
  } catch {
    return false;
  }
}

function matchedDescriptions(patterns: readonly PracticeCodePattern[], code: string): string[] {
  return patterns.filter((pattern) => safeTest(pattern.source, code)).map((pattern) => pattern.description);
}

function correctResult(exercise: PracticeExercise): PracticeCheckResult {
  return { status: "correct", misconception: null, misconceptionNote: null, explanation: exercise.explanation };
}

function incorrectResult(exercise: PracticeExercise, misconception?: { misconception: string; note: string } | null): PracticeCheckResult {
  return {
    status: "incorrect",
    misconception: misconception?.misconception ?? null,
    misconceptionNote: misconception?.note ?? null,
    explanation: exercise.explanation,
  };
}

// The only templated deterministic string in the checker. Exercise content
// itself is localized before it reaches this module; this template follows.
type CheckLanguage = "en" | "id";
const partialTemplate: Record<CheckLanguage, (missing: string, explanation: string) => string> = {
  en: (missing, explanation) => `Part of the expected structure is there. Still missing: ${missing}. ${explanation}`,
  id: (missing, explanation) => `Sebagian struktur yang diminta udah ada. Yang masih kurang: ${missing}. ${explanation}`,
};

export function checkPracticeExercise(exercise: PracticeExercise, submission: string, language: CheckLanguage = "en"): PracticeCheckResult {
  if (exercise.type === "predict_output") {
    const expected = normalizeOutput(exercise.expectedOutput ?? "");
    const actual = normalizeOutput(submission);
    if (expected && actual === expected) return correctResult(exercise);
    const recognized = (exercise.misconceptionOutputs ?? [])
      .find((entry) => normalizeOutput(entry.output) === actual) ?? null;
    return incorrectResult(exercise, recognized);
  }

  const code = normalizeCode(submission);
  const required = exercise.requiredPatterns ?? [];
  const matched = matchedDescriptions(required, code);
  if (required.length > 0 && matched.length === required.length) return correctResult(exercise);

  // A recognized misconception outranks partial credit: naming what went
  // wrong explains more than "some structure matched".
  const recognized = (exercise.misconceptionPatterns ?? [])
    .find((entry) => safeTest(entry.source, code)) ?? null;
  if (recognized) return incorrectResult(exercise, recognized);

  // write_code genuinely supports partial credit: some required structure
  // matched, some is still missing. fix_code has a single bug, so a missing
  // fix is simply incorrect.
  if (exercise.type === "write_code" && matched.length > 0) {
    const missing = required
      .filter((pattern) => !safeTest(pattern.source, code))
      .map((pattern) => pattern.description);
    return {
      status: "partial",
      misconception: null,
      misconceptionNote: null,
      explanation: partialTemplate[language](missing.join("; "), exercise.explanation),
    };
  }

  return incorrectResult(exercise, null);
}

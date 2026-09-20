// Shared Practice assistance model (Phase 11B.4).
// One assistance layer for all three Practice modes. The client sends a
// minimal, task-specific payload; the server builds the authoritative Robin
// context from the registries and re-grades deterministic results itself.
// No provider abstraction, no persistence, no mastery evidence.
import { type RobinLocale, parseRobinLocale } from "@/lib/robin/locale";

export type PracticeAssistMode = "guided" | "sandbox" | "thinking";

export type PracticeAssistAction =
  | "hint"                 // guided, thinking
  | "explain-result"       // guided
  | "explain-concept"      // guided (model supported; surfaced later)
  | "explain-code"         // sandbox
  | "explain-error"        // sandbox
  | "next-step"            // sandbox
  | "break-down-problem"   // thinking
  | "explain-reasoning";   // thinking

export const practiceAssistActionsByMode: Record<PracticeAssistMode, readonly PracticeAssistAction[]> = {
  guided: ["hint", "explain-result", "explain-concept"],
  sandbox: ["explain-code", "explain-error", "next-step"],
  thinking: ["hint", "break-down-problem", "explain-reasoning"],
};

// Staged hint disclosure: 1 = small nudge, 2 = deeper guidance after an
// explicit ask. Deliberately not a tutor state machine.
export type PracticeAssistHintStage = 1 | 2;

export type PracticeAssistRequest = {
  mode: PracticeAssistMode;
  action: PracticeAssistAction;
  // Guided: the registered exercise this question is about.
  exerciseId?: string;
  // Guided: the learner's current submission text (server re-grades it).
  learnerAnswer?: string;
  // Thinking: the registered activity this question is about.
  activityId?: string;
  // Thinking: the serialized submission (server validates + re-grades it).
  submission?: string;
  // Sandbox: the code currently in the editor (learner asked for help on it).
  sandboxCode?: string;
  // Sandbox: raw runtime/syntax error text (sanitized server-side before Robin).
  sandboxError?: string;
  // Active EDUBBA locale for Robin's response language (optional context).
  language?: RobinLocale;
  // Only meaningful for hint-style actions.
  hintStage?: PracticeAssistHintStage;
};

export type ValidatedPracticeAssistRequest = PracticeAssistRequest & {
  mode: PracticeAssistMode;
  action: PracticeAssistAction;
  hintStage: PracticeAssistHintStage;
  // Always present after validation: malformed/missing values fall back.
  language: RobinLocale;
};

export const MAX_ASSIST_ANSWER_LENGTH = 2_000;
export const MAX_ASSIST_SUBMISSION_LENGTH = 4_000;
export const MAX_ASSIST_CODE_LENGTH = 20_000;
export const MAX_ASSIST_ERROR_LENGTH = 8_000;

function optionalString(value: unknown, maxLength: number): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.length > maxLength ? value.slice(0, maxLength) : value;
  return trimmed;
}

// Runtime/syntax error text for Robin's context. Traceback frame lines carry
// filesystem paths, so they are dropped and any leftover path-like token is
// masked. The Python error type and message survive.
export function sanitizeSandboxError(raw: string): string {
  const withoutFrames = raw
    .split(/\r?\n/)
    .filter((line) => !/^\s*File\s/.test(line))
    .join("\n")
    .replace(/\/[^\s'"]+/g, "<path>")
    .trim();
  return withoutFrames.slice(0, MAX_ASSIST_ERROR_LENGTH);
}

export function validatePracticeAssistRequest(value: unknown): ValidatedPracticeAssistRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (Object.keys(row).some((key) => !["mode", "action", "exerciseId", "learnerAnswer", "activityId", "submission", "sandboxCode", "sandboxError", "language", "hintStage"].includes(key))) return null;
  if (typeof row.mode !== "string" || !(row.mode in practiceAssistActionsByMode)) return null;
  const mode = row.mode as PracticeAssistMode;
  if (typeof row.action !== "string" || !practiceAssistActionsByMode[mode].includes(row.action as PracticeAssistAction)) return null;
  const action = row.action as PracticeAssistAction;
  const hintStage = row.hintStage === 2 ? 2 : 1;

  const exerciseId = optionalString(row.exerciseId, 80);
  const activityId = optionalString(row.activityId, 80);
  const learnerAnswer = optionalString(row.learnerAnswer, MAX_ASSIST_ANSWER_LENGTH);
  const submission = optionalString(row.submission, MAX_ASSIST_SUBMISSION_LENGTH);
  const sandboxCode = optionalString(row.sandboxCode, MAX_ASSIST_CODE_LENGTH);
  const sandboxError = optionalString(row.sandboxError, MAX_ASSIST_ERROR_LENGTH);

  // Mode/action/task consistency — minimal payloads, no extra app state.
  if (mode === "guided") {
    if (!exerciseId) return null;
    if (action === "explain-result" && !(learnerAnswer?.trim())) return null;
  } else if (mode === "sandbox") {
    if (!(sandboxCode?.trim())) return null;
    if (action === "explain-error" && !(sandboxError?.trim())) return null;
  } else {
    if (!activityId) return null;
    if (action === "explain-reasoning" && !(submission?.trim())) return null;
  }

  return {
    mode, action, hintStage,
    exerciseId, activityId, learnerAnswer, submission, sandboxCode, sandboxError,
    language: parseRobinLocale(row.language),
  };
}

import type {
  ThinkingActivity, ThinkingInteraction, ThinkingSubmission,
} from "@/content/practice/thinking/types";
import type { PracticeCheckResult } from "@/content/practice/types";

function sameMembers(actual: string[], expected: string[]) {
  return actual.length === expected.length && new Set(actual).size === actual.length &&
    actual.every((item) => expected.includes(item));
}

function correct(activity: ThinkingActivity): PracticeCheckResult {
  return { status: "correct", misconception: null, misconceptionNote: null, explanation: activity.explanation };
}

function incorrect(activity: ThinkingActivity, misconception?: { code: string; note: string }): PracticeCheckResult {
  return {
    status: "incorrect",
    misconception: misconception?.code ?? null,
    misconceptionNote: misconception?.note ?? null,
    explanation: activity.explanation,
  };
}

function partial(activity: ThinkingActivity, explanation: string): PracticeCheckResult {
  return { status: "partial", misconception: null, misconceptionNote: null, explanation };
}

function validIds(values: string[], allowed: string[]) {
  return values.length === new Set(values).size && values.every((value) => allowed.includes(value));
}

export function isThinkingSubmissionFor(
  interaction: ThinkingInteraction,
  value: unknown,
): value is ThinkingSubmission {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const submission = value as Record<string, unknown>;
  if (interaction.kind === "single-choice") {
    return submission.kind === "single-choice" && typeof submission.optionId === "string" &&
      interaction.options.some((option) => option.id === submission.optionId);
  }
  if (interaction.kind === "multi-select") {
    return submission.kind === "multi-select" && Array.isArray(submission.selectedIds) &&
      submission.selectedIds.length > 0 && submission.selectedIds.every((id) => typeof id === "string") &&
      validIds(submission.selectedIds as string[], interaction.options.map((option) => option.id));
  }
  if (interaction.kind === "ordering") {
    return submission.kind === "ordering" && Array.isArray(submission.orderedIds) &&
      submission.orderedIds.every((id) => typeof id === "string") &&
      sameMembers(submission.orderedIds as string[], interaction.steps.map((step) => step.id));
  }
  if (submission.kind !== "fields" || !submission.values || typeof submission.values !== "object" || Array.isArray(submission.values)) return false;
  const values = submission.values as Record<string, unknown>;
  return Object.keys(values).length === interaction.fields.length && interaction.fields.every((field) =>
    typeof values[field.id] === "string" && Boolean((values[field.id] as string).trim()) && (values[field.id] as string).length <= 200);
}

export function createEmptyThinkingSubmission(activity: ThinkingActivity): ThinkingSubmission {
  const interaction = activity.interaction;
  if (interaction.kind === "single-choice") return { kind: "single-choice", optionId: "" };
  if (interaction.kind === "multi-select") return { kind: "multi-select", selectedIds: [] };
  if (interaction.kind === "ordering") return { kind: "ordering", orderedIds: interaction.steps.map((step) => step.id) };
  return { kind: "fields", values: Object.fromEntries(interaction.fields.map((field) => [field.id, ""])) };
}

export function isThinkingSubmissionComplete(activity: ThinkingActivity, submission: ThinkingSubmission): boolean {
  return isThinkingSubmissionFor(activity.interaction, submission);
}

export function checkThinkingActivity(activity: ThinkingActivity, submission: unknown): PracticeCheckResult {
  const interaction = activity.interaction;
  if (!isThinkingSubmissionFor(interaction, submission)) return incorrect(activity);

  if (interaction.kind === "single-choice" && submission.kind === "single-choice") {
    if (submission.optionId === interaction.correctOptionId) return correct(activity);
    return incorrect(activity, interaction.options.find((option) => option.id === submission.optionId)?.misconception);
  }

  if (interaction.kind === "multi-select" && submission.kind === "multi-select") {
    if (sameMembers(submission.selectedIds, interaction.correctOptionIds)) return correct(activity);
    const wrong = interaction.options.find((option) => submission.selectedIds.includes(option.id) && option.misconception);
    if (wrong?.misconception) return incorrect(activity, wrong.misconception);
    const correctSelections = submission.selectedIds.filter((id) => interaction.correctOptionIds.includes(id));
    if (correctSelections.length > 0 && correctSelections.length < interaction.correctOptionIds.length) {
      return partial(activity, interaction.partialFeedback);
    }
    return incorrect(activity);
  }

  if (interaction.kind === "ordering" && submission.kind === "ordering") {
    return submission.orderedIds.every((id, index) => id === interaction.correctOrder[index]) ? correct(activity) : incorrect(activity);
  }

  if (interaction.kind === "fields" && submission.kind === "fields") {
    const matches = interaction.fields.filter((field) =>
      submission.values[field.id]?.trim().toLocaleLowerCase() === field.expected.trim().toLocaleLowerCase()).length;
    if (matches === interaction.fields.length) return correct(activity);
    if (matches > 0) return partial(activity, interaction.partialFeedback);
  }

  return incorrect(activity);
}

export function serializeThinkingSubmission(submission: ThinkingSubmission): string {
  return JSON.stringify(submission);
}

export function deserializeThinkingSubmission(serialized: string | undefined, activity: ThinkingActivity): ThinkingSubmission | null {
  if (!serialized) return null;
  try {
    const value: unknown = JSON.parse(serialized);
    return isThinkingSubmissionFor(activity.interaction, value) ? value : null;
  } catch {
    return null;
  }
}


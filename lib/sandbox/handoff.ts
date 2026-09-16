import type { PracticeExercise } from "@/content/practice/types";
import { MAX_SANDBOX_CODE_LENGTH } from "./draft";

export const SANDBOX_HANDOFF_STORAGE_KEY = "robin.python-sandbox.handoff.v1";

export type SandboxHandoff = {
  sourceExerciseId: string;
  code: string;
  createdAt: string;
};

export function createSandboxHandoff(
  exercise: Pick<PracticeExercise, "id" | "starterCode" | "code">,
  now = new Date().toISOString(),
): SandboxHandoff | null {
  const code = exercise.starterCode ?? exercise.code ?? "";
  if (!code.trim()) return null;
  return { sourceExerciseId: exercise.id, code, createdAt: now };
}

export function validateSandboxHandoff(value: unknown): SandboxHandoff | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const handoff = value as Record<string, unknown>;
  if (Object.keys(handoff).some((key) => !["sourceExerciseId", "code", "createdAt"].includes(key))) return null;
  if (typeof handoff.sourceExerciseId !== "string" || !handoff.sourceExerciseId || handoff.sourceExerciseId.length > 80) return null;
  if (typeof handoff.code !== "string" || !handoff.code.trim() || handoff.code.length > MAX_SANDBOX_CODE_LENGTH) return null;
  if (typeof handoff.createdAt !== "string" || Number.isNaN(Date.parse(handoff.createdAt))) return null;
  return {
    sourceExerciseId: handoff.sourceExerciseId,
    code: handoff.code,
    createdAt: handoff.createdAt,
  };
}

export function serializeSandboxHandoff(handoff: SandboxHandoff): string {
  return JSON.stringify(handoff);
}

export function deserializeSandboxHandoff(serialized: string | null): SandboxHandoff | null {
  if (!serialized) return null;
  try { return validateSandboxHandoff(JSON.parse(serialized)); } catch { return null; }
}


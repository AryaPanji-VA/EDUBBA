import { getPythonStarter } from "@/content/sandbox/python-starters";

export const SANDBOX_DRAFT_STORAGE_KEY = "robin.python-sandbox.draft.v1";
export const MAX_SANDBOX_CODE_LENGTH = 20_000;

export type SandboxDraft = {
  code: string;
  starterId: string | null;
  updatedAt: string;
};

export function createSandboxDraft(starterId = "variables", now = new Date().toISOString()): SandboxDraft {
  const starter = getPythonStarter(starterId) ?? getPythonStarter("blank");
  return { code: starter?.code ?? "", starterId: starter?.id ?? null, updatedAt: now };
}

export function validateSandboxDraft(value: unknown): SandboxDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const draft = value as Record<string, unknown>;
  if (Object.keys(draft).some((key) => !["code", "starterId", "updatedAt"].includes(key))) return null;
  if (typeof draft.code !== "string" || draft.code.length > MAX_SANDBOX_CODE_LENGTH) return null;
  if (draft.starterId !== null &&
      (typeof draft.starterId !== "string" || !getPythonStarter(draft.starterId))) return null;
  if (typeof draft.updatedAt !== "string" || Number.isNaN(Date.parse(draft.updatedAt))) return null;
  return { code: draft.code, starterId: draft.starterId as string | null, updatedAt: draft.updatedAt };
}

export function serializeSandboxDraft(draft: SandboxDraft): string {
  return JSON.stringify(draft);
}

export function deserializeSandboxDraft(serialized: string | null): SandboxDraft | null {
  if (!serialized) return null;
  try { return validateSandboxDraft(JSON.parse(serialized)); } catch { return null; }
}

export function updateSandboxDraft(draft: SandboxDraft, code: string, now = new Date().toISOString()): SandboxDraft {
  return { ...draft, code: code.slice(0, MAX_SANDBOX_CODE_LENGTH), updatedAt: now };
}

export function resetSandboxDraft(draft: SandboxDraft, now = new Date().toISOString()): SandboxDraft {
  return createSandboxDraft(draft.starterId ?? "blank", now);
}


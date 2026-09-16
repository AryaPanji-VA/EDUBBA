export type SandboxRuntimeStatus = "idle" | "loading" | "ready" | "running" | "waiting-input" | "error";

export const MAX_SANDBOX_INPUT_LENGTH = 10_000;

export type SandboxStdinRequest = {
  type: "stdin-request";
  runId: string;
  requestId: string;
  prompt: string;
};

export type SandboxStdinResponse = {
  type: "stdin-response";
  runId: string;
  requestId: string;
  value: string;
};

export type SandboxRunResult = {
  type: "result";
  id: string;
  stdout: string;
  stderr: string;
  error: string | null;
};

export function isSandboxRunResult(value: unknown): value is SandboxRunResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const result = value as Record<string, unknown>;
  return result.type === "result" && typeof result.id === "string" &&
    typeof result.stdout === "string" && typeof result.stderr === "string" &&
    (result.error === null || typeof result.error === "string");
}

export function isSandboxStdinRequest(value: unknown): value is SandboxStdinRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const request = value as Record<string, unknown>;
  return request.type === "stdin-request" && typeof request.runId === "string" && Boolean(request.runId) &&
    typeof request.requestId === "string" && Boolean(request.requestId) &&
    typeof request.prompt === "string" && request.prompt.length <= 1_000;
}

export function isSandboxStdinResponse(value: unknown): value is SandboxStdinResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const response = value as Record<string, unknown>;
  return response.type === "stdin-response" && typeof response.runId === "string" && Boolean(response.runId) &&
    typeof response.requestId === "string" && Boolean(response.requestId) &&
    typeof response.value === "string" && response.value.length <= MAX_SANDBOX_INPUT_LENGTH;
}

export function acceptSandboxStdinRequest(
  current: SandboxStdinRequest | null,
  value: unknown,
  activeRunId: string,
): SandboxStdinRequest | null {
  if (current || !isSandboxStdinRequest(value) || value.runId !== activeRunId) return null;
  return value;
}

export function createSandboxStdinResponse(
  request: SandboxStdinRequest,
  value: string,
): SandboxStdinResponse {
  return {
    type: "stdin-response",
    runId: request.runId,
    requestId: request.requestId,
    value: value.slice(0, MAX_SANDBOX_INPUT_LENGTH),
  };
}

export function sandboxRuntimeLabel(status: SandboxRuntimeStatus): string {
  if (status === "loading") return "loading Python…";
  if (status === "running") return "running…";
  if (status === "waiting-input") return "waiting for input…";
  if (status === "ready") return "Python ready";
  if (status === "error") return "runtime unavailable";
  return "loads on first Run";
}

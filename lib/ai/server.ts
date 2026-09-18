import "server-only";
import OpenAI from "openai";

// Phase 18.2: OpenRouter is the primary AI provider. The OpenAI SDK is kept —
// OpenRouter implements the OpenAI-compatible API, so only the baseURL and
// key change. 9Inference is out of the runtime path entirely (legacy env is
// ignored).
const DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

export function getAIConfig() {
  return {
    provider: "OpenRouter",
    baseURL: process.env.ROBIN_AI_BASE_URL?.trim() || DEFAULT_BASE_URL,
    configured: Boolean(process.env.OPENROUTER_API_KEY?.trim()),
    model: process.env.ROBIN_AI_MODEL?.trim() || "openai/gpt-4o-mini",
  };
}

export function createServerAIClient() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error("OpenRouter is not configured.");
  return new OpenAI({ baseURL: getAIConfig().baseURL, apiKey, timeout: 30_000, maxRetries: 0 });
}

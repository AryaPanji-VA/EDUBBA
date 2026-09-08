import "server-only";
import OpenAI from "openai";

export function getAIConfig() {
  return {
    provider: "9Inference",
    baseURL: "https://9inference.cloud/v1/package",
    configured: Boolean(process.env.NINEINFERENCE_API_KEY?.trim()),
    model: process.env.ROBIN_AI_MODEL?.trim() || "deepseek-v4-pro",
  };
}

export function createServerAIClient() {
  const apiKey = process.env.NINEINFERENCE_API_KEY?.trim();
  if (!apiKey) throw new Error("9Inference is not configured.");
  return new OpenAI({ baseURL: getAIConfig().baseURL, apiKey, timeout: 30_000, maxRetries: 0 });
}

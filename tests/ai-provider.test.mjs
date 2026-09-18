import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 18.2: OpenRouter is the primary AI provider. lib/ai/server.ts is the
// single shared layer every AI route consumes, so provider behavior is
// verified here once.

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

// lib/ai/server.ts imports "server-only" and the OpenAI SDK; strip imports
// and drive getAIConfig with an injected process.env.
function loadConfig(env) {
  const raw = stripTypeScriptTypes(read("lib/ai/server.ts"), { mode: "transform" });
  const code = raw
    .replace(/import "server-only";/g, "")
    .replace(/import \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import (\w+) from "[^"]+";/g, "")
    .replace(/export /g, "") + "\nexports.getAIConfig=getAIConfig; exports.createServerAIClient=createServerAIClient;";
  const exports = {};
  vm.runInNewContext(code, { exports, process: { env } });
  return exports;
}

// === 1. Config reads the OpenRouter env and reports OpenRouter ===
test("getAIConfig reads OPENROUTER_API_KEY and reports provider OpenRouter", () => {
  const { getAIConfig } = loadConfig({
    OPENROUTER_API_KEY: "sk-or-v1-test",
    ROBIN_AI_MODEL: "test/model-a",
    ROBIN_AI_BASE_URL: "https://openrouter.ai/api/v1",
  });
  const config = getAIConfig();
  assert.equal(config.provider, "OpenRouter");
  assert.equal(config.configured, true);
  assert.equal(config.model, "test/model-a");
  assert.equal(config.baseURL, "https://openrouter.ai/api/v1");
});

// === 2. Default base URL is OpenRouter when unset/blank ===
test("the default base URL is https://openrouter.ai/api/v1", () => {
  const { getAIConfig } = loadConfig({ OPENROUTER_API_KEY: "sk-or-v1-test" });
  assert.equal(getAIConfig().baseURL, "https://openrouter.ai/api/v1");
  const blank = loadConfig({ OPENROUTER_API_KEY: "sk-or-v1-test", ROBIN_AI_BASE_URL: "   " });
  assert.equal(blank.getAIConfig().baseURL, "https://openrouter.ai/api/v1");
});

// === 3. Custom base URL override works ===
test("ROBIN_AI_BASE_URL overrides the default base URL", () => {
  const { getAIConfig } = loadConfig({
    OPENROUTER_API_KEY: "sk-or-v1-test",
    ROBIN_AI_BASE_URL: "https://proxy.example.com/v1",
  });
  assert.equal(getAIConfig().baseURL, "https://proxy.example.com/v1");
});

// === 4. Legacy 9Inference env no longer influences the config ===
test("NINEINFERENCE_API_KEY alone leaves the provider unconfigured", () => {
  const { getAIConfig } = loadConfig({
    NINEINFERENCE_API_KEY: "sk_live-legacy-key",
  });
  const config = getAIConfig();
  assert.equal(config.configured, false);
  assert.equal(config.provider, "OpenRouter");
  // Without ROBIN_AI_MODEL the default must be an OpenRouter slug, never the
  // legacy 9Inference model name.
  assert.notEqual(config.model, "deepseek-v4-pro");
  assert.ok(config.model.includes("/"));
  // Unconfigured: client construction fails rather than calling any provider.
  assert.throws(() => loadConfig({}).createServerAIClient(), /OpenRouter is not configured/);
});

// === 5. Model falls back to an OpenRouter-format default ===
test("the model default is an OpenRouter-compatible slug", () => {
  const { getAIConfig } = loadConfig({ OPENROUTER_API_KEY: "sk-or-v1-test" });
  const model = getAIConfig().model;
  assert.ok(typeof model === "string" && model.includes("/"), `default model "${model}" must be an OpenRouter vendor/model slug`);
});

// === 6. 9Inference is fully out of the runtime path ===
test("no runtime file references 9Inference as a provider dependency", () => {
  for (const file of ["lib/ai/server.ts", "app/api/robin/chat/route.ts", "app/api/robin/check/route.ts", "app/api/robin/feedback/route.ts", "app/api/practice/robin/route.ts"]) {
    const source = read(file);
    assert.doesNotMatch(source, /NINEINFERENCE_API_KEY/, `${file} must not read the legacy key`);
    assert.doesNotMatch(source, /9inference\.cloud/, `${file} must not use the legacy endpoint`);
    assert.doesNotMatch(source, /9Inference is not configured/, `${file} must not carry the legacy error`);
  }
  // The chat route's TEMP diagnostic block (key fingerprinting) is gone.
  const chat = read("app/api/robin/chat/route.ts");
  assert.doesNotMatch(chat, /TEMP DIAGNOSTIC|logProviderSuccess|logProviderFailure|getAPIKeyHashPrefix/);
});

// === 7. All four AI routes consume the shared layer only ===
test("every AI route builds requests through the shared OpenRouter layer", () => {
  for (const file of ["app/api/robin/chat/route.ts", "app/api/robin/check/route.ts", "app/api/robin/feedback/route.ts", "app/api/practice/robin/route.ts"]) {
    const source = read(file);
    assert.match(source, /createServerAIClient\(\)/, `${file} must use the shared client`);
    assert.match(source, /getAIConfig\(\)\.model/, `${file} must take the model from config`);
    assert.match(source, /chat\.completions\.create/, `${file} uses the OpenAI-compatible interface`);
    // No provider-specific direct calls or second baseURL logic.
    assert.doesNotMatch(source, /baseURL\s*[:=]/, `${file} must not define its own baseURL`);
  }
});

// === 8. Env example documents the new contract ===
test(".env.example documents the OpenRouter contract", () => {
  const example = read(".env.example");
  assert.match(example, /^OPENROUTER_API_KEY=$/m);
  assert.match(example, /^ROBIN_AI_MODEL=$/m);
  assert.match(example, /^ROBIN_AI_BASE_URL=https:\/\/openrouter\.ai\/api\/v1$/m);
  assert.match(example, /NINEINFERENCE_API_KEY is legacy and no longer read/);
  assert.doesNotMatch(example, /^NINEINFERENCE_API_KEY=$/m);
});

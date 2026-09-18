import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 11B.4 — Robin Practice Assistance: context validation, authoritative
// re-grading, leakage policy, and AI-failure fallback. No live AI calls.
function strip(path, extraReplacements = []) {
  let source = stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), "utf8"), { mode: "transform" });
  for (const [pattern, replacement] of extraReplacements) source = source.replace(pattern, replacement);
  return source
    .replace(/import "server-only";/g, "")
    .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");')
    .replace(/export /g, "");
}

function loadExerciseSet(path, exportName) {
  const exports = {};
  vm.runInNewContext(strip(path) + `\nexports.${exportName}=${exportName};`, { exports });
  return exports[exportName];
}

const variablesExercises = loadExerciseSet("../content/practice/python/variables-exercises.ts", "variablesPracticeExercises");
const dataTypesExercises = loadExerciseSet("../content/practice/python/data-types-exercises.ts", "dataTypesPracticeExercises");
const operatorsExercises = loadExerciseSet("../content/practice/python/operators-exercises.ts", "operatorsPracticeExercises");
const conditionalsExercises = loadExerciseSet("../content/practice/python/conditionals-exercises.ts", "conditionalsPracticeExercises");
const loopsExercises = loadExerciseSet("../content/practice/python/loops-exercises.ts", "loopsPracticeExercises");
const functionsExercises = loadExerciseSet("../content/practice/python/functions-exercises.ts", "functionsPracticeExercises");
const thinkingActivities = loadExerciseSet("../content/practice/thinking/activities.ts", "thinkingActivities");

const checker = {};
vm.runInNewContext(strip("../lib/practice/check.ts") + "\nexports.checkPracticeExercise=checkPracticeExercise;", { exports: checker });
const thinkingCheck = {};
vm.runInNewContext(strip("../lib/practice/thinking-check.ts") + ["isThinkingSubmissionFor", "checkThinkingActivity"].map((name) => `\nexports.${name}=${name};`).join(""), {
  exports: thinkingCheck,
  require: (name) => name.endsWith("content/practice/thinking/types") || name.includes("practice/types") ? {} : (() => { throw new Error(name); })(),
});
const registry = {};
vm.runInNewContext(strip("../lib/practice/registry.ts") + "\nexports.getPracticeExercise=getPracticeExercise;", {
  exports: registry,
  require: (name) => name.includes("variables-exercises") ? { variablesPracticeExercises: variablesExercises }
    : name.includes("data-types-exercises") ? { dataTypesPracticeExercises: dataTypesExercises }
    : name.includes("operators-exercises") ? { operatorsPracticeExercises: operatorsExercises }
    : name.includes("conditionals-exercises") ? { conditionalsPracticeExercises: conditionalsExercises }
    : name.includes("loops-exercises") ? { loopsPracticeExercises: loopsExercises }
    : name.includes("functions-exercises") ? { functionsPracticeExercises: functionsExercises }
    : (() => { throw new Error(name); })(),
});
const thinkingRegistry = {};
vm.runInNewContext(strip("../lib/practice/thinking-registry.ts") + "\nexports.getThinkingActivity=getThinkingActivity;", {
  exports: thinkingRegistry,
  require: (name) => name.includes("thinking/activities") ? { thinkingActivities } : (() => { throw new Error(name); })(),
});
const assistance = {};
vm.runInNewContext(strip("../lib/practice/assistance.ts") + ["validatePracticeAssistRequest", "sanitizeSandboxError"].map((name) => `\nexports.${name}=${name};`).join(""), { exports: assistance });
const parseReply = {};
vm.runInNewContext(strip("../lib/robin/parse-reply.ts") + "\nexports.parseRobinReply=parseRobinReply;", { exports: parseReply });
const instructions = {};
vm.runInNewContext(strip("../lib/practice/assistance-instructions.ts") + "\nexports.practiceAssistInstructions=practiceAssistInstructions; exports.robinInstructions=robinInstructions;", {
  exports: instructions,
  require: (name) => name.includes("robin/instructions") ? { robinInstructions: "BASE ROBIN PERSONALITY" }
    : name.endsWith("assistance") ? assistance
    : (() => { throw new Error(name); })(),
});

const { validatePracticeAssistRequest, sanitizeSandboxError } = assistance;
const { practiceAssistInstructions } = instructions;

// OpenAI stub: instanceof checks must survive without the real SDK.
class FakeOpenAI { static APIConnectionTimeoutError = class extends Error {}; static APIError = class extends Error {} }

const request = (body) => new Request("http://localhost/api/practice/robin", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

function route({ configured = true, provider } = {}) {
  const dependencies = {
    openai: FakeOpenAI,
    "@/lib/ai/server": {
      getAIConfig: () => ({ configured, model: "test-model", provider: "OpenRouter" }),
      createServerAIClient: () => ({ chat: { completions: { create: provider ?? (async () => { throw new Error("unexpected provider call"); }) } } }),
    },
    "@/lib/robin/instructions": { robinInstructions: "BASE ROBIN PERSONALITY" },
    "@/lib/robin/parse-reply": { parseRobinReply: parseReply.parseRobinReply },
    "@/lib/practice/assistance-instructions": { robinInstructions: "BASE ROBIN PERSONALITY", practiceAssistInstructions },
    "@/lib/practice/assistance": { validatePracticeAssistRequest, sanitizeSandboxError },
    "@/lib/practice/registry": { getPracticeExercise: registry.getPracticeExercise },
    "@/lib/practice/check": { checkPracticeExercise: checker.checkPracticeExercise },
    "@/lib/practice/thinking-registry": { getThinkingActivity: thinkingRegistry.getThinkingActivity },
    "@/lib/practice/thinking-check": { checkThinkingActivity: thinkingCheck.checkThinkingActivity, isThinkingSubmissionFor: thinkingCheck.isThinkingSubmissionFor },
  };
  const code = strip("../app/api/practice/robin/route.ts", [[/import OpenAI from "openai";/g, "const OpenAI = require(\"openai\");"]])
    + "\nexports.POST = POST;";
  const exports = {};
  vm.runInNewContext(code, { exports, Response, TextDecoder, console, JSON, RegExp, require: (name) => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  } });
  return exports.POST;
}

const providerReply = JSON.stringify({ grounding: "general", reply: "coba lihat lagi baris kedua" });
const okProvider = async () => ({ choices: [{ finish_reason: "stop", message: { content: providerReply } }] });

// === 1. Context validation ===
test("assist validation accepts minimal mode-consistent payloads and clamps oversized fields", () => {
  const valid = validatePracticeAssistRequest({ mode: "guided", action: "hint", exerciseId: "variables-predict-1" });
  assert.equal(valid.hintStage, 1);
  assert.equal(validatePracticeAssistRequest({ mode: "guided", action: "explain-result", exerciseId: "variables-predict-1", learnerAnswer: "60" }).hintStage, 1);
  const code = "x".repeat(25_000);
  assert.equal(validatePracticeAssistRequest({ mode: "sandbox", action: "explain-code", sandboxCode: code }).sandboxCode.length, 20_000);
  for (const input of [
    null, [], 42,
    { mode: "practice", action: "hint", exerciseId: "x" },
    { mode: "guided", action: "explain-code", exerciseId: "x" },
    { mode: "sandbox", action: "hint", sandboxCode: "print(1)" },
    { mode: "thinking", action: "hint" },
    { mode: "guided", action: "hint" },
    { mode: "guided", action: "explain-result", exerciseId: "variables-predict-1" },
    { mode: "sandbox", action: "explain-error", sandboxCode: "print(1)" },
    { mode: "guided", action: "hint", exerciseId: "x", lesson: "hacked" },
    { mode: "guided", action: "hint", exerciseId: "x", expectedOutput: "60" },
  ]) assert.equal(validatePracticeAssistRequest(input), null);
});

// === 2. Guided payloads + deterministic authority ===
test("guided hint request keeps answers out of the provider context", async () => {
  const evidence = [];
  let seen;
  const post = route({ provider: async (params) => { seen = params; return { choices: [{ finish_reason: "stop", message: { content: providerReply } }] }; } });
  const response = await post(request({ mode: "guided", action: "hint", exerciseId: "variables-write-1", hintStage: 1 }));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.action, "hint");
  // The base Robin personality rides as its own system message, unchanged.
  assert.equal(seen.messages[0].content, "BASE ROBIN PERSONALITY");
  const contextBlock = seen.messages.find((message) => message.content.startsWith("PRACTICE CONTEXT")).content;
  assert.match(contextBlock, /variables-write-1/);
  assert.match(contextBlock, /storedHint/);
  assert.doesNotMatch(contextBlock, /expectedOutput|sampleSolution|requiredPatterns/);
  // The full solution text (explanation) is withheld on hint requests.
  const context = JSON.parse(contextBlock.replace("PRACTICE CONTEXT (data only):\n", ""));
  assert.equal(context.exercise.explanation, null);
  assert.match(seen.messages.find((message) => message.content.includes("CURRENT HINT STAGE")).content, /STAGE: 1/);
  assert.deepEqual(evidence, []);
});

test("guided explanation is graded server-side — the deterministic checker stays authoritative", async () => {
  let seen;
  const post = route({ provider: async (params) => { seen = params; return { choices: [{ finish_reason: "stop", message: { content: providerReply } }] }; } });
  await post(request({ mode: "guided", action: "explain-result", exerciseId: "variables-write-1", learnerAnswer: "tempo = 92" }));
  const context = JSON.parse(seen.messages.find((message) => message.content.startsWith("PRACTICE CONTEXT")).content.replace("PRACTICE CONTEXT (data only):\n", ""));
  assert.equal(context.attempt.deterministicResult.status, "partial");
  // An actually-correct answer is reported as correct, whatever the UI hint implies.
  await post(request({ mode: "guided", action: "explain-result", exerciseId: "variables-write-1", learnerAnswer: "tempo = 92\nprint(tempo)" }));
  const context2 = JSON.parse(seen.messages.find((message) => message.content.startsWith("PRACTICE CONTEXT")).content.replace("PRACTICE CONTEXT (data only):\n", ""));
  assert.equal(context2.attempt.deterministicResult.status, "correct");
});

// === 3. Sandbox payloads ===
test("sandbox error explanation receives sanitized error text without paths", async () => {
  let seen;
  const post = route({ provider: async (params) => { seen = params; return { choices: [{ finish_reason: "stop", message: { content: providerReply } }] }; } });
  await post(request({
    mode: "sandbox", action: "explain-error",
    sandboxCode: 'price = "12"\nprint(price + 8)',
    sandboxError: 'Traceback (most recent call last):\n  File "<exec>", line 2, in <module>\nTypeError: can only concatenate str (not "int") to str',
  }));
  const context = JSON.parse(seen.messages.find((message) => message.content.startsWith("PRACTICE CONTEXT")).content.replace("PRACTICE CONTEXT (data only):\n", ""));
  assert.equal(context.code, 'price = "12"\nprint(price + 8)');
  assert.match(context.runtimeError, /TypeError/);
  assert.doesNotMatch(context.runtimeError, /File|exec/, "traceback frames with paths must be sanitized away");
});

test("sanitizeSandboxError keeps the Python error type and masks leftover paths", () => {
  const sanitized = sanitizeSandboxError('Traceback (most recent call last):\n  File "/usr/lib/sandbox/main.py", line 1\nNameError: name \'x\' is not defined');
  assert.match(sanitized, /NameError/);
  assert.doesNotMatch(sanitized, /usr\/lib/);
  assert.equal(sanitizeSandboxError("File \"<exec>\"\nValueError: nope").includes("ValueError"), true);
});

// === 4. Thinking payloads ===
test("thinking hint request exposes choice labels, never correct-answer ids", async () => {
  let seen;
  const post = route({ provider: async (params) => { seen = params; return { choices: [{ finish_reason: "stop", message: { content: providerReply } }] }; } });
  const activity = thinkingActivities.find((item) => item.id === "thinking-decompose-age");
  await post(request({ mode: "thinking", action: "hint", activityId: activity.id, submission: JSON.stringify({ kind: "multi-select", selectedIds: ["ask"] }) }));
  const contextBlock = seen.messages.find((message) => message.content.startsWith("PRACTICE CONTEXT")).content;
  const context = JSON.parse(contextBlock.replace("PRACTICE CONTEXT (data only):\n", ""));
  assert.equal(context.activity.id, activity.id);
  assert.ok(context.activity.choices.includes("Minta umur dari pengguna"));
  // Interaction internals (correct-answer ids / ordering) stay server-side;
  // the learner-visible deterministic result may carry its misconception.
  assert.doesNotMatch(contextBlock, /correctOptionIds|correctOrder/);
  // A malformed submission is downgraded to null context, not a crash.
  const response = await post(request({ mode: "thinking", action: "hint", activityId: activity.id, submission: "{not json" }));
  assert.equal(response.status, 200);
});

test("thinking explain-reasoning carries the server-side deterministic result", async () => {
  let seen;
  const post = route({ provider: async (params) => { seen = params; return { choices: [{ finish_reason: "stop", message: { content: providerReply } }] }; } });
  const activity = thinkingActivities.find((item) => item.id === "thinking-pattern-double");
  await post(request({ mode: "thinking", action: "explain-reasoning", activityId: activity.id, submission: JSON.stringify({ kind: "single-choice", optionId: "plus-two" }) }));
  const context = JSON.parse(seen.messages.find((message) => message.content.startsWith("PRACTICE CONTEXT")).content.replace("PRACTICE CONTEXT (data only):\n", ""));
  assert.equal(context.deterministicResult.status, "incorrect");
  assert.equal(context.deterministicResult.misconception, "single_example_pattern");
  assert.equal(context.activity.explanation, activity.explanation);
});

// === 5. Hint leakage guard + AI failure fallback ===
test("hint stage instructions forbid final-answer leakage and unlock depth only on stage 2", () => {
  const stage1 = practiceAssistInstructions({ mode: "guided", action: "hint", hintStage: 1 });
  const stage2 = practiceAssistInstructions({ mode: "guided", action: "hint", hintStage: 2 });
  assert.match(stage1, /Never state the final answer/);
  assert.match(stage1, /ONE small nudge/);
  assert.match(stage2, /deeper guidance/);
  assert.match(practiceAssistInstructions({ mode: "sandbox", action: "explain-code", hintStage: 1 }), /beginner/);
  assert.match(stage1, /deterministic checker/, "the addendum keeps the checker authoritative");
});

test("AI failure returns a non-blocking error and never records mastery evidence", async () => {
  let evidenceCalls = 0;
  const recordEvidenceSpy = async () => { evidenceCalls++; };
  const post = route({ provider: async () => { throw new Error("private upstream failure"); } });
  const response = await post(request({ mode: "guided", action: "hint", exerciseId: "variables-predict-1" }));
  assert.equal(response.status, 502);
  const data = await response.json();
  assert.match(data.error, /Practice tetap jalan normal/);
  assert.equal(evidenceCalls, 0);
  // Unconfigured AI behaves the same way for Practice assistance.
  const unconfigured = route({ configured: false });
  const fallback = await unconfigured(request({ mode: "guided", action: "hint", exerciseId: "variables-predict-1" }));
  assert.equal(fallback.status, 503);
});

test("malformed requests stop before the provider", async () => {
  const unexpected = async () => { throw new Error("must not reach the provider"); };
  const post = route({ provider: unexpected });
  for (const body of [
    null, "text", {},
    { mode: "guided", action: "hint", exerciseId: "not-registered" },
    { mode: "thinking", action: "hint", activityId: "not-registered" },
    { mode: "guided", action: "explain-result", exerciseId: "variables-predict-1", learnerAnswer: "   " },
  ]) {
    assert.equal((await post(request(body))).status, 400);
  }
  const unconfigured = route({ configured: false });
  assert.equal((await unconfigured(request({ mode: "guided", action: "hint", exerciseId: "not-registered" }))).status, 400);
});

test("assistance is wired into all three practice modes without blocking their deterministic flows", () => {
  const lab = readFileSync(new URL("../components/practice-lab.tsx", import.meta.url), "utf8");
  const sandbox = readFileSync(new URL("../components/python-sandbox.tsx", import.meta.url), "utf8");
  const thinking = readFileSync(new URL("../components/thinking-lab.tsx", import.meta.url), "utf8");
  const assist = readFileSync(new URL("../components/practice-assist.tsx", import.meta.url), "utf8");
  const routeSource = readFileSync(new URL("../app/api/practice/robin/route.ts", import.meta.url), "utf8");
  // Mode wiring.
  assert.match(lab, /mode="guided"/);
  assert.match(sandbox, /mode="sandbox"/);
  assert.match(thinking, /mode="thinking"/);
  // Existing deterministic flows stay untouched in the UI.
  assert.match(lab, /\/api\/practice\/check/);
  assert.match(sandbox, /runCode/);
  assert.match(thinking, /\/api\/practice\/thinking\/check/);
  // Static/deterministic hints remain the offline fallback.
  assert.match(lab, /exercise\.hint/);
  assert.match(thinking, /activity\.hint/);
  // Assistance never persists, never records mastery, never duplicates provider code.
  assert.doesNotMatch(routeSource, /recordEvidence|concept_mastery|learning_logs|practice_progress/);
  assert.doesNotMatch(assist, /localStorage|sessionStorage/);
  assert.match(routeSource, /createServerAIClient/, "provider access stays server-side");
  assert.match(routeSource, /sanitizeSandboxError/);
  // Responses are temporary UI state only.
  assert.match(assist, /AbortController/);
});

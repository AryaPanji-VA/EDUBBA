import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 12.1 — Conditionals across Practice: 6 guided exercises, 4 thinking
// activities, sandbox starter, progress registry, Robin assistance context,
// and course overview integration. No live AI calls.
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

const conditionalsExercises = loadExerciseSet("../content/practice/python/conditionals-exercises.ts", "conditionalsPracticeExercises");
const variablesExercises = loadExerciseSet("../content/practice/python/variables-exercises.ts", "variablesPracticeExercises");
const dataTypesExercises = loadExerciseSet("../content/practice/python/data-types-exercises.ts", "dataTypesPracticeExercises");
const thinkingActivities = loadExerciseSet("../content/practice/thinking/activities.ts", "thinkingActivities");
const starters = loadExerciseSet("../content/sandbox/python-starters.ts", "pythonStarters");

const checker = {};
vm.runInNewContext(strip("../lib/practice/check.ts") + "\nexports.checkPracticeExercise=checkPracticeExercise;", { exports: checker });
const registry = {};
vm.runInNewContext(strip("../lib/practice/registry.ts") + ["getPracticeTrack", "getPracticeExercise"].map((name) => `\nexports.${name}=${name};`).join(""), {
  exports: registry,
  require: (name) => name.includes("variables-exercises") ? { variablesPracticeExercises: variablesExercises }
    : name.includes("data-types-exercises") ? { dataTypesPracticeExercises: dataTypesExercises }
    : name.includes("operators-exercises") ? { operatorsPracticeExercises: [] }
    : name.includes("conditionals-exercises") ? { conditionalsPracticeExercises: conditionalsExercises }
    : name.includes("loops-exercises") ? { loopsPracticeExercises: [] }
    : name.includes("functions-exercises") ? { functionsPracticeExercises: [] }
    : (() => { throw new Error(name); })(),
});
const assistance = {};
vm.runInNewContext(strip("../lib/practice/assistance.ts") + ["validatePracticeAssistRequest", "sanitizeSandboxError"].map((name) => `\nexports.${name}=${name};`).join(""), { exports: assistance });
const parseReply = {};
vm.runInNewContext(strip("../lib/robin/parse-reply.ts") + "\nexports.parseRobinReply=parseRobinReply;", { exports: parseReply });
const thinkingRegistry = {};
vm.runInNewContext(strip("../lib/practice/thinking-registry.ts") + ["getThinkingActivity", "getThinkingActivities"].map((name) => `\nexports.${name}=${name};`).join(""), {
  exports: thinkingRegistry,
  require: (name) => name.includes("thinking/activities") ? { thinkingActivities } : (() => { throw new Error(name); })(),
});
const thinkingCheck = {};
vm.runInNewContext(strip("../lib/practice/thinking-check.ts") + ["checkThinkingActivity", "isThinkingSubmissionFor"].map((name) => `\nexports.${name}=${name};`).join(""), {
  exports: thinkingCheck,
  require: (name) => name.includes("practice/types") || name.includes("thinking/types") ? {} : (() => { throw new Error(name); })(),
});

// === 1. Guided Practice: 6 conditionals exercises ===
test("the conditionals practice set follows the 2/2/2 mix with valid ids and concepts", () => {
  assert.equal(conditionalsExercises.length, 6);
  assert.equal(conditionalsExercises.filter((exercise) => exercise.type === "predict_output").length, 2);
  assert.equal(conditionalsExercises.filter((exercise) => exercise.type === "fix_code").length, 2);
  assert.equal(conditionalsExercises.filter((exercise) => exercise.type === "write_code").length, 2);
  const ids = new Set(conditionalsExercises.map((exercise) => exercise.id));
  assert.equal(ids.size, 6);
  for (const exercise of conditionalsExercises) {
    assert.equal(exercise.lessonSlug, "conditionals");
    assert.equal(exercise.language, "python");
    assert.ok(exercise.hint.trim() && exercise.explanation.trim() && exercise.prompt.trim());
    for (const concept of exercise.masteryConcepts) {
      assert.ok(["conditional_flow", "comparison_expression", "branch_selection", "input_conversion"].includes(concept),
        `${exercise.id} uses unknown concept ${concept}`);
    }
  }
});

test("conditionals exercises grade deterministically through the real checker", () => {
  const byId = new Map(conditionalsExercises.map((exercise) => [exercise.id, exercise]));
  // Predict Output: correct + misconception detection.
  assert.equal(checker.checkPracticeExercise(byId.get("conditionals-predict-1"), "Dewasa").status, "correct");
  const inverted = checker.checkPracticeExercise(byId.get("conditionals-predict-1"), "Belum dewasa");
  assert.equal(inverted.status, "incorrect");
  assert.equal(inverted.misconception, "inverted_condition");
  const elifWinner = checker.checkPracticeExercise(byId.get("conditionals-predict-2"), "B");
  assert.equal(elifWinner.status, "correct");
  assert.equal(checker.checkPracticeExercise(byId.get("conditionals-predict-2"), "C").misconception, "elif_skipped");
  // Fix the Code: = vs == and input conversion.
  assert.equal(checker.checkPracticeExercise(byId.get("conditionals-fix-1"), byId.get("conditionals-fix-1").sampleSolution).status, "correct");
  const assignBug = checker.checkPracticeExercise(byId.get("conditionals-fix-1"), byId.get("conditionals-fix-1").starterCode);
  assert.equal(assignBug.misconception, "assignment_vs_comparison");
  assert.equal(checker.checkPracticeExercise(byId.get("conditionals-fix-2"), byId.get("conditionals-fix-2").sampleSolution).status, "correct");
  const rawInput = checker.checkPracticeExercise(byId.get("conditionals-fix-2"), byId.get("conditionals-fix-2").starterCode);
  assert.equal(rawInput.misconception, "string_number_comparison");
  // Write Code: full solutions correct; partial submissions partial; broken shapes diagnosed.
  const write1 = byId.get("conditionals-write-1");
  assert.equal(checker.checkPracticeExercise(write1, write1.sampleSolution).status, "correct");
  assert.equal(checker.checkPracticeExercise(write1, "score = 78\nif score >= 75:\n    print(\"Lulus\")").status, "partial");
  const write2 = byId.get("conditionals-write-2");
  assert.equal(checker.checkPracticeExercise(write2, write2.sampleSolution).status, "correct");
  const overlapping = checker.checkPracticeExercise(write2, "score = 85\nif score >= 90:\n    print(\"A\")\nif score >= 80:\n    print(\"B\")\nelse:\n    print(\"C\")");
  assert.equal(overlapping.misconception, "overlapping_branches");
  // Indentation tolerance: trailing spaces and CRLF still pass.
  assert.equal(checker.checkPracticeExercise(write2, write2.sampleSolution.replace(/\n/g, "\r\n")).status, "correct");
});

test("conditionals exercises are registered in the python track after the existing topics", () => {
  const track = registry.getPracticeTrack("python");
  assert.deepEqual(Array.from(track.topics.map((topic) => topic.lessonSlug)), ["variables", "data-types", "operators", "conditionals", "loops", "functions"]);
  const conditionalsTopic = track.topics.find((topic) => topic.lessonSlug === "conditionals");
  assert.equal(conditionalsTopic.title, "Conditionals");
  assert.equal(conditionalsTopic.exercises.length, 6);
  assert.equal(registry.getPracticeExercise("conditionals-write-2")?.id, "conditionals-write-2");
});

// === 2. Thinking Lab: 4 conditionals activities ===
test("four conditionals thinking activities are registered with deterministic interactions", () => {
  const conditionals = thinkingActivities.filter((activity) => activity.lessonSlugs.includes("conditionals"));
  assert.equal(conditionals.length, 4);
  const types = new Set(conditionals.map((activity) => activity.type));
  assert.ok(types.has("trace-program"));
  assert.ok(types.has("algorithm-ordering"));
  assert.ok(types.has("debug-reasoning"));
  for (const activity of conditionals) {
    assert.ok(activity.hint.trim() && activity.explanation.trim());
    for (const evidence of activity.masteryEvidence) {
      assert.equal(evidence.lessonSlug, "conditionals");
      assert.ok(["conditional_flow", "comparison_expression", "branch_selection", "input_conversion"].includes(evidence.concept));
    }
    const result = thinkingCheck.checkThinkingActivity(activity, correctThinkingAnswer(activity));
    assert.equal(result.status, "correct", `${activity.id} must have a working correct answer`);
  }
  // Debug reasoning: the wrong-answer misconception explains a different theory.
  const debug = thinkingRegistry.getThinkingActivity("thinking-conditional-debug");
  const wrong = thinkingCheck.checkThinkingActivity(debug, { kind: "single-choice", optionId: "indent" });
  assert.equal(wrong.status, "incorrect");
  assert.equal(wrong.misconception, "indentation_confusion");
});

function correctThinkingAnswer(activity) {
  const interaction = activity.interaction;
  if (interaction.kind === "single-choice") return { kind: "single-choice", optionId: interaction.correctOptionId };
  if (interaction.kind === "multi-select") return { kind: "multi-select", selectedIds: [...interaction.correctOptionIds] };
  if (interaction.kind === "ordering") return { kind: "ordering", orderedIds: [...interaction.correctOrder] };
  return { kind: "fields", values: Object.fromEntries(interaction.fields.map((field) => [field.id, field.expected])) };
}

// === 3. Sandbox starter ===
test("the sandbox ships a conditionals starter that uses input() and if/elif/else", () => {
  const starter = starters.find((item) => item.id === "conditionals");
  assert.ok(starter, "conditionals starter must be registered");
  assert.match(starter.code, /int\(\s*input\(/);
  assert.match(starter.code, /\bif\b/);
  assert.match(starter.code, /\belif\b/);
  assert.match(starter.code, /\belse\b/);
});

// === 4. Robin Practice Assistance understands conditionals ===
class FakeOpenAI { static APIConnectionTimeoutError = class extends Error {}; static APIError = class extends Error {} }
const request = (body) => new Request("http://localhost/api/practice/robin", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});
const providerReply = JSON.stringify({ grounding: "grounded", reply: "nudge: cek dulu kondisinya True atau False" });

function assistRoute({ provider = async () => ({ choices: [{ finish_reason: "stop", message: { content: providerReply } }] }) } = {}) {
  const dependencies = {
    openai: FakeOpenAI,
    "@/lib/ai/server": {
      getAIConfig: () => ({ configured: true, model: "test-model", provider: "OpenRouter" }),
      createServerAIClient: () => ({ chat: { completions: { create: provider } } }),
    },
    "@/lib/robin/instructions": { robinInstructions: "BASE" },
    "@/lib/robin/parse-reply": { parseRobinReply: parseReply.parseRobinReply },
    "@/lib/practice/assistance-instructions": { robinInstructions: "BASE", practiceAssistInstructions: (req) => `STAGE ${req.hintStage}` },
    "@/lib/practice/assistance": { validatePracticeAssistRequest: assistance.validatePracticeAssistRequest, sanitizeSandboxError: assistance.sanitizeSandboxError },
    "@/lib/practice/registry": { getPracticeExercise: registry.getPracticeExercise },
    "@/lib/practice/check": { checkPracticeExercise: checker.checkPracticeExercise },
    "@/lib/practice/thinking-registry": { getThinkingActivity: thinkingRegistry.getThinkingActivity },
    "@/lib/practice/thinking-check": { checkThinkingActivity: thinkingCheck.checkThinkingActivity, isThinkingSubmissionFor: thinkingCheck.isThinkingSubmissionFor },
  };
  const code = strip("../app/api/practice/robin/route.ts", [[/import OpenAI from "openai";/g, "const OpenAI = require(\"openai\");"]]) + "\nexports.POST = POST;";
  const exports = {};
  vm.runInNewContext(code, { exports, Response, TextDecoder, console, JSON, RegExp, require: (name) => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  } });
  return exports.POST;
}

test("guided hint for a conditionals exercise grounds in the conditionals lesson without leaking answers", async () => {
  let seen;
  const post = assistRoute({ provider: async (params) => { seen = params; return { choices: [{ finish_reason: "stop", message: { content: providerReply } }] }; } });
  const response = await post(request({ mode: "guided", action: "hint", exerciseId: "conditionals-predict-2", hintStage: 1 }));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.grounding.lesson, "conditionals");
  const context = JSON.parse(seen.messages.find((message) => message.content.startsWith("PRACTICE CONTEXT")).content.replace("PRACTICE CONTEXT (data only):\n", ""));
  assert.equal(context.exercise.id, "conditionals-predict-2");
  assert.equal(context.exercise.explanation, null, "hint requests must not carry the full explanation");
  assert.doesNotMatch(seen.messages.find((message) => message.content.startsWith("PRACTICE CONTEXT")).content, /expectedOutput|sampleSolution/);
});

test("explain-result for a conditionals exercise re-grades server-side", async () => {
  let seen;
  const post = assistRoute({ provider: async (params) => { seen = params; return { choices: [{ finish_reason: "stop", message: { content: providerReply } }] }; } });
  await post(request({ mode: "guided", action: "explain-result", exerciseId: "conditionals-write-2", learnerAnswer: "score = 85\nif score >= 90:\n    print(\"A\")\nif score >= 80:\n    print(\"B\")\nelse:\n    print(\"C\")" }));
  const context = JSON.parse(seen.messages.find((message) => message.content.startsWith("PRACTICE CONTEXT")).content.replace("PRACTICE CONTEXT (data only):\n", ""));
  assert.equal(context.attempt.deterministicResult.status, "incorrect");
  assert.equal(context.attempt.deterministicResult.misconception, "overlapping_branches");
});

test("thinking hint for a conditionals activity carries choice labels only", async () => {
  let seen;
  const post = assistRoute({ provider: async (params) => { seen = params; return { choices: [{ finish_reason: "stop", message: { content: providerReply } }] }; } });
  const response = await post(request({ mode: "thinking", action: "hint", activityId: "thinking-conditional-order" }));
  assert.equal(response.status, 200);
  const context = JSON.parse(seen.messages.find((message) => message.content.startsWith("PRACTICE CONTEXT")).content.replace("PRACTICE CONTEXT (data only):\n", ""));
  assert.equal(context.activity.id, "thinking-conditional-order");
  assert.ok(context.activity.choices.length === 5);
  assert.doesNotMatch(JSON.stringify(context), /correctOrder/);
});

// === 5. Course overview + progress registry integration ===
test("course overview marks conditionals as completed in the implemented sequence", () => {
  const courses = readFileSync(new URL("../data/courses.ts", import.meta.url), "utf8");
  assert.match(courses, /conditionals: "completed"/);
  assert.match(courses, /"data-types": "completed"/);
  const client = readFileSync(new URL("../components/programming-course-client.tsx", import.meta.url), "utf8");
  assert.match(courses, /implementedProgrammingLessonSlugs[\s\S]*"conditionals"/);
  assert.match(client, /state !== "locked"/, "implemented completed lessons stay semantic links");
  assert.match(client, /slug: "conditionals", label: "Conditionals"/);
});

test("practice progress registry includes the conditionals exercises for persistence", async () => {
  const progressRegistry = {};
  vm.runInNewContext(strip("../lib/practice/progress-registry.ts") + "\nexports.getPracticeProgressDefinition=getPracticeProgressDefinition;", {
    exports: progressRegistry,
    require: (name) => name === "./registry" || name.includes("practice/registry") ? { getPracticeTrack: registry.getPracticeTrack }
      : name === "./thinking-registry" || name.includes("thinking-registry") ? { getThinkingActivities: thinkingRegistry.getThinkingActivities }
      : (() => { throw new Error(name); })(),
  });
  const definition = progressRegistry.getPracticeProgressDefinition("python");
  for (const exercise of conditionalsExercises) {
    assert.ok(definition.activityIds.includes(exercise.id), `${exercise.id} must persist`);
  }
  assert.ok(definition.logGroups.some((group) => group.lessonSlug === "conditionals"),
    "the conditionals topic must offer the Learning Log when complete");
  const thinkingDefinition = progressRegistry.getPracticeProgressDefinition("thinking");
  for (const activity of thinkingActivities.filter((item) => item.lessonSlugs.includes("conditionals"))) {
    assert.ok(thinkingDefinition.activityIds.includes(activity.id), `${activity.id} must persist`);
  }
});

test("mastery deduplication applies to conditionals concepts (same attempt id never counts twice)", async () => {
  const masteryTypes = {};
  vm.runInNewContext(strip("../lib/mastery/types.ts") + "\nexports.evidenceTypes=evidenceTypes;", { exports: masteryTypes });
  const engine = {};
  vm.runInNewContext(strip("../lib/mastery/engine.ts") + "\nexports.applyEvidence=applyEvidence;", {
    exports: engine,
    require: (name) => name === "./types" ? masteryTypes : (() => { throw new Error(name); })(),
  });
  let row = null;
  row = engine.applyEvidence(row, "conditionals", "branch_selection", "correct_practice", "attempt-cond-1");
  row = engine.applyEvidence(row, "conditionals", "branch_selection", "correct_practice", "attempt-cond-1");
  assert.equal(row.evidence_count, 1, "the same stable attempt id must not duplicate evidence");
  row = engine.applyEvidence(row, "conditionals", "branch_selection", "incorrect_practice", "attempt-cond-2");
  assert.equal(row.evidence_count, 2);
  assert.equal(row.struggle_count, 1);
});

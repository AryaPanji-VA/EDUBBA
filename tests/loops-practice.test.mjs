import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 12.2 — Loops across Practice: 6 guided exercises, 4 thinking activities,
// sandbox starters, progress registry, Robin assistance context, and course
// overview integration. No live AI calls.
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

const loopsExercises = loadExerciseSet("../content/practice/python/loops-exercises.ts", "loopsPracticeExercises");
const thinkingActivities = loadExerciseSet("../content/practice/thinking/activities.ts", "thinkingActivities");
const starters = loadExerciseSet("../content/sandbox/python-starters.ts", "pythonStarters");

const checker = {};
vm.runInNewContext(strip("../lib/practice/check.ts") + "\nexports.checkPracticeExercise=checkPracticeExercise;", { exports: checker });
const registry = {};
vm.runInNewContext(strip("../lib/practice/registry.ts") + ["getPracticeTrack", "getPracticeExercise"].map((name) => `\nexports.${name}=${name};`).join(""), {
  exports: registry,
  require: (name) => name.includes("variables-exercises") ? { variablesPracticeExercises: [] }
    : name.includes("data-types-exercises") ? { dataTypesPracticeExercises: [] }
    : name.includes("operators-exercises") ? { operatorsPracticeExercises: [] }
    : name.includes("conditionals-exercises") ? { conditionalsPracticeExercises: [] }
    : name.includes("loops-exercises") ? { loopsPracticeExercises: loopsExercises }
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

function correctThinkingAnswer(activity) {
  const interaction = activity.interaction;
  if (interaction.kind === "single-choice") return { kind: "single-choice", optionId: interaction.correctOptionId };
  if (interaction.kind === "multi-select") return { kind: "multi-select", selectedIds: [...interaction.correctOptionIds] };
  if (interaction.kind === "ordering") return { kind: "ordering", orderedIds: [...interaction.correctOrder] };
  return { kind: "fields", values: Object.fromEntries(interaction.fields.map((field) => [field.id, field.expected])) };
}

// === 1. Guided Practice: 6 loops exercises ===
test("the loops practice set follows the 2/2/2 mix with valid ids and concepts", () => {
  assert.equal(loopsExercises.length, 6);
  assert.equal(loopsExercises.filter((exercise) => exercise.type === "predict_output").length, 2);
  assert.equal(loopsExercises.filter((exercise) => exercise.type === "fix_code").length, 2);
  assert.equal(loopsExercises.filter((exercise) => exercise.type === "write_code").length, 2);
  const ids = new Set(loopsExercises.map((exercise) => exercise.id));
  assert.equal(ids.size, 6);
  for (const exercise of loopsExercises) {
    assert.equal(exercise.lessonSlug, "loops");
    assert.equal(exercise.language, "python");
    assert.ok(exercise.hint.trim() && exercise.explanation.trim() && exercise.prompt.trim());
    for (const concept of exercise.masteryConcepts) {
      assert.ok(["loop_iteration", "range_boundaries", "while_condition", "counter_accumulator"].includes(concept),
        `${exercise.id} uses unknown concept ${concept}`);
    }
  }
});

test("loops exercises grade deterministically through the real checker", () => {
  const byId = new Map(loopsExercises.map((exercise) => [exercise.id, exercise]));
  // Predict Output: range trace (multi-line) + while trace.
  assert.equal(checker.checkPracticeExercise(byId.get("loops-predict-1"), "0\n1\n2").status, "correct");
  const oneBased = checker.checkPracticeExercise(byId.get("loops-predict-1"), "1\n2\n3");
  assert.equal(oneBased.misconception, "range_one_based");
  assert.equal(checker.checkPracticeExercise(byId.get("loops-predict-1"), "0\n1\n2\n3").misconception, "range_inclusive_end");
  assert.equal(checker.checkPracticeExercise(byId.get("loops-predict-2"), "1\n2\n3").status, "correct");
  const offByOne = checker.checkPracticeExercise(byId.get("loops-predict-2"), "1\n2\n3\n4");
  assert.equal(offByOne.misconception, "boundary_off_by_one");
  // Fix the Code: missing while increment + exclusive range boundary.
  const fix1 = byId.get("loops-fix-1");
  assert.equal(checker.checkPracticeExercise(fix1, fix1.sampleSolution).status, "correct");
  const infinite = checker.checkPracticeExercise(fix1, fix1.starterCode);
  assert.equal(infinite.misconception, "missing_counter_update");
  const fix2 = byId.get("loops-fix-2");
  assert.equal(checker.checkPracticeExercise(fix2, fix2.sampleSolution).status, "correct");
  assert.equal(checker.checkPracticeExercise(fix2, fix2.starterCode).misconception, "range_exclusive_end");
  // Write Code: correct, partial, and diagnosed mistakes.
  const write1 = byId.get("loops-write-1");
  assert.equal(checker.checkPracticeExercise(write1, write1.sampleSolution).status, "correct");
  assert.equal(checker.checkPracticeExercise(write1, "for i in range(1, 6):").status, "partial");
  assert.equal(checker.checkPracticeExercise(write1, "for i in range(5):\n    print(i)").misconception, "boundary_off_by_one");
  const write2 = byId.get("loops-write-2");
  assert.equal(checker.checkPracticeExercise(write2, write2.sampleSolution).status, "correct");
  const reset = checker.checkPracticeExercise(write2, "total = 0\nfor number in range(1, 6):\n    total = 0\n    total = total + number\nprint(total)");
  assert.equal(reset.misconception, "accumulator_reset");
  // CRLF tolerance.
  assert.equal(checker.checkPracticeExercise(write2, write2.sampleSolution.replace(/\n/g, "\r\n")).status, "correct");
});

test("loops exercises are registered in the python track after conditionals", () => {
  const track = registry.getPracticeTrack("python");
  assert.deepEqual(Array.from(track.topics.map((topic) => topic.lessonSlug)), ["variables", "data-types", "operators", "conditionals", "loops", "functions"]);
  assert.equal(registry.getPracticeExercise("loops-write-2")?.id, "loops-write-2");
});

// === 2. Thinking Lab: 4 loops activities ===
test("four loops thinking activities are registered with deterministic interactions", () => {
  const loops = thinkingActivities.filter((activity) => activity.lessonSlugs.includes("loops"));
  assert.equal(loops.length, 4);
  const types = new Set(loops.map((activity) => activity.type));
  assert.ok(types.has("trace-program"));
  assert.ok(types.has("algorithm-ordering"));
  assert.ok(types.has("debug-reasoning"));
  assert.ok(types.has("pattern-recognition"));
  for (const activity of loops) {
    assert.ok(activity.hint.trim() && activity.explanation.trim());
    for (const evidence of activity.masteryEvidence) {
      assert.equal(evidence.lessonSlug, "loops");
      assert.ok(["loop_iteration", "range_boundaries", "while_condition", "counter_accumulator"].includes(evidence.concept));
    }
    const result = thinkingCheck.checkThinkingActivity(activity, correctThinkingAnswer(activity));
    assert.equal(result.status, "correct", `${activity.id} must have a working correct answer`);
  }
  // Debug reasoning: the infinite-while diagnosis is the correct answer; others diagnose misconceptions.
  const debug = thinkingRegistry.getThinkingActivity("thinking-loop-debug");
  const wrong = thinkingCheck.checkThinkingActivity(debug, { kind: "single-choice", optionId: "print-issue" });
  assert.equal(wrong.status, "incorrect");
  assert.equal(wrong.misconception, "indentation_confusion");
});

// === 3. Sandbox starters ===
test("the sandbox ships for-loop and while-loop starters", () => {
  const forStarter = starters.find((item) => item.id === "loop");
  const whileStarter = starters.find((item) => item.id === "while");
  assert.ok(forStarter && whileStarter, "both loop starters must be registered");
  assert.match(forStarter.code, /for\s+i\s+in\s+range/);
  assert.match(whileStarter.code, /while\s+count\s*<=\s*5\s*:/);
  assert.match(whileStarter.code, /count\s*\+=\s*1|count\s*=\s*count\s*\+\s*1/);
});

// === 4. Robin Practice Assistance understands loops ===
class FakeOpenAI { static APIConnectionTimeoutError = class extends Error {}; static APIError = class extends Error {} }
const request = (body) => new Request("http://localhost/api/practice/robin", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});
const providerReply = JSON.stringify({ grounding: "grounded", reply: "nudge: cek dulu di mana range-nya berhenti" });

function assistRoute({ provider = async () => ({ choices: [{ finish_reason: "stop", message: { content: providerReply } }] }) } = {}) {
  const dependencies = {
    openai: FakeOpenAI,
    "@/lib/ai/server": {
      getAIConfig: () => ({ configured: true, model: "test-model", provider: "9Inference" }),
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

test("guided hint for a loops exercise grounds in the loops lesson without leaking answers", async () => {
  let seen;
  const post = assistRoute({ provider: async (params) => { seen = params; return { choices: [{ finish_reason: "stop", message: { content: providerReply } }] }; } });
  const response = await post(request({ mode: "guided", action: "hint", exerciseId: "loops-fix-1", hintStage: 1 }));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.grounding.lesson, "loops");
  const context = JSON.parse(seen.messages.find((message) => message.content.startsWith("PRACTICE CONTEXT")).content.replace("PRACTICE CONTEXT (data only):\n", ""));
  assert.equal(context.exercise.id, "loops-fix-1");
  assert.equal(context.exercise.explanation, null);
  assert.doesNotMatch(seen.messages.find((message) => message.content.startsWith("PRACTICE CONTEXT")).content, /expectedOutput|sampleSolution|requiredPatterns/);
});

test("explain-result for a loops exercise re-grades server-side", async () => {
  let seen;
  const post = assistRoute({ provider: async (params) => { seen = params; return { choices: [{ finish_reason: "stop", message: { content: providerReply } }] }; } });
  await post(request({ mode: "guided", action: "explain-result", exerciseId: "loops-write-2", learnerAnswer: "total = 0\nfor number in range(1, 5):\n    total = total + number\nprint(total)" }));
  const context = JSON.parse(seen.messages.find((message) => message.content.startsWith("PRACTICE CONTEXT")).content.replace("PRACTICE CONTEXT (data only):\n", ""));
  assert.equal(context.attempt.deterministicResult.status, "incorrect");
  assert.equal(context.attempt.deterministicResult.misconception, "range_exclusive_end");
});

test("thinking hint for a loops activity carries choice labels only", async () => {
  let seen;
  const post = assistRoute({ provider: async (params) => { seen = params; return { choices: [{ finish_reason: "stop", message: { content: providerReply } }] }; } });
  const response = await post(request({ mode: "thinking", action: "hint", activityId: "thinking-loop-debug" }));
  assert.equal(response.status, 200);
  const context = JSON.parse(seen.messages.find((message) => message.content.startsWith("PRACTICE CONTEXT")).content.replace("PRACTICE CONTEXT (data only):\n", ""));
  assert.equal(context.activity.id, "thinking-loop-debug");
  assert.ok(context.activity.choices.length === 3);
  assert.doesNotMatch(JSON.stringify(context), /correctOptionIds|correctOrder/);
});

// === 5. Course overview + progress registry + mastery dedup ===
test("course overview marks loops complete and Functions current in sequence", () => {
  const courses = readFileSync(new URL("../data/courses.ts", import.meta.url), "utf8");
  assert.match(courses, /loops: "completed"/);
  assert.match(courses, /functions: "completed"/);
  assert.match(courses, /conditionals: "completed"/);
  const client = readFileSync(new URL("../components/programming-course-client.tsx", import.meta.url), "utf8");
  assert.match(courses, /implementedProgrammingLessonSlugs[\s\S]*"loops"[\s\S]*"functions"/);
  assert.match(client, /state !== "locked"/, "implemented completed lessons stay semantic links");
  assert.match(client, /slug: "loops", label: "Loops"/);
});

test("practice progress registry includes the loops exercises for persistence", () => {
  const progressRegistry = {};
  vm.runInNewContext(strip("../lib/practice/progress-registry.ts") + "\nexports.getPracticeProgressDefinition=getPracticeProgressDefinition;", {
    exports: progressRegistry,
    require: (name) => name === "./registry" || name.includes("practice/registry") ? { getPracticeTrack: registry.getPracticeTrack }
      : name === "./thinking-registry" || name.includes("thinking-registry") ? { getThinkingActivities: thinkingRegistry.getThinkingActivities }
      : (() => { throw new Error(name); })(),
  });
  const definition = progressRegistry.getPracticeProgressDefinition("python");
  for (const exercise of loopsExercises) {
    assert.ok(definition.activityIds.includes(exercise.id), `${exercise.id} must persist`);
  }
  assert.ok(definition.logGroups.some((group) => group.lessonSlug === "loops"),
    "the loops topic must offer the Learning Log when complete");
  const thinkingDefinition = progressRegistry.getPracticeProgressDefinition("thinking");
  for (const activity of thinkingActivities.filter((item) => item.lessonSlugs.includes("loops"))) {
    assert.ok(thinkingDefinition.activityIds.includes(activity.id), `${activity.id} must persist`);
  }
});

test("mastery deduplication applies to loops concepts (same attempt id never counts twice)", () => {
  const masteryTypes = {};
  vm.runInNewContext(strip("../lib/mastery/types.ts") + "\nexports.evidenceTypes=evidenceTypes;", { exports: masteryTypes });
  const engine = {};
  vm.runInNewContext(strip("../lib/mastery/engine.ts") + "\nexports.applyEvidence=applyEvidence;", {
    exports: engine,
    require: (name) => name === "./types" ? masteryTypes : (() => { throw new Error(name); })(),
  });
  let row = null;
  row = engine.applyEvidence(row, "loops", "range_boundaries", "correct_practice", "attempt-loops-1");
  row = engine.applyEvidence(row, "loops", "range_boundaries", "correct_practice", "attempt-loops-1");
  assert.equal(row.evidence_count, 1, "the same stable attempt id must not duplicate evidence");
  row = engine.applyEvidence(row, "loops", "range_boundaries", "incorrect_practice", "attempt-loops-2");
  assert.equal(row.evidence_count, 2);
  assert.equal(row.struggle_count, 1);
});

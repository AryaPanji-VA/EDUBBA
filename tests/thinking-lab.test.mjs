import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

function transformed(path) {
  return stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), "utf8"), { mode: "transform" })
    .replace(/import "server-only";/g, "")
    .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");')
    .replace(/export /g, "");
}

function loadActivities() {
  const exports = {};
  vm.runInNewContext(transformed("../content/practice/thinking/activities.ts") + "\nexports.thinkingActivities=thinkingActivities;", { exports });
  return exports.thinkingActivities;
}

function loadChecker() {
  const exports = {};
  vm.runInNewContext(transformed("../lib/practice/thinking-check.ts") +
    "\nexports.checkThinkingActivity=checkThinkingActivity; exports.createEmptyThinkingSubmission=createEmptyThinkingSubmission; exports.isThinkingSubmissionComplete=isThinkingSubmissionComplete; exports.serializeThinkingSubmission=serializeThinkingSubmission; exports.deserializeThinkingSubmission=deserializeThinkingSubmission;", { exports });
  return exports;
}

function loadPracticeState() {
  const types = {};
  vm.runInNewContext(transformed("../lib/practice/types.ts") + "\ntypes.emptyPersistedPracticeState=emptyPersistedPracticeState;", { types });
  const exports = {};
  vm.runInNewContext(transformed("../lib/practice/state.ts") +
    "\nexports.freshPracticeState=freshPracticeState; exports.recordPracticeAttempt=recordPracticeAttempt; exports.movePracticeExercise=movePracticeExercise; exports.hydratePracticeState=hydratePracticeState;", {
    exports,
    require: (name) => name === "./types" ? types : (() => { throw new Error(name); })(),
  });
  return exports;
}

const activities = loadActivities();
const checker = loadChecker();
const byId = new Map(activities.map((activity) => [activity.id, activity]));

function correctSubmission(activity) {
  const interaction = activity.interaction;
  if (interaction.kind === "single-choice") return { kind: "single-choice", optionId: interaction.correctOptionId };
  if (interaction.kind === "multi-select") return { kind: "multi-select", selectedIds: [...interaction.correctOptionIds] };
  if (interaction.kind === "ordering") return { kind: "ordering", orderedIds: [...interaction.correctOrder] };
  return { kind: "fields", values: Object.fromEntries(interaction.fields.map((field) => [field.id, field.expected])) };
}

test("Thinking registry ships twenty-four unique beginner activities across all seven modes", () => {
  assert.equal(activities.length, 24);
  assert.equal(new Set(activities.map((activity) => activity.id)).size, 24);
  assert.deepEqual([...new Set(activities.map((activity) => activity.type))].sort(), [
    "abstraction", "algorithm-ordering", "debug-reasoning", "decomposition",
    "pattern-recognition", "pseudocode", "trace-program",
  ]);
  const allowedLessons = new Set(["variables", "data-types", "conditionals", "loops", "functions"]);
  const allowedMastery = {
    variables: new Set(["variable", "assignment", "reassignment", "expression", "name_binding", "identifier_naming"]),
    "data-types": new Set(["data_type", "integer", "float", "string", "boolean", "type_inspection"]),
    conditionals: new Set(["conditional_flow", "comparison_expression", "branch_selection", "input_conversion"]),
    loops: new Set(["loop_iteration", "range_boundaries", "while_condition", "counter_accumulator"]),
    functions: new Set(["function_definition", "function_call", "parameters_arguments", "return_values"]),
  };
  for (const activity of activities) {
    assert.equal(activity.difficulty, "beginner");
    assert.ok(activity.prompt.trim() && activity.hint.trim() && activity.explanation.trim());
    assert.ok(activity.lessonSlugs.every((slug) => allowedLessons.has(slug)));
    assert.ok(activity.masteryEvidence.every((mapping) => allowedMastery[mapping.lessonSlug].has(mapping.concept)));
    assert.equal(checker.checkThinkingActivity(activity, correctSubmission(activity)).status, "correct");
  }
});

test("decomposition supports objective partial credit and irrelevant-step diagnosis", () => {
  const activity = byId.get("thinking-decompose-age");
  assert.equal(checker.checkThinkingActivity(activity, { kind: "multi-select", selectedIds: ["ask", "convert"] }).status, "partial");
  const irrelevant = checker.checkThinkingActivity(activity, { kind: "multi-select", selectedIds: ["ask", "color"] });
  assert.equal(irrelevant.status, "incorrect");
  assert.equal(irrelevant.misconception, "irrelevant_step");
});

test("pattern recognition requires a rule that fits every example", () => {
  const activity = byId.get("thinking-pattern-double");
  assert.equal(checker.checkThinkingActivity(activity, { kind: "single-choice", optionId: "double" }).status, "correct");
  assert.equal(checker.checkThinkingActivity(activity, { kind: "single-choice", optionId: "plus-two" }).misconception, "single_example_pattern");
});

test("abstraction keeps relevant information and diagnoses extra detail", () => {
  const activity = byId.get("thinking-abstract-greeting");
  assert.equal(checker.checkThinkingActivity(activity, { kind: "multi-select", selectedIds: ["name", "format"] }).status, "correct");
  assert.equal(checker.checkThinkingActivity(activity, { kind: "multi-select", selectedIds: ["name", "age"] }).misconception, "irrelevant_detail");
});

test("algorithm ordering is exact and order-sensitive", () => {
  const activity = byId.get("thinking-order-sum");
  assert.equal(checker.checkThinkingActivity(activity, { kind: "ordering", orderedIds: ["read-a", "read-b", "add", "show"] }).status, "correct");
  assert.equal(checker.checkThinkingActivity(activity, { kind: "ordering", orderedIds: ["show", "read-a", "read-b", "add"] }).status, "incorrect");
  assert.equal(checker.checkThinkingActivity(activity, { kind: "ordering", orderedIds: ["read-a", "read-a", "add", "show"] }).status, "incorrect");
});

test("trace fields produce correct, partial, and incorrect results deterministically", () => {
  const activity = byId.get("thinking-trace-reassignment");
  assert.equal(checker.checkThinkingActivity(activity, { kind: "fields", values: { "after-first": "5", "after-second": "7", output: "7" } }).status, "correct");
  assert.equal(checker.checkThinkingActivity(activity, { kind: "fields", values: { "after-first": "5", "after-second": "5", output: "5" } }).status, "partial");
  assert.equal(checker.checkThinkingActivity(activity, { kind: "fields", values: { "after-first": "0", "after-second": "0", output: "0" } }).status, "incorrect");
});

test("pseudocode checking uses structured order instead of free-form AI grading", () => {
  const activity = byId.get("thinking-pseudocode-greeting");
  assert.equal(checker.checkThinkingActivity(activity, { kind: "ordering", orderedIds: ["ask", "build", "show"] }).status, "correct");
  assert.equal(checker.checkThinkingActivity(activity, { kind: "ordering", orderedIds: ["show", "ask", "build"] }).status, "incorrect");
});

test("debug reasoning reports the stored type misconception", () => {
  const activity = byId.get("thinking-debug-age");
  const wrong = checker.checkThinkingActivity(activity, { kind: "single-choice", optionId: "quotes" });
  assert.equal(wrong.status, "incorrect");
  assert.equal(wrong.misconception, "hide_type_problem");
  assert.match(wrong.misconceptionNote, /string|teks/i);
});

test("structured submissions serialize and restore while malformed answers fail closed", () => {
  const activity = byId.get("thinking-trace-types");
  const answer = correctSubmission(activity);
  const serialized = checker.serializeThinkingSubmission(answer);
  assert.equal(JSON.stringify(checker.deserializeThinkingSubmission(serialized, activity)), JSON.stringify(answer));
  assert.equal(checker.deserializeThinkingSubmission('{"kind":"fields","values":{"extra":"x"}}', activity), null);
  assert.equal(checker.deserializeThinkingSubmission("not-json", activity), null);
  assert.equal(checker.isThinkingSubmissionComplete(activity, checker.createEmptyThinkingSubmission(activity)), false);
});

test("Thinking progress reuses stable practice attempts and does not replay grading on hydration", () => {
  const component = readFileSync(new URL("../components/thinking-lab.tsx", import.meta.url), "utf8");
  const route = readFileSync(new URL("../app/api/practice/thinking/check/route.ts", import.meta.url), "utf8");
  const progressRoute = readFileSync(new URL("../app/api/practice/progress/route.ts", import.meta.url), "utf8");
  assert.match(component, /usePractice\("thinking"\)/);
  assert.match(component, /deserializeThinkingSubmission\(practice\.attempts/);
  assert.match(component, /setResult\(restored \? checkThinkingActivity/);
  assert.match(component, /const attemptId = crypto\.randomUUID\(\)/);
  assert.match(component, /practice\.recordAttempt\(activity\.id/);
  assert.match(route, /recordEvidence\(mapping\.lessonSlug, mapping\.concept, evidenceType, attemptId\)/);
  assert.match(progressRoute, /getPracticeProgressDefinition/);
});

test("Thinking current activity, answer, result, and stable attempt id survive progress hydration", () => {
  const state = loadPracticeState();
  const activity = byId.get("thinking-pattern-double");
  const answer = { kind: "single-choice", optionId: "double" };
  let runtime = state.freshPracticeState(true);
  runtime = state.movePracticeExercise(runtime, activity.id);
  runtime = state.recordPracticeAttempt(runtime, activity.id, {
    attemptId: "thinking-attempt-stable-1", status: "correct", misconception: null,
    answer: checker.serializeThinkingSubmission(answer),
  });
  const restored = state.hydratePracticeState({
    current_exercise_id: runtime.currentExerciseId,
    completed_exercise_ids: runtime.completedExerciseIds,
    progress_state: { attempts: runtime.attempts, logStatus: {} },
    completed_at: null,
  });
  assert.equal(restored.currentExerciseId, activity.id);
  assert.equal(restored.attempts[activity.id].attemptId, "thinking-attempt-stable-1");
  assert.equal(checker.deserializeThinkingSubmission(restored.attempts[activity.id].answer, activity).optionId, "double");
  assert.equal(restored.completedExerciseIds.includes(activity.id), true);
});

test("Sandbox handoff is reused and Thinking Lab remains AI-independent", () => {
  const component = readFileSync(new URL("../components/thinking-lab.tsx", import.meta.url), "utf8");
  const route = readFileSync(new URL("../app/api/practice/thinking/check/route.ts", import.meta.url), "utf8");
  assert.match(component, /createSandboxHandoff\(\{ id: activity\.id, code: activity\.sandboxCode \}\)/);
  assert.match(component, /SANDBOX_HANDOFF_STORAGE_KEY/);
  assert.doesNotMatch(component, /api\/robin|RobinCompanion/);
  assert.doesNotMatch(route, /openai|9Inference|chat\.completions|api\/robin/i);
  assert.match(route, /checkThinkingActivity/);
});

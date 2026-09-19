import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

function strip(path) {
  return stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), "utf8"), { mode: "transform" })
    .replace(/import "server-only";/g, "")
    .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");')
    .replace(/export /g, "");
}

function load(path, exportName) {
  const exports = {};
  vm.runInNewContext(strip(path) + `\nexports.${exportName}=${exportName};`, { exports });
  return exports[exportName];
}

const exercises = load("../content/practice/python/functions-exercises.ts", "functionsPracticeExercises");
const thinkingActivities = load("../content/practice/thinking/activities.ts", "thinkingActivities");
const starters = load("../content/sandbox/python-starters.ts", "pythonStarters");
const checker = {};
vm.runInNewContext(strip("../lib/practice/check.ts") + "\nexports.checkPracticeExercise=checkPracticeExercise;", { exports: checker });
const thinkingCheck = {};
vm.runInNewContext(strip("../lib/practice/thinking-check.ts") + "\nexports.checkThinkingActivity=checkThinkingActivity;", {
  exports: thinkingCheck,
  require: () => ({}),
});

function correctThinkingAnswer(activity) {
  const interaction = activity.interaction;
  if (interaction.kind === "single-choice") return { kind: "single-choice", optionId: interaction.correctOptionId };
  if (interaction.kind === "multi-select") return { kind: "multi-select", selectedIds: [...interaction.correctOptionIds] };
  if (interaction.kind === "ordering") return { kind: "ordering", orderedIds: [...interaction.correctOrder] };
  return { kind: "fields", values: Object.fromEntries(interaction.fields.map((field) => [field.id, field.expected])) };
}

test("Functions Guided Practice follows the 2 predict / 2 fix / 2 write inventory", () => {
  assert.equal(exercises.length, 6);
  assert.equal(exercises.filter((exercise) => exercise.type === "predict_output").length, 2);
  assert.equal(exercises.filter((exercise) => exercise.type === "fix_code").length, 2);
  assert.equal(exercises.filter((exercise) => exercise.type === "write_code").length, 2);
  assert.equal(new Set(exercises.map((exercise) => exercise.id)).size, 6);
  const allowed = ["function_definition", "function_call", "parameters_arguments", "return_values"];
  for (const exercise of exercises) {
    assert.equal(exercise.lessonSlug, "functions");
    assert.ok(exercise.hint.trim() && exercise.explanation.trim());
    for (const concept of exercise.masteryConcepts) assert.ok(allowed.includes(concept));
  }
});

test("Functions exercises grade correct answers and stored misconceptions deterministically", () => {
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  assert.equal(checker.checkPracticeExercise(byId.get("functions-predict-1"), "Hello Panji").status, "correct");
  assert.equal(checker.checkPracticeExercise(byId.get("functions-predict-1"), "Nothing").misconception, "definition_without_call");
  assert.equal(checker.checkPracticeExercise(byId.get("functions-predict-2"), "5\nNone").status, "correct");
  assert.equal(checker.checkPracticeExercise(byId.get("functions-predict-2"), "5\n5").misconception, "print_not_return");
  for (const id of ["functions-fix-1", "functions-fix-2", "functions-write-1", "functions-write-2"]) {
    const exercise = byId.get(id);
    assert.equal(checker.checkPracticeExercise(exercise, exercise.sampleSolution).status, "correct", `${id} sample must pass`);
  }
  assert.equal(checker.checkPracticeExercise(byId.get("functions-fix-1"), byId.get("functions-fix-1").starterCode).misconception, "missing_colon");
  assert.equal(checker.checkPracticeExercise(byId.get("functions-fix-2"), byId.get("functions-fix-2").starterCode).misconception, "print_not_return");
  assert.equal(checker.checkPracticeExercise(byId.get("functions-write-2"), "def add(a, b):\n    return a + b").status, "partial");
});

test("Functions is the fifth registered Guided Practice topic", () => {
  const registry = {};
  vm.runInNewContext(strip("../lib/practice/registry.ts") + "\nexports.getPracticeTrack=getPracticeTrack; exports.getPracticeExercise=getPracticeExercise;", {
    exports: registry,
    require: (name) => name.includes("functions-exercises") ? { functionsPracticeExercises: exercises }
      : name.includes("variables-exercises") ? { variablesPracticeExercises: [] }
      : name.includes("data-types-exercises") ? { dataTypesPracticeExercises: [] }
      : name.includes("operators-exercises") ? { operatorsPracticeExercises: [] }
      : name.includes("conditionals-exercises") ? { conditionalsPracticeExercises: [] }
      : name.includes("loops-exercises") ? { loopsPracticeExercises: [] }
      : (() => { throw new Error(name); })(),
  });
  assert.deepEqual(Array.from(registry.getPracticeTrack("python").topics.map((topic) => topic.lessonSlug)), ["variables", "data-types", "operators", "conditionals", "loops", "functions"]);
  assert.equal(registry.getPracticeExercise("functions-write-2").lessonSlug, "functions");
});

test("four Functions Thinking activities check deterministically", () => {
  const functions = thinkingActivities.filter((activity) => activity.lessonSlugs.includes("functions"));
  assert.equal(functions.length, 4);
  assert.deepEqual(new Set(functions.map((activity) => activity.type)), new Set(["decomposition", "algorithm-ordering", "trace-program", "debug-reasoning"]));
  for (const activity of functions) {
    assert.equal(thinkingCheck.checkThinkingActivity(activity, correctThinkingAnswer(activity)).status, "correct");
    for (const evidence of activity.masteryEvidence) assert.equal(evidence.lessonSlug, "functions");
  }
  const debug = functions.find((activity) => activity.id === "thinking-function-debug");
  assert.equal(thinkingCheck.checkThinkingActivity(debug, { kind: "single-choice", optionId: "print-broken" }).misconception, "print_not_numeric");
});

test("Sandbox provides both requested Functions starters", () => {
  const simple = starters.find((starter) => starter.id === "function");
  const returned = starters.find((starter) => starter.id === "function-return");
  assert.ok(simple && returned);
  assert.match(simple.code, /def greet\(name\):/);
  assert.match(simple.code, /greet\("Panji"\)/);
  assert.match(returned.code, /def add\(a, b\):/);
  assert.match(returned.code, /return a \+ b/);
  assert.match(returned.code, /print\(add\(3, 4\)\)/);
});

test("Functions progress and Learning Log reuse the existing registries", () => {
  const practiceRegistry = {};
  vm.runInNewContext(strip("../lib/practice/registry.ts") + "\nexports.getPracticeTrack=getPracticeTrack;", {
    exports: practiceRegistry,
    require: (name) => name.includes("functions-exercises") ? { functionsPracticeExercises: exercises }
      : name.includes("variables-exercises") ? { variablesPracticeExercises: [] }
      : name.includes("data-types-exercises") ? { dataTypesPracticeExercises: [] }
      : name.includes("operators-exercises") ? { operatorsPracticeExercises: [] }
      : name.includes("conditionals-exercises") ? { conditionalsPracticeExercises: [] }
      : name.includes("loops-exercises") ? { loopsPracticeExercises: [] }
      : (() => { throw new Error(name); })(),
  });
  const progress = {};
  vm.runInNewContext(strip("../lib/practice/progress-registry.ts") + "\nexports.getPracticeProgressDefinition=getPracticeProgressDefinition;", {
    exports: progress,
    require: (name) => name.includes("thinking-registry") ? { getThinkingActivities: () => thinkingActivities }
      : { getPracticeTrack: practiceRegistry.getPracticeTrack },
  });
  const definition = progress.getPracticeProgressDefinition("python");
  for (const exercise of exercises) assert.ok(definition.activityIds.includes(exercise.id));
  assert.ok(definition.logGroups.some((group) => group.lessonSlug === "functions"));
  const thinking = progress.getPracticeProgressDefinition("thinking");
  for (const activity of thinkingActivities.filter((item) => item.lessonSlugs.includes("functions"))) assert.ok(thinking.activityIds.includes(activity.id));
});

test("stable Functions attempt ids deduplicate mastery evidence", () => {
  const types = {};
  vm.runInNewContext(strip("../lib/mastery/types.ts") + "\nexports.evidenceTypes=evidenceTypes;", { exports: types });
  const engine = {};
  vm.runInNewContext(strip("../lib/mastery/engine.ts") + "\nexports.applyEvidence=applyEvidence;", {
    exports: engine,
    require: () => types,
  });
  let row = engine.applyEvidence(null, "functions", "return_values", "correct_practice", "functions-attempt-1");
  row = engine.applyEvidence(row, "functions", "return_values", "correct_practice", "functions-attempt-1");
  assert.equal(row.evidence_count, 1);
  row = engine.applyEvidence(row, "functions", "return_values", "incorrect_practice", "functions-attempt-2");
  assert.equal(row.evidence_count, 2);
});

test("Functions integrates into the course sequence and generic Practice Assistance context", () => {
  const courses = readFileSync(new URL("../data/courses.ts", import.meta.url), "utf8");
  const client = readFileSync(new URL("../components/programming-course-client.tsx", import.meta.url), "utf8");
  const assist = readFileSync(new URL("../app/api/practice/robin/route.ts", import.meta.url), "utf8");
  assert.match(courses, /loops: "completed"/);
  assert.match(courses, /functions: "completed"/);
  assert.match(courses, /implementedProgrammingLessonSlugs[\s\S]*"functions"/);
  assert.match(client, /state !== "coming-soon"/);
  assert.match(client, /slug: "functions", label: "Functions"/);
  assert.doesNotMatch(assist, /lessonSlug\s*===\s*["']functions["']/);
  assert.match(assist, /getPracticeExercise/);
});

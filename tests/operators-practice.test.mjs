import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

function strip(path) {
  return stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), "utf8"), { mode: "transform" })
    .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");').replace(/export /g, "");
}
function load(path, name) { const exports = {}; vm.runInNewContext(strip(path) + `\nexports.${name}=${name};`, { exports }); return exports[name]; }

const exercises = load("../content/practice/python/operators-exercises.ts", "operatorsPracticeExercises");
const thinking = load("../content/practice/thinking/activities.ts", "thinkingActivities");
const starters = load("../content/sandbox/python-starters.ts", "pythonStarters");
const checker = {}; vm.runInNewContext(strip("../lib/practice/check.ts") + "\nexports.checkPracticeExercise=checkPracticeExercise;", { exports: checker });
const thinkingChecker = {}; vm.runInNewContext(strip("../lib/practice/thinking-check.ts") + "\nexports.checkThinkingActivity=checkThinkingActivity;", { exports: thinkingChecker, require: () => ({}) });

function correctThinking(activity) {
  const input = activity.interaction;
  if (input.kind === "single-choice") return { kind: "single-choice", optionId: input.correctOptionId };
  if (input.kind === "multi-select") return { kind: "multi-select", selectedIds: [...input.correctOptionIds] };
  if (input.kind === "ordering") return { kind: "ordering", orderedIds: [...input.correctOrder] };
  return { kind: "fields", values: Object.fromEntries(input.fields.map((field) => [field.id, field.expected])) };
}

test("Operators Guided Practice contains two predict, two fix, and two write exercises", () => {
  assert.equal(exercises.length, 6);
  for (const type of ["predict_output", "fix_code", "write_code"]) assert.equal(exercises.filter((exercise) => exercise.type === type).length, 2);
  assert.equal(new Set(exercises.map((exercise) => exercise.id)).size, 6);
  for (const exercise of exercises) assert.equal(exercise.lessonSlug, "operators");
});

test("Operators Guided Practice grading and misconceptions are deterministic", () => {
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  assert.equal(checker.checkPracticeExercise(byId.get("operators-predict-1"), "14").status, "correct");
  assert.equal(checker.checkPracticeExercise(byId.get("operators-predict-1"), "20").misconception, "left_to_right_only");
  assert.equal(checker.checkPracticeExercise(byId.get("operators-predict-2"), "False").misconception, "and_or_confusion");
  for (const id of ["operators-fix-1", "operators-fix-2", "operators-write-1", "operators-write-2"]) {
    const exercise = byId.get(id);
    assert.equal(checker.checkPracticeExercise(exercise, exercise.sampleSolution).status, "correct", id);
  }
  assert.equal(checker.checkPracticeExercise(byId.get("operators-fix-1"), byId.get("operators-fix-1").starterCode).misconception, "assignment_vs_equality");
});

test("four Operators Thinking activities cover varied modes and grade deterministically", () => {
  const set = thinking.filter((activity) => activity.lessonSlugs.includes("operators"));
  assert.equal(set.length, 4);
  assert.deepEqual(new Set(set.map((activity) => activity.type)), new Set(["pattern-recognition", "trace-program", "algorithm-ordering", "debug-reasoning"]));
  for (const activity of set) {
    assert.equal(thinkingChecker.checkThinkingActivity(activity, correctThinking(activity)).status, "correct");
    assert.ok(activity.masteryEvidence.every((item) => item.lessonSlug === "operators"));
  }
  const debug = set.find((activity) => activity.id === "thinking-operator-debug");
  assert.equal(thinkingChecker.checkThinkingActivity(debug, { kind: "single-choice", optionId: "string" }).misconception, "type_distraction");
});

test("Sandbox contains minimal arithmetic and comparison Operators starters", () => {
  const arithmetic = starters.find((starter) => starter.id === "operators-arithmetic");
  const comparison = starters.find((starter) => starter.id === "operators-comparison");
  assert.match(arithmetic.code, /x % y/);
  assert.match(comparison.code, /age >= 18/);
  assert.match(comparison.code, /age == 18/);
});

test("stable Operators attempt ids deduplicate mastery evidence", () => {
  const types = {}; vm.runInNewContext(strip("../lib/mastery/types.ts") + "\nexports.evidenceTypes=evidenceTypes;", { exports: types });
  const engine = {}; vm.runInNewContext(strip("../lib/mastery/engine.ts") + "\nexports.applyEvidence=applyEvidence;", { exports: engine, require: () => types });
  let row = engine.applyEvidence(null, "operators", "comparison_operators", "correct_practice", "operators-attempt-1");
  row = engine.applyEvidence(row, "operators", "comparison_operators", "correct_practice", "operators-attempt-1");
  assert.equal(row.evidence_count, 1);
});

test("course compatibility activates Operators without deleting later progress", () => {
  const data = readFileSync(new URL("../data/courses.ts", import.meta.url), "utf8");
  const course = readFileSync(new URL("../components/programming-course-client.tsx", import.meta.url), "utf8");
  assert.match(data, /"data-types",\s*\n\s*"operators",\s*\n\s*"conditionals"/);
  assert.match(course, /progress\?\.completed_at/);
  assert.match(course, /find\(\(slug\) => nextStates\[slug\] !== "completed"\)/);
  assert.doesNotMatch(course, /delete.*progress|reset.*progress/i);
  assert.match(course, /slug: "operators", label: "Operators"/);
});

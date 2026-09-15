import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Deterministic practice checking (Phase 11B). Loads the real content and the
// real checker — no stubs — so the tests exercise the exact shipped config.
function strip(path) {
  return stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), "utf8"), { mode: "transform" })
    .replace(/export /g, "");
}

function loadExerciseSet(path, exportName) {
  const exports = {};
  vm.runInNewContext(strip(path) + `\nexports.${exportName}=${exportName};`, { exports });
  return exports[exportName];
}

const variablesExercises = loadExerciseSet("../content/practice/python/variables-exercises.ts", "variablesPracticeExercises");
const dataTypesExercises = loadExerciseSet("../content/practice/python/data-types-exercises.ts", "dataTypesPracticeExercises");
const check = {};
vm.runInNewContext(strip("../lib/practice/check.ts") + "\nexports.checkPracticeExercise=checkPracticeExercise; exports.normalizeCode=normalizeCode;", { exports: check });
const { checkPracticeExercise, normalizeCode } = check;

const byId = new Map([...variablesExercises, ...dataTypesExercises].map((exercise) => [exercise.id, exercise]));

// === 1. Predict Output ===
test("predict_output grades the exact printed output, tolerant of edge whitespace only", () => {
  const exercise = byId.get("variables-predict-1");
  assert.equal(checkPracticeExercise(exercise, "60").status, "correct");
  assert.equal(checkPracticeExercise(exercise, "  60\n").status, "correct");
  assert.equal(checkPracticeExercise(exercise, "60\r\n").status, "correct");
  assert.equal(checkPracticeExercise(exercise, "6 0").status, "incorrect");
  // Python output is case-sensitive: normalization never lowercases.
  const typed = byId.get("data-types-predict-2");
  assert.equal(checkPracticeExercise(typed, "<class 'int'>").status, "correct");
  assert.equal(checkPracticeExercise(typed, "<CLASS 'INT'>").status, "incorrect");
});

test("predict_output recognizes stored misconceptions and stays plain otherwise", () => {
  const exercise = byId.get("data-types-predict-1");
  const assumed = checkPracticeExercise(exercise, "7");
  assert.equal(assumed.status, "incorrect");
  assert.equal(assumed.misconception, "numeric_addition_assumed");
  assert.ok(assumed.misconceptionNote.trim());
  const plain = checkPracticeExercise(exercise, "77");
  assert.equal(plain.status, "incorrect");
  assert.equal(plain.misconception, null);
  assert.equal(plain.explanation, exercise.explanation);
});

// === 2. Fix the Code ===
test("fix_code grades structure and order, recognizing the stored misconception", () => {
  const exercise = byId.get("variables-fix-1");
  assert.equal(checkPracticeExercise(exercise, "total = 10\nprint(total)").status, "correct");
  assert.equal(checkPracticeExercise(exercise, "total = 10\n\nprint( total )").status, "correct");
  // The broken starter keeps print before assignment: incorrect + misconception.
  const broken = checkPracticeExercise(exercise, exercise.starterCode);
  assert.equal(broken.status, "incorrect");
  assert.equal(broken.misconception, "uses_name_before_binding");
  // Quoted print is recognized too.
  assert.equal(checkPracticeExercise(exercise, "total = 10\nprint(\"total\")").misconception, "prints_name_text");
});

test("fix_code is correct or incorrect — no partial for a single-bug fix", () => {
  const exercise = byId.get("variables-fix-2");
  assert.equal(checkPracticeExercise(exercise, "user_name = \"Arya\"\nprint(user_name)").status, "correct");
  const broken = checkPracticeExercise(exercise, exercise.starterCode);
  assert.equal(broken.status, "incorrect");
  assert.equal(broken.misconception, "invalid_identifier");
  const synthetic = { ...exercise, type: "fix_code", requiredPatterns: exercise.requiredPatterns.concat([{ source: "never\\s+matches", description: "impossible" }]) };
  assert.equal(checkPracticeExercise(synthetic, exercise.sampleSolution).status, "incorrect");
});

// === 3. Write Code ===
test("write_code distinguishes correct, partial, and incorrect submissions", () => {
  const exercise = byId.get("variables-write-1");
  assert.equal(checkPracticeExercise(exercise, "tempo = 92\nprint(tempo)").status, "correct");
  const partial = checkPracticeExercise(exercise, "tempo = 92");
  assert.equal(partial.status, "partial");
  assert.match(partial.explanation, /print tempo/);
  const wrong = checkPracticeExercise(exercise, "print(\"tempo\")");
  assert.equal(wrong.status, "incorrect");
  assert.equal(wrong.misconception, "prints_name_text");
});

test("write_code requires the expression form, not a literal shortcut", () => {
  const exercise = byId.get("variables-write-2");
  assert.equal(checkPracticeExercise(exercise, "score = 7\nscore = score + 5\nprint(score)").status, "correct");
  assert.equal(checkPracticeExercise(exercise, "score = 7\nscore += 5\nprint(score)").status, "correct");
  const literal = checkPracticeExercise(exercise, "score = 7\nscore = 12\nprint(score)");
  assert.equal(literal.status, "incorrect");
  assert.equal(literal.misconception, "literal_instead_of_expression");
});

// === 4. Normalization + fail-closed behavior ===
test("normalization unifies CRLF and trailing whitespace without reordering meaning", () => {
  assert.equal(normalizeCode("a = 1\r\nprint(a)  \r\n"), "a = 1\nprint(a)");
  const exercise = byId.get("variables-fix-1");
  assert.equal(checkPracticeExercise(exercise, "total = 10\r\nprint(total)  ").status, "correct");
});

test("an invalid content pattern never grades a false correct", () => {
  const exercise = { ...byId.get("variables-write-1"), requiredPatterns: [{ source: "([unclosed", description: "broken pattern" }] };
  assert.equal(checkPracticeExercise(exercise, "tempo = 92\nprint(tempo)").status, "incorrect");
});

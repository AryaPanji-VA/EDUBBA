import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.3A — Operators modernization. Golden identity preserved: same slug,
// nine activity ids, four persisted mastery keys, Robin contract. The lesson
// becomes the formal owner of operators with a deliberate scope: arithmetic
// (+ - * / plus light %, //, **), comparison, = vs ==, light precedence —
// while and/or/not are only named as a later-lesson topic.

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

function loadModule(path, deps = {}) {
  const raw = stripTypeScriptTypes(read(path), { mode: "transform" });
  const names = [...raw.matchAll(/export (?:async )?(?:function|const|class) (\w+)/g)].map((match) => match[1]);
  const code = raw
    .replace(/import type \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import (\w+) from "[^"]+";/g, "")
    .replace(/import "[^"]+";/g, "")
    .replace(/export type \{[^}]+\};/g, "")
    .replace(/export /g, "") + names.map((name) => `\nexports.${name}=${name};`).join("");
  const exports = {};
  vm.runInNewContext(code, { URL, exports, ...deps });
  return exports;
}

const { operatorsActivities } = loadModule("content/lessons/programming/operators-activities.ts");
const { operatorsLessonContent } = loadModule("content/lessons/programming/operators.ts");
const { operatorsMasteryConfig } = loadModule("content/lessons/programming/operators-mastery.ts", { LessonMasteryConfig: {} });

// === 1. Legacy identity: nine persisted activity ids and four mastery keys ===
test("activity ids are exactly the persisted nine — no renames, no removals", () => {
  assert.deepEqual(Array.from(operatorsActivities.map((a) => a.id)), [
    "why", "intuition", "predict-arithmetic", "predict-division", "predict-boolean", "try", "formalize", "robin-check", "connect",
  ]);
  assert.deepEqual(Array.from(operatorsMasteryConfig.concepts), [
    "arithmetic_operations", "comparison_operators", "logical_operators", "operator_precedence",
  ]);
  // The logical concept keeps its persisted evidence route (Practice Lab + Robin).
  assert.equal(operatorsMasteryConfig.activityConceptToMastery("logical_trace"), "logical_operators");
  assert.equal(operatorsMasteryConfig.activityConceptToMastery("writing_expression"), "arithmetic_operations");
});

// === 2. Learning targets: formal ownership of arithmetic, comparison, = vs == ===
test("arithmetic, comparison, and the = vs == split are formally covered", () => {
  const all = operatorsActivities.map((a) => (a.code ?? "") + " " + a.content.join(" ")).join("\n");
  for (const op of ["+", "-", "*", "/"]) assert.ok(all.includes(op), `${op} must be covered`);
  for (const shape of ["%", "**", "//"]) assert.match(read("content/lessons/programming/operators.ts"), new RegExp(shape.replace("*", "\\*")), `${shape} appears lightly`);
  // comparison produces boolean
  assert.match(operatorsActivities.find((a) => a.id === "predict-boolean").code, /age >= 18/);
  // = vs == distinction
  assert.match(operatorsActivities.find((a) => a.id === "predict-equality" )?.code ?? read("content/lessons/programming/operators.ts"), /==/);
  assert.match(read("content/lessons/programming/operators.ts"), /= assigns a value.*== compares|== compares|= stores/i);
});

test("precedence stays light: parentheses plus mult-before-add, no full table", () => {
  const precedence = operatorsActivities.find((a) => a.id === "predict-arithmetic");
  assert.match(precedence.code, /2 \+ 3 \* 4/);
  assert.equal(precedence.correctAnswer, "14");
  assert.match(read("content/lessons/programming/operators.ts"), /\(2 \+ 3\) \* 4/);
  // No full precedence-table teaching.
  const prose = operatorsActivities.map((a) => a.content.join(" ")).join("\n");
  assert.doesNotMatch(prose, /full precedence|tabel precedence/i);
});

// === 3. Scope: no logical-operator teaching, no input, no control flow ===
test("and/or/not are named only as a later topic — never taught", () => {
  for (const activity of operatorsActivities) {
    if (activity.type === "formalize") continue; // formalize carries the light naming mention
    const text = activity.content.join(" ") + " " + (activity.explanation ?? "");
    // Forbid the definitional teaching phrasing, not the English words.
    assert.doesNotMatch(text, /and is True|or is True|not reverses|both sides are True|truth table/i, `${activity.id} must not teach logical operators`);
  }
  // The code never combines with and/or/not (activity code is pure Python;
  // English titles/explanations are prose, not operator teaching).
  const allCode = operatorsActivities.map((a) => a.code ?? "").join("\n");
  assert.doesNotMatch(allCode, /\band\b|\bor\b|\bnot\b/);
});

test("no input(), no control flow, no advanced operator categories", () => {
  const forbiddenCode = /\binput\(|\bif\b|\belif\b|\belse\b|\bwhile\b|\bfor\b|\bdef\b|\breturn\b|\bis not\b|\bis\b(?= [a-z])|in \(|not in|\+=|-=|\*=|\bf\"|f'/;
  for (const activity of operatorsActivities) {
    if (activity.code) assert.doesNotMatch(activity.code, forbiddenCode, `${activity.id} code must stay in scope`);
  }
  for (const example of operatorsLessonContent.codeExamples) {
    assert.doesNotMatch(example.code, forbiddenCode, "supplement examples stay in scope");
  }
  const prose = operatorsActivities.map((a) => a.content.join(" ")).join("\n");
  assert.doesNotMatch(prose, /\binput\(|\bbitwise\b|\bwalrus\b|\bidentity operator\b|\bmembership operator\b|\btruth table\b|\baugmented assignment\b/i);
});

// === 4. TRY requires the operator expression, not the hardcoded result ===
test("the TRY checker requires score = score + 5 and rejects shortcuts", () => {
  const practice = operatorsActivities.find((a) => a.type === "practice");
  assert.equal(practice.id, "try");
  assert.equal(practice.checkAnswer("score = score + 5"), true);
  assert.equal(practice.checkAnswer("score=score+5"), true);
  assert.equal(practice.checkAnswer("  score = score + 5  "), true);
  assert.equal(practice.checkAnswer("score = 15"), false, "hardcoding the result skips the operator");
  assert.equal(practice.checkAnswer("score + 5"), false, "missing reassignment");
  assert.equal(practice.checkAnswer("score = score + 15"), false);
  assert.equal(practice.checkAnswer(""), false);
});

// === 5. Course integration: roadmap handoff and Module 03 placement ===
test("connect hands off to User Input and keeps Conditionals on the roadmap", () => {
  const connect = operatorsActivities.find((a) => a.type === "connect");
  const path = connect.content[0];
  assert.match(path, /Operators → User Input/, "User Input must be the immediate next lesson");
  const atInput = path.indexOf("User Input");
  const atConditionals = path.indexOf("Conditionals");
  assert.ok(atInput >= 0 && atConditionals > atInput, "Conditionals stays on the roadmap after User Input");
});

test("the Robin Check question no longer leaks the conditional framing", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /question: "Jelasin pakai bahasa lu sendiri: apa beda = dan ==, dan apa hasil dari score > 5 kalau score bernilai 10\?"/);
  const robin = operatorsActivities.find((a) => a.type === "robin_check");
  assert.match(robin.content[0], /score > 5/);
  assert.doesNotMatch(robin.content[0], /\bif\b/);
  // The rubrics keep the persisted concept keys.
  const check = read("content/lessons/programming/operators-check-instructions.ts");
  assert.match(check, /"comparison_operators","logical_operators","operator_precedence"/);
});

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

function load(path, exportName, shims = {}) {
  const exports = {};
  vm.runInNewContext(strip(path) + `\nexports.${exportName}=${exportName};`, {
    exports, require: (name) => shims[name] ?? (() => { throw new Error(name); })(),
  });
  return exports[exportName];
}

const content = load("../content/lessons/programming/operators.ts", "operatorsLessonContent");
const activities = load("../content/lessons/programming/operators-activities.ts", "operatorsActivities");
const mastery = load("../content/lessons/programming/operators-mastery.ts", "operatorsMasteryConfig", { "@/lib/mastery/types": {} });
const relevance = load("../content/lessons/programming/operators-relevance.ts", "operatorsRelevance");
const labels = load("../content/lessons/programming/operators-lesson-config.ts", "operatorsMasteryConceptLabels", {
  "@/content/lessons/shared-copy": {}, "@/lib/robin/check": {},
});

test("Operators content covers the requested beginner operator scope", () => {
  assert.equal(content.slug, "operators");
  assert.equal(content.codeExamples.length, 5);
  assert.ok(content.commonMistakes.length >= 9);
  assert.equal(content.quickChecks.length, 3);
  const text = JSON.stringify(content);
  for (const token of ["//", "%", "**", "==", "!=", "<=", ">=", "and", "or", "not", "precedence", "boolean"]) assert.match(text, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  assert.doesNotMatch(text, /bitwise|walrus|identity operator|membership operator/i);
  for (const check of content.quickChecks) assert.ok(check.options.includes(check.answer));
});

test("Operators learning flow follows the nine-stage lesson architecture", () => {
  assert.equal(activities.length, 9);
  assert.deepEqual(Array.from(activities.map((activity) => activity.type)), ["intro", "explain", "predict", "predict", "predict", "practice", "formalize", "robin_check", "connect"]);
  assert.equal(activities.find((activity) => activity.id === "predict-arithmetic").correctAnswer, "14");
  assert.equal(activities.find((activity) => activity.id === "predict-boolean").correctAnswer, "True");
  const practice = activities.find((activity) => activity.id === "try");
  assert.equal(practice.checkAnswer("score >= 70 and score <= 100"), true);
  assert.equal(practice.checkAnswer("score >= 70 or score <= 100"), false);
});

test("Operators mastery and relevance remain inside the four-concept vocabulary", () => {
  const concepts = Array.from(mastery.concepts);
  assert.deepEqual(concepts, ["arithmetic_operations", "comparison_operators", "logical_operators", "operator_precedence"]);
  for (const activity of activities) {
    if (activity.concept === "connections") continue;
    assert.ok(concepts.includes(mastery.activityConceptToMastery(activity.concept)), activity.concept);
  }
  for (const concept of [...relevance.checkConcepts(), ...relevance.chatConcepts("jelasin precedence dan comparison")]) assert.ok(concepts.includes(concept));
  for (const concept of concepts) assert.ok(labels[concept]);
});

test("Operators route, localization, progress, Source Mode, Robin, and Learning Log reuse existing infrastructure", () => {
  const route = readFileSync(new URL("../app/api/lessons/operators/route.ts", import.meta.url), "utf8");
  const page = readFileSync(new URL("../app/courses/programming/operators/page.tsx", import.meta.url), "utf8");
  const component = readFileSync(new URL("../components/operators-lesson.tsx", import.meta.url), "utf8");
  const localization = readFileSync(new URL("../content/lessons/programming/operators-localization.ts", import.meta.url), "utf8");
  assert.match(route, /loadOperatorsLesson/);
  assert.match(page, /OperatorsLesson/);
  assert.match(component, /useProgress\("operators"/);
  assert.match(component, /RobinCheck lessonSlug="operators"/);
  assert.match(component, /RobinCompanion lessonSlug="operators"/);
  assert.match(component, /LearningLogOffer lessonSlug="operators"/);
  assert.match(component, /sourceMode/);
  assert.match(localization, /getOperatorsActivities/);
  assert.match(localization, /localizeOperatorsContent/);
});

test("Operators server rubrics preserve deterministic authority and structured output", () => {
  const check = readFileSync(new URL("../content/lessons/programming/operators-check-instructions.ts", import.meta.url), "utf8");
  const feedback = readFileSync(new URL("../content/lessons/programming/operators-feedback-instructions.ts", import.meta.url), "utf8");
  assert.match(check, /assignment_vs_equality/);
  assert.match(check, /comparison_not_boolean/);
  assert.match(check, /Return only JSON/);
  assert.match(check, /strong: all three recognized concepts/);
  assert.match(check, /If misconceptions is non-empty, signal must be shaky/);
  assert.match(feedback, /Correctness is already determined server-side/);
  assert.match(feedback, /Never re-grade/);
});

test("Operators source seed is idempotent and optional at runtime", () => {
  const sql = readFileSync(new URL("../database/phase12-operators-sources.sql", import.meta.url), "utf8");
  const loader = readFileSync(new URL("../lib/lessons/operators.ts", import.meta.url), "utf8");
  assert.match(sql, /on conflict \(url\) do update/);
  assert.match(sql, /on conflict \(lesson_id, source_id\) do update/);
  assert.match(sql, /l\.slug = 'operators'/);
  assert.match(loader, /const sources: LessonSource\[\] = \[\]/);
  assert.match(loader, /if \(sourceLinks\.length > 0\)/);
});

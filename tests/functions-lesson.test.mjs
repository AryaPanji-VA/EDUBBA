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

function loadModule(path, exportNames, shims = {}) {
  const exports = {};
  vm.runInNewContext(strip(path) + exportNames.map((name) => `\nexports.${name}=${name};`).join(""), {
    exports,
    require: (name) => {
      if (name in shims) return shims[name];
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return exports;
}

const content = loadModule("../content/lessons/programming/functions.ts", ["functionsLessonContent"]).functionsLessonContent;
const activities = loadModule("../content/lessons/programming/functions-activities.ts", ["functionsActivities"]).functionsActivities;
const mastery = loadModule("../content/lessons/programming/functions-mastery.ts", ["functionsMasteryConfig"], {
  "@/lib/mastery/types": {},
}).functionsMasteryConfig;
const relevance = loadModule("../content/lessons/programming/functions-relevance.ts", ["functionsRelevance"]).functionsRelevance;
const labels = loadModule("../content/lessons/programming/functions-lesson-config.ts", ["functionsMasteryConceptLabels"], {
  "@/lib/robin/check": {},
  "@/content/lessons/shared-copy": {},
}).functionsMasteryConceptLabels;

test("Functions content covers the complete beginner scope without advanced topics", () => {
  assert.equal(content.slug, "functions");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 4);
  assert.equal(content.codeExamples.length, 4);
  assert.ok(content.keyTerms.length >= 8);
  assert.ok(content.commonMistakes.length >= 7);
  assert.ok(content.quickChecks.length >= 3);
  const text = JSON.stringify(content);
  for (const term of ["def", "Parameter", "Argument", "return", "Local variable"]) assert.match(text, new RegExp(term, "i"));
  assert.doesNotMatch(text, /recursion|lambda|decorator|generator|closure|\*args|\*\*kwargs/i);
  for (const check of content.quickChecks) assert.ok(check.options.includes(check.answer));
  assert.match(content.codeExamples[3].explanation, /prints 7/);
});

test("Functions learning flow has nine ordered activities with deterministic checks", () => {
  assert.equal(activities.length, 9);
  assert.deepEqual(Array.from(activities.map((activity) => activity.type)), ["intro", "explain", "predict", "predict", "predict", "practice", "formalize", "robin_check", "connect"]);
  assert.equal(activities.find((activity) => activity.id === "predict-call").correctAnswer, "Nothing");
  assert.equal(activities.find((activity) => activity.id === "predict-return").correctAnswer, "7");
  const practice = activities.find((activity) => activity.id === "try");
  assert.equal(practice.checkAnswer("def tambah(a, b):"), true);
  assert.equal(practice.checkAnswer("def tambah(a, b)"), false);
});

test("Functions mastery and relevance stay lesson-scoped", () => {
  const concepts = Array.from(mastery.concepts);
  assert.deepEqual(concepts, ["function_definition", "function_call", "parameters_arguments", "return_values"]);
  for (const activity of activities) {
    if (activity.concept === "connections") continue;
    const mapped = mastery.activityConceptToMastery(activity.concept);
    assert.ok(mapped && concepts.includes(mapped), `${activity.concept} must map to Functions mastery`);
  }
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["function_definition", "function_call", "return_values"]);
  assert.ok(relevance.chatConcepts("apa beda parameter sama argument?").includes("parameters_arguments"));
  assert.ok(relevance.chatConcepts("kenapa print bukan return?").includes("return_values"));
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
  for (const concept of concepts) assert.ok(labels[concept]);
});

test("Functions Robin rubrics keep grading server-controlled and structured", () => {
  const check = readFileSync(new URL("../content/lessons/programming/functions-check-instructions.ts", import.meta.url), "utf8");
  const feedback = readFileSync(new URL("../content/lessons/programming/functions-feedback-instructions.ts", import.meta.url), "utf8");
  assert.match(check, /definition_without_call/);
  assert.match(check, /print_not_return/);
  assert.match(check, /parameter_argument_mismatch/);
  assert.match(check, /Return only JSON/);
  assert.match(feedback, /Correctness is already determined server-side/);
  assert.match(feedback, /followUp/);
});

test("Functions route, component, localization, progress, and Learning Log reuse the existing architecture", () => {
  const route = readFileSync(new URL("../app/api/lessons/functions/route.ts", import.meta.url), "utf8");
  const page = readFileSync(new URL("../app/courses/programming/functions/page.tsx", import.meta.url), "utf8");
  const component = readFileSync(new URL("../components/functions-lesson.tsx", import.meta.url), "utf8");
  const localization = readFileSync(new URL("../content/lessons/programming/functions-localization.ts", import.meta.url), "utf8");
  assert.match(route, /loadFunctionsLesson/);
  assert.match(page, /FunctionsLesson/);
  assert.match(component, /useProgress\("functions"/);
  assert.match(component, /lessonSlug="functions"/);
  assert.match(component, /LearningLogOffer lessonSlug="functions"/);
  assert.match(component, /RobinCompanion lessonSlug="functions"/);
  assert.match(component, /sourceMode/);
  assert.match(localization, /getFunctionsActivities/);
  assert.match(localization, /localizeFunctionsContent/);
});

test("Functions source seed is idempotent and lesson-scoped", () => {
  const sql = readFileSync(new URL("../database/phase12-functions-sources.sql", import.meta.url), "utf8");
  assert.match(sql, /on conflict \(url\) do update/);
  assert.match(sql, /on conflict \(lesson_id, source_id\) do update/);
  assert.match(sql, /l\.slug = 'functions'/);
});

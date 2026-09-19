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

test("Functions content covers the beginner definition/call scope without advanced topics", () => {
  assert.equal(content.slug, "functions");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  assert.ok(content.keyTerms.length >= 6);
  assert.ok(content.commonMistakes.length >= 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const term of ["Function", "def", "Define", "Call", "Function body"]) {
    assert.ok(content.keyTerms.some((item) => item.term === term), `${term} must be a key term`);
  }
  // Ownership: definition + call only. Parameters/return get their own lessons —
  // a forward-looking sentence is allowed, teaching them is not.
  const text = JSON.stringify(content);
  assert.doesNotMatch(text, /recursion|lambda|decorator|generator|closure|\*args|\*\*kwargs/i);
  assert.ok(content.keyTerms.every((item) => !/^(Parameter|Argument|return)$/i.test(item.term)));
  assert.ok(content.codeExamples.every((example) => /def\s/.test(example.code)), "every code example defines a function");
  assert.ok(content.codeExamples.some((example) => /greet\(\)/.test(example.code)), "the call model is shown");
  for (const check of content.quickChecks) assert.ok(check.options.includes(check.answer));
  // The required definition-does-not-run trace exists.
  const all = JSON.stringify(content.codeExamples);
  assert.match(all, /Start/);
});
test("Functions learning flow has nine ordered activities with deterministic checks", () => {
  assert.equal(activities.length, 9);
  assert.deepEqual(Array.from(activities.map((activity) => activity.id)), [
    "why", "intuition", "predict-call", "predict-return", "predict-print-return",
    "try", "formalize", "robin-check", "connect",
  ]);
  assert.equal(activities.find((activity) => activity.id === "predict-call").correctAnswer, "Nothing");
  // The required prediction: the body does not run at definition; output is Start, then Hi.
  assert.equal(activities.find((activity) => activity.id === "predict-return").correctAnswer, "Start, then Hi");
  assert.equal(activities.find((activity) => activity.id === "predict-print-return").correctAnswer, "Halo, Halo");
  const practice = activities.find((activity) => activity.id === "try");
  assert.equal(practice.checkAnswer('def say_hello():\n    print("Halo")\n\nsay_hello()'), true, "definition + call accepted");
  assert.equal(practice.checkAnswer('def say_hello():\n    print("Halo")'), false, "definition without call rejected");
  assert.equal(practice.checkAnswer("say_hello()"), false, "call without definition rejected");
  assert.equal(practice.checkAnswer('print("Halo")'), false, "hardcoded print rejected");
  assert.equal(practice.checkAnswer('def f(x):\n    print(x)\n\nf(1)'), false, "parameters rejected — later lesson");
});
test("Functions mastery and relevance stay lesson-scoped", () => {
  // All four legacy keys are preserved for persisted-evidence compatibility.
  const concepts = Array.from(mastery.concepts);
  assert.deepEqual(concepts, ["function_definition", "function_call", "parameters_arguments", "return_values"]);
  for (const activity of activities) {
    if (activity.concept === "connections") continue;
    const mapped = mastery.activityConceptToMastery(activity.concept);
    assert.ok(mapped && ["function_definition", "function_call"].includes(mapped), `${activity.concept} must map to def/call mastery`);
  }
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["function_definition", "function_call"]);
  assert.ok(relevance.chatConcepts("def itu ngapain sih?").length > 0);
  assert.ok(relevance.chatConcepts("kok panggil greet() nggak jalan?").length > 0);
  // Parameter/return questions belong to their own Module 05 lessons now.
  assert.equal(relevance.chatConcepts("apa beda parameter sama argument?").length, 0);
  assert.equal(relevance.chatConcepts("kenapa print bukan return?").length, 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
  for (const concept of concepts) assert.ok(labels[concept]);
});
test("Functions Robin rubrics keep grading server-controlled and structured", () => {
  const check = readFileSync(new URL("../content/lessons/programming/functions-check-instructions.ts", import.meta.url), "utf8");
  const feedback = readFileSync(new URL("../content/lessons/programming/functions-feedback-instructions.ts", import.meta.url), "utf8");
  assert.match(check, /definition_executes_body/);
  assert.match(check, /definition_without_call/);
  assert.match(check, /function_definition/);
  assert.match(check, /function_call/);
  assert.doesNotMatch(check, /parameter_argument_mismatch|print_not_return/, "parameter/return misconceptions moved to their own lessons");
  assert.match(check, /Return only JSON/);
  assert.match(feedback, /Correctness is already determined server-side/);
  assert.match(feedback, /followUp/);
  // The practice set still spans the broader functions topic, so the legacy
  // misconception vocabulary stays available for Practice Mode feedback.
  assert.match(feedback, /parameter_argument_mismatch/);
  assert.match(feedback, /print_not_return/);
  assert.match(feedback, /prints_name_text/);
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

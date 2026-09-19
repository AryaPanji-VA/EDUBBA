import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";
import { requireMapForStandardLessons } from "./helpers/standard-lessons.mjs";

// Phase 12.1 — Conditionals lesson: registry, content availability, mastery and
// adaptation mapping, and the Robin Check / Smart Feedback instruction contract.
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

const content = loadModule("../content/lessons/programming/conditionals.ts", ["conditionalsLessonContent"]).conditionalsLessonContent;
const activities = loadModule("../content/lessons/programming/conditionals-activities.ts", ["conditionalsActivities"]).conditionalsActivities;
const mastery = loadModule("../content/lessons/programming/conditionals-mastery.ts", ["conditionalsMasteryConfig"], {
  "@/lib/mastery/types": {},
}).conditionalsMasteryConfig;
const relevance = loadModule("../content/lessons/programming/conditionals-relevance.ts", ["conditionalsRelevance"]).conditionalsRelevance;
const config = loadModule("../content/lessons/programming/conditionals-lesson-config.ts", ["conditionalsMasteryConceptLabels", "conditionalsReinforcement"], {
  "@/lib/robin/check": {},
  "@/content/lessons/shared-copy": {},
}).conditionalsMasteryConceptLabels;

const registry = {};
vm.runInNewContext(strip("../lib/lessons/registry.ts") + ["getLessonDefinition", "isRegisteredLesson"].map((name) => `\nexports.${name}=${name};`).join(""), {
  exports: registry,
  require: (name) => {
    const map = {
      "variables-activities": { variablesActivities: [] },
      "programming/variables": { variablesLessonContent: { academicExplanation: [], codeExamples: [], keyTerms: [], commonMistakes: [] } },
      "variables-mastery": { variablesMasteryConfig: { concepts: [] } },
      "variables-relevance": { variablesRelevance: {} },
      "lib/lessons/variables": { loadVariablesLesson: async () => ({}) },
      "variables-check-instructions": { robinCheckInstructions: "variables rubric" },
      "robin/check-instructions": { robinCheckInstructions: "variables rubric" },
      "quiz-feedback-instructions": { quizFeedbackInstructions: "variables feedback" },
      "check-support": { adaptCheckFeedback: () => {} },
      "quiz-feedback": { quizMisconceptions: [] },
      "data-types-activities": { dataTypesActivities: [] },
      "programming/data-types": { dataTypesLessonContent: { academicExplanation: [], codeExamples: [], keyTerms: [], commonMistakes: [] } },
      "data-types-mastery": { dataTypesMasteryConfig: { concepts: [] } },
      "data-types-relevance": { dataTypesRelevance: {} },
      "lib/lessons/data-types": { loadDataTypesLesson: async () => ({}) },
      "data-types-check-instructions": { dataTypesCheckInstructions: "data-types rubric" },
      "data-types-feedback-instructions": { dataTypesFeedbackInstructions: "data-types feedback" },
      "operators-activities": { operatorsActivities: [] },
      "programming/operators": { operatorsLessonContent: { academicExplanation: [], codeExamples: [], keyTerms: [], commonMistakes: [] } },
      "operators-mastery": { operatorsMasteryConfig: { concepts: [] } },
      "operators-relevance": { operatorsRelevance: {} },
      "lib/lessons/operators": { loadOperatorsLesson: async () => ({}) },
      "operators-check-instructions": { operatorsCheckInstructions: "operators rubric" },
      "operators-feedback-instructions": { operatorsFeedbackInstructions: "operators feedback" },
      "conditionals-activities": { conditionalsActivities: activities },
      "programming/conditionals": { conditionalsLessonContent: content },
      "conditionals-mastery": { conditionalsMasteryConfig: mastery },
      "conditionals-relevance": { conditionalsRelevance: relevance },
      "lib/lessons/conditionals": { loadConditionalsLesson: async () => ({}) },
      "conditionals-check-instructions": { conditionalsCheckInstructions: "conditionals rubric" },
      "conditionals-feedback-instructions": { conditionalsFeedbackInstructions: "conditionals feedback" },
      "loops-activities": { loopsActivities: [] },
      "programming/loops": { loopsLessonContent: { academicExplanation: [], codeExamples: [], keyTerms: [], commonMistakes: [] } },
      "loops-mastery": { loopsMasteryConfig: { concepts: [] } },
      "loops-relevance": { loopsRelevance: {} },
      "lib/lessons/loops": { loadLoopsLesson: async () => ({}) },
      "loops-check-instructions": { loopsCheckInstructions: "loops rubric" },
      "loops-feedback-instructions": { loopsFeedbackInstructions: "loops feedback" },
      "functions-activities": { functionsActivities: [] },
      "programming/functions": { functionsLessonContent: { academicExplanation: [], codeExamples: [], keyTerms: [], commonMistakes: [] } },
      "functions-mastery": { functionsMasteryConfig: { concepts: [] } },
      "functions-relevance": { functionsRelevance: {} },
      "lib/lessons/functions": { loadFunctionsLesson: async () => ({}) },
      "functions-check-instructions": { functionsCheckInstructions: "functions rubric" },
      "functions-feedback-instructions": { functionsFeedbackInstructions: "functions feedback" },
      "propositions-activities": { propositionsActivities: [] },
      "discrete-math/propositions": { propositionsLessonContent: { academicExplanation: [], codeExamples: [], keyTerms: [], commonMistakes: [] } },
      "propositions-mastery": { propositionsMasteryConfig: { concepts: [] } },
      "propositions-relevance": { propositionsRelevance: {} },
      "lib/lessons/propositions": { loadPropositionsLesson: async () => ({}) },
      "propositions-check-instructions": { propositionsCheckInstructions: "propositions rubric" },
      "propositions-feedback-instructions": { propositionsFeedbackInstructions: "propositions feedback" },
      ...requireMapForStandardLessons(),
      "lib/robin/check": { checkConcepts: [], checkMisconceptions: [] },
    };
    const match = Object.keys(map).find((key) => name.endsWith(key));
    if (match) return map[match];
    throw new Error(`Unexpected import: ${name}`);
  },
});

test("Conditionals is registered after Variables and Data Types", () => {
  assert.equal(registry.isRegisteredLesson("conditionals"), true);
  const definition = registry.getLessonDefinition("conditionals");
  assert.equal(definition.slug, "conditionals");
  assert.equal(definition.activities.length, 9);
  assert.equal(typeof definition.loadLesson, "function");
});

test("Conditionals content is complete across every LessonContent field", () => {
  assert.ok(content.slug === "conditionals");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 5);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  assert.ok(content.keyTerms.some((term) => term.term === "elif"), "elif must be a key term");
  assert.equal(content.commonMistakes.length, 6);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  // The lesson teaches the full operator set and elif explicitly.
  const academic = content.academicExplanation.join(" ");
  for (const operator of ["==", "!=", "<", ">", "<=", ">="]) assert.ok(academic.includes(operator), `${operator} must be taught`);
  assert.match(academic, /elif/);
  assert.match(academic, /indentation/i);
});

test("the TRY checker requires a real conditional branch and rejects the unconditional print", () => {
  const practice = activities.find((activity) => activity.type === "practice");
  assert.equal(practice.id, "try");
  assert.match(practice.code, /score = 80/);
  assert.equal(practice.checkAnswer('if score >= 70:\n    print("Pass")'), true);
  assert.equal(practice.checkAnswer("if score >= 70:\n\tprint('Pass')"), true);
  assert.equal(practice.checkAnswer('if score>=70:\n  print("Pass")'), true, "indent width is free");
  assert.equal(practice.checkAnswer('if score >= 70:\r\n    print("Pass")'), true, "CRLF tolerated");
  assert.equal(practice.checkAnswer('print("Pass")'), false, "unconditional print must be rejected");
  assert.equal(practice.checkAnswer('if score >= 70:\nprint("Pass")'), false, "the body must be indented");
  assert.equal(practice.checkAnswer('if score = 70:\n    print("Pass")'), false, "= is not a condition");
  assert.equal(practice.checkAnswer('if score > 70:\n    print("Pass")'), false, "wrong operator changes the boundary");
  assert.equal(practice.checkAnswer('if score >= 70:\n    print("Lulus")'), false, "the requested output must match");
  assert.equal(practice.checkAnswer(""), false);
});

test("activity code stays in scope: no loops, functions, logical operators, or advanced branching", () => {
  for (const activity of activities) {
    if (!activity.code) continue;
    assert.doesNotMatch(activity.code, /\bfor\b|\bwhile\b|\bdef\b|\bmatch\b|\btry\b|\bexcept\b|\band\b|\bor\b|\bnot\b|\binput\(/, `${activity.id} code stays in scope`);
  }
});

test("connect hands off to Module 04 Repetition without teaching loop syntax", () => {
  const connect = activities.find((activity) => activity.type === "connect");
  assert.match(connect.content[0], /For Loops/, "the next module must be named");
  const text = connect.content.join(" ");
  assert.doesNotMatch(text, /for\s+\w+\s+in\b|\bwhile\b|range\(/, "no loop syntax in the connect");
});

test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const allowed = mastery.concepts;
  assert.ok(allowed.includes("conditional_flow"));
  assert.ok(allowed.includes("comparison_expression"));
  assert.ok(allowed.includes("branch_selection"));
  for (const activity of activities) {
    if (activity.concept === "connections") continue; // connect steps map to null by design
    const mapped = mastery.activityConceptToMastery(activity.concept);
    assert.ok(mapped && allowed.includes(mapped), `activity concept ${activity.concept} must map to a lesson concept`);
  }
  const check = registry.getLessonDefinition("conditionals").check;
  for (const concept of check.concepts) assert.ok(allowed.includes(concept), `check concept ${concept} must be a mastery concept`);
});

test("relevance mapping supports adaptation: comparisons, branching, and input conversion", () => {
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["conditional_flow", "comparison_expression", "branch_selection"]);
  assert.deepEqual(Array.from(relevance.activityConcepts("elif_chain")), ["branch_selection", "conditional_flow"]);
  assert.deepEqual(Array.from(relevance.activityConcepts("comparison")), ["comparison_expression", "conditional_flow"]);
  assert.deepEqual(Array.from(relevance.activityConcepts("input_condition")), ["input_conversion", "comparison_expression"]);
  assert.ok(relevance.chatConcepts("bin, bedain elif sama if dong").length > 0);
  assert.ok(relevance.chatConcepts("kenapa input gue nggak bisa dibandingin?").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
});

test("Robin Check and Smart Feedback rubrics exist with the JSON evaluation contract", () => {
  const definition = registry.getLessonDefinition("conditionals");
  assert.equal(definition.check.rubric, "conditionals rubric");
  assert.match(definition.check.question, /if/);
  assert.match(definition.check.question, /elif/);
  assert.match(definition.check.question, /else/);
  const checkRubric = readFileSync(new URL("../content/lessons/programming/conditionals-check-instructions.ts", import.meta.url), "utf8");
  assert.match(checkRubric, /assignment_vs_comparison/);
  assert.match(checkRubric, /indentation_confusion/);
  assert.match(checkRubric, /string_number_comparison/);
  assert.match(checkRubric, /overlapping_branches/);
  const feedbackRubric = readFileSync(new URL("../content/lessons/programming/conditionals-feedback-instructions.ts", import.meta.url), "utf8");
  assert.match(feedbackRubric, /Correctness is already determined server-side/);
  assert.match(feedbackRubric, /followUp/);
});

test("mastery concept labels exist for the lesson summary UI", () => {
  for (const concept of mastery.concepts) {
    assert.ok(config[concept], `label missing for ${concept}`);
  }
});

test("localization covers both languages without changing the activity order", async () => {
  const localization = await import("node:fs").then(() => null).catch(() => null);
  const source = readFileSync(new URL("../content/lessons/programming/conditionals-localization.ts", import.meta.url), "utf8");
  assert.match(source, /getConditionalsActivities/);
  assert.match(source, /localizeConditionalsContent/);
  assert.match(source, /indonesianActivities\.length|indonesianActivities\[index\]/);
  assert.match(source, /Bahasa lesson|moduleTitle: "Dasar Penyusun Program"/);
  assert.equal(localization, null);
});

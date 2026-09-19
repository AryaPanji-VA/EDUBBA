import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";
import { requireMapForStandardLessons } from "./helpers/standard-lessons.mjs";

// Phase 12.2 — Loops lesson: registry, content availability, mastery and
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

const content = loadModule("../content/lessons/programming/loops.ts", ["loopsLessonContent"]).loopsLessonContent;
const activities = loadModule("../content/lessons/programming/loops-activities.ts", ["loopsActivities"]).loopsActivities;
const mastery = loadModule("../content/lessons/programming/loops-mastery.ts", ["loopsMasteryConfig"], {
  "@/lib/mastery/types": {},
}).loopsMasteryConfig;
const relevance = loadModule("../content/lessons/programming/loops-relevance.ts", ["loopsRelevance"]).loopsRelevance;
const config = loadModule("../content/lessons/programming/loops-lesson-config.ts", ["loopsMasteryConceptLabels", "loopsReinforcement"], {
  "@/lib/robin/check": {},
  "@/content/lessons/shared-copy": {},
}).loopsMasteryConceptLabels;

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
      "conditionals-activities": { conditionalsActivities: [] },
      "programming/conditionals": { conditionalsLessonContent: { academicExplanation: [], codeExamples: [], keyTerms: [], commonMistakes: [] } },
      "conditionals-mastery": { conditionalsMasteryConfig: { concepts: [] } },
      "conditionals-relevance": { conditionalsRelevance: {} },
      "lib/lessons/conditionals": { loadConditionalsLesson: async () => ({}) },
      "conditionals-check-instructions": { conditionalsCheckInstructions: "conditionals rubric" },
      "conditionals-feedback-instructions": { conditionalsFeedbackInstructions: "conditionals feedback" },
      "loops-activities": { loopsActivities: activities },
      "programming/loops": { loopsLessonContent: content },
      "loops-mastery": { loopsMasteryConfig: mastery },
      "loops-relevance": { loopsRelevance: relevance },
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
      "check-support": { adaptCheckFeedback: () => {} },
    };
    const match = Object.keys(map).find((key) => name.endsWith(key));
    if (match) return map[match];
    throw new Error(`Unexpected import: ${name}`);
  },
});

test("Loops is registered after Variables, Data Types, and Conditionals", () => {
  assert.equal(registry.isRegisteredLesson("loops"), true);
  const definition = registry.getLessonDefinition("loops");
  assert.equal(definition.slug, "loops");
  assert.equal(definition.activities.length, 9);
  assert.equal(typeof definition.loadLesson, "function");
});

test("For Loops content is complete across every LessonContent field", () => {
  assert.equal(content.slug, "loops");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  for (const term of ["Loop", "for", "Iteration", "Loop variable", "Loop body"]) {
    assert.ok(content.keyTerms.some((item) => item.term === term), `${term} must be a key term`);
  }
  assert.equal(content.commonMistakes.length, 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  // Ownership: the lesson teaches for over a sequence — loop variable,
  // iteration, indented body — and hands while/range to their own lessons.
  const academic = content.academicExplanation.join(" ");
  assert.match(academic, /loop variable/i);
  assert.match(academic, /iteration/i);
  assert.doesNotMatch(academic, /range\(/i);
  assert.ok(content.codeExamples.every((example) => /for\s/.test(example.code)), "every code example uses a for loop");
});
test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const allowed = mastery.concepts;
  for (const concept of ["loop_iteration", "range_boundaries", "while_condition", "counter_accumulator"]) {
    assert.ok(allowed.includes(concept), `${concept} must exist`);
  }
  for (const activity of activities) {
    if (activity.concept === "connections") continue; // connect steps map to null by design
    const mapped = mastery.activityConceptToMastery(activity.concept);
    assert.ok(mapped && allowed.includes(mapped), `activity concept ${activity.concept} must map to a lesson concept`);
  }
  const check = registry.getLessonDefinition("loops").check;
  for (const concept of check.concepts) assert.ok(allowed.includes(concept), `check concept ${concept} must be a mastery concept`);
});

test("relevance mapping supports adaptation: sequences, loop variables, and iteration", () => {
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["loop_iteration"]);
  assert.deepEqual(Array.from(relevance.activityConcepts("for_trace")), ["loop_iteration"]);
  assert.deepEqual(Array.from(relevance.activityConcepts("for_body_trace")), ["loop_iteration"]);
  assert.deepEqual(Array.from(relevance.activityConcepts("for_write")), ["loop_iteration"]);
  assert.ok(relevance.chatConcepts("for loop kok cuma jalan 2 kali ya").length > 0);
  assert.ok(relevance.chatConcepts("loop variable itu apa sih").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
  // While/range questions belong to their own Module 04 lessons now.
  assert.equal(relevance.chatConcepts("bin, kok while gue muter terus?").length, 0);
  assert.equal(relevance.chatConcepts("range(1,5) kok cuma sampai 4 ya").length, 0);
});
test("Robin Check and Smart Feedback rubrics exist with the JSON evaluation contract", () => {
  const definition = registry.getLessonDefinition("loops");
  assert.equal(definition.check.rubric, "loops rubric");
  assert.match(definition.check.question, /for name in \["Arya", "Bima", "Citra"\]/);
  assert.deepEqual(Array.from(definition.check.concepts), ["loop_iteration"]);
  const checkRubric = readFileSync(new URL("../content/lessons/programming/loops-check-instructions.ts", import.meta.url), "utf8");
  assert.match(checkRubric, /hardcoded_prints_confusion/);
  assert.match(checkRubric, /loop_variable_confusion/);
  assert.doesNotMatch(checkRubric, /range_exclusive_end|missing_counter_update/, "while/range misconceptions moved to their own lessons");
  const feedbackRubric = readFileSync(new URL("../content/lessons/programming/loops-feedback-instructions.ts", import.meta.url), "utf8");
  assert.match(feedbackRubric, /Correctness is already determined server-side/);
  assert.match(feedbackRubric, /hardcoded_prints_confusion/);
  // The practice set still spans the broader loops topic, so the legacy
  // misconception vocabulary stays available for Practice Mode feedback.
  assert.match(feedbackRubric, /accumulator_reset/);
  assert.match(feedbackRubric, /followUp/);
});
test("mastery concept labels exist for the lesson summary UI", () => {
  for (const concept of mastery.concepts) {
    assert.ok(config[concept], `label missing for ${concept}`);
  }
});

test("localization covers both languages without changing the activity order", () => {
  const source = readFileSync(new URL("../content/lessons/programming/loops-localization.ts", import.meta.url), "utf8");
  assert.match(source, /getLoopsActivities/);
  assert.match(source, /localizeLoopsContent/);
  assert.match(source, /indonesianActivities\.length|indonesianActivities\[index\]/);
  assert.match(source, /moduleTitle: "Dasar Penyusun Program"/);
});

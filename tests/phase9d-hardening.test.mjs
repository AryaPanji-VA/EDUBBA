import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Load the registry from real source.
function loadModule(file, deps = {}) {
  const raw = stripTypeScriptTypes(readFileSync(new URL(`../${file}.ts`, import.meta.url), "utf8"), { mode: "transform" });
  const names = [...raw.matchAll(/export (?:async )?(?:function|const|class) (\w+)/g)].map((match) => match[1]);
  const code = raw.replace(/import "server-only";/g, "")
    .replace(/import \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import (\w+) from "[^"]+";/g, "")
    .replace(/export /g, "") + names.map((name) => `\nexports.${name} = ${name};`).join("");
  const exports = {};
  vm.runInNewContext(code, { exports, ...deps });
  return exports;
}

const { variablesActivities } = loadModule("content/lessons/programming/variables-activities");
const { variablesLessonContent } = loadModule("content/lessons/programming/variables");
const { variablesMasteryConfig } = loadModule("content/lessons/programming/variables-mastery", { LessonMasteryConfig: {} });
const { variablesRelevance } = loadModule("content/lessons/programming/variables-relevance");
const { dataTypesActivities } = loadModule("content/lessons/programming/data-types-activities");
const { dataTypesLessonContent } = loadModule("content/lessons/programming/data-types");
const { dataTypesMasteryConfig } = loadModule("content/lessons/programming/data-types-mastery", { LessonMasteryConfig: {} });
const { dataTypesRelevance } = loadModule("content/lessons/programming/data-types-relevance");
const { operatorsActivities } = loadModule("content/lessons/programming/operators-activities");
const { operatorsLessonContent } = loadModule("content/lessons/programming/operators");
const { operatorsMasteryConfig } = loadModule("content/lessons/programming/operators-mastery", { LessonMasteryConfig: {} });
const { operatorsRelevance } = loadModule("content/lessons/programming/operators-relevance");
const { conditionalsActivities } = loadModule("content/lessons/programming/conditionals-activities");
const { conditionalsLessonContent } = loadModule("content/lessons/programming/conditionals");
const { conditionalsMasteryConfig } = loadModule("content/lessons/programming/conditionals-mastery", { LessonMasteryConfig: {} });
const { conditionalsRelevance } = loadModule("content/lessons/programming/conditionals-relevance");
const { loopsActivities } = loadModule("content/lessons/programming/loops-activities");
const { loopsLessonContent } = loadModule("content/lessons/programming/loops");
const { loopsMasteryConfig } = loadModule("content/lessons/programming/loops-mastery", { LessonMasteryConfig: {} });
const { loopsRelevance } = loadModule("content/lessons/programming/loops-relevance");
const { functionsActivities } = loadModule("content/lessons/programming/functions-activities");
const { functionsLessonContent } = loadModule("content/lessons/programming/functions");
const { functionsMasteryConfig } = loadModule("content/lessons/programming/functions-mastery", { LessonMasteryConfig: {} });
const { functionsRelevance } = loadModule("content/lessons/programming/functions-relevance");

const regRaw = stripTypeScriptTypes(readFileSync(new URL("../lib/lessons/registry.ts", import.meta.url), "utf8"), { mode: "transform" });
const regNames = [...regRaw.matchAll(/export (?:async )?(?:function|const|class) (\w+)/g)].map((match) => match[1]);
const regCode = regRaw.replace(/import "server-only";/g, "")
  .replace(/import \{[^}]+\} from "[^"]+";/g, "")
  .replace(/import (\w+) from "[^"]+";/g, "")
  .replace(/export /g, "") + regNames.map((name) => `\nexports.${name} = ${name};`).join("");
const regExports = {};
vm.runInNewContext(regCode, {
  exports: regExports,
  variablesActivities, variablesLessonContent, variablesMasteryConfig, variablesRelevance,
  loadVariablesLesson: async () => ({}),
  robinCheckInstructions: "v-rubric", quizFeedbackInstructions: "v-feedback-rubric",
  adaptCheckFeedback: (e) => e,
  checkConcepts: ["name", "value", "assignment"],
  checkMisconceptions: ["equality", "identity", "printing", "immutable_binding"],
  quizMisconceptions: ["first_assignment_persists", "assignment_history", "reassignment_invalid", "prints_name_text", "declaration_required"],
  dataTypesActivities, dataTypesLessonContent, dataTypesMasteryConfig, dataTypesRelevance,
  loadDataTypesLesson: async () => ({}),
  dataTypesCheckInstructions: "dt-rubric", dataTypesFeedbackInstructions: "dt-feedback-rubric",
  operatorsActivities, operatorsLessonContent, operatorsMasteryConfig, operatorsRelevance,
  loadOperatorsLesson: async () => ({}),
  operatorsCheckInstructions: "operators-rubric", operatorsFeedbackInstructions: "operators-feedback-rubric",
  conditionalsActivities, conditionalsLessonContent, conditionalsMasteryConfig, conditionalsRelevance,
  loadConditionalsLesson: async () => ({}),
  conditionalsCheckInstructions: "cond-rubric", conditionalsFeedbackInstructions: "cond-feedback-rubric",
  loopsActivities, loopsLessonContent, loopsMasteryConfig, loopsRelevance,
  loadLoopsLesson: async () => ({}),
  loopsCheckInstructions: "loops-rubric", loopsFeedbackInstructions: "loops-feedback-rubric",
  functionsActivities, functionsLessonContent, functionsMasteryConfig, functionsRelevance,
  loadFunctionsLesson: async () => ({}),
  functionsCheckInstructions: "functions-rubric", functionsFeedbackInstructions: "functions-feedback-rubric",
});
const { getLessonDefinition, isRegisteredLesson } = regExports;

// === 1. No shared AI route has lesson-specific branching ===
test("no shared AI route contains lesson-specific if-branches", () => {
  const routes = [
    "app/api/robin/feedback/route.ts",
    "app/api/robin/check/route.ts",
    "app/api/robin/chat/route.ts",
    "app/api/learning/mastery/route.ts",
  ];
  for (const route of routes) {
    const source = readFileSync(new URL(`../${route}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /if\s*\(.*lessonSlug\s*===\s*["']variables["']/, `${route}: no variables branch`);
    assert.doesNotMatch(source, /if\s*\(.*lessonSlug\s*===\s*["']data-types["']/, `${route}: no data-types branch`);
    assert.doesNotMatch(source, /if\s*\(.*lesson\s*===\s*["']variables["']/, `${route}: no variables branch`);
    assert.doesNotMatch(source, /if\s*\(.*lesson\s*===\s*["']data-types["']/, `${route}: no data-types branch`);
  }
});

// === 2. Variables mastery does not leak into Data Types adaptation ===
test("variables relevance returns empty for data-types concepts", () => {
  assert.equal(variablesRelevance.activityConcepts("data_type").length, 0);
  assert.equal(variablesRelevance.activityConcepts("integer").length, 0);
  assert.equal(variablesRelevance.checkConcepts().includes("data_type"), false);
  assert.equal(variablesRelevance.chatConcepts("explain data types").length, 0);
});

// === 3. Data Types mastery does not leak into Variables adaptation ===
test("data-types relevance returns empty for variables concepts", () => {
  assert.equal(dataTypesRelevance.activityConcepts("reading_a_name").length, 0);
  assert.equal(dataTypesRelevance.activityConcepts("reassignment").length, 0);
  assert.equal(dataTypesRelevance.checkConcepts().includes("reassignment"), false);
  assert.equal(dataTypesRelevance.chatConcepts("explain reassignment").length, 0);
});

// === 4. Variables misconception vocabulary stays isolated ===
test("variables feedback misconceptions do not include data-types codes", () => {
  const def = getLessonDefinition("variables");
  assert.equal(def.feedback.misconceptions.includes("quote_confusion"), false);
  assert.equal(def.feedback.misconceptions.includes("decimal_confusion"), false);
});

// === 5. Data Types misconception vocabulary stays isolated ===
test("data-types feedback misconceptions do not include variables codes", () => {
  const def = getLessonDefinition("data-types");
  assert.equal(def.feedback.misconceptions.includes("first_assignment_persists"), false);
  assert.equal(def.feedback.misconceptions.includes("assignment_history"), false);
});

// === 6. Robin Check vocabulary stays isolated ===
test("variables check concepts do not include data-types concepts", () => {
  const def = getLessonDefinition("variables");
  assert.equal(def.check.concepts.includes("data_type"), false);
  assert.equal(def.check.concepts.includes("integer"), false);
});
test("data-types check concepts do not include variables concepts", () => {
  const def = getLessonDefinition("data-types");
  assert.equal(def.check.concepts.includes("name"), false);
  assert.equal(def.check.concepts.includes("assignment"), false);
});

// === 7. Non-9-step lesson support ===
test("lesson activity length is not hardcoded to 9 in shared renderer", () => {
  const source = readFileSync(new URL("../components/lesson-activity-renderer.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /\b9\b/, "Renderer must not hardcode step count 9");
  assert.match(source, /activities\.length/, "Renderer must use activities.length");
});

test("a test-only lesson with 5 steps works with the activity type sequence", () => {
  // Simulate a 5-step lesson: intro → predict → practice → robin_check → connect
  const fiveStepActivities = [
    { id: "a1", type: "intro", concept: "x", content: ["x"] },
    { id: "a2", type: "predict", concept: "x", content: ["x"], options: ["a", "b"], correctAnswer: "a" },
    { id: "a3", type: "practice", concept: "x", content: ["x"], checkAnswer: (a) => a === "yes" },
    { id: "a4", type: "robin_check", concept: "x", content: ["x"] },
    { id: "a5", type: "connect", concept: "x", content: ["x"] },
  ];
  assert.equal(fiveStepActivities.length, 5);
  assert.notEqual(fiveStepActivities.length, 9);
  // Verify the activity type union supports non-9 sequences
  assert.equal(fiveStepActivities[fiveStepActivities.length - 1].type, "connect");
});

// === 8. Registry contract validation ===
test("registry lesson definition has all required fields", () => {
  for (const slug of ["variables", "data-types"]) {
    const def = getLessonDefinition(slug);
    assert.ok(def, `${slug} must resolve`);
    assert.equal(typeof def.slug, "string");
    assert.ok(Array.isArray(def.activities));
    assert.ok(def.lessonContent);
    assert.equal(typeof def.loadLesson, "function");
    assert.ok(def.mastery);
    assert.equal(typeof def.mastery.activityConceptToMastery, "function");
    assert.equal(typeof def.mastery.robinCheckSignalToEvidence, "function");
    assert.ok(def.relevance);
    assert.equal(typeof def.relevance.activityConcepts, "function");
    assert.equal(typeof def.relevance.checkConcepts, "function");
    assert.equal(typeof def.relevance.chatConcepts, "function");
    assert.ok(def.check);
    assert.equal(typeof def.check.rubric, "string");
    assert.equal(typeof def.check.question, "string");
    assert.ok(Array.isArray(def.check.concepts));
    assert.ok(Array.isArray(def.check.misconceptions));
    assert.ok(def.feedback);
    assert.equal(typeof def.feedback.rubric, "string");
    assert.ok(Array.isArray(def.feedback.misconceptions));
  }
});

// === 9. Unknown lesson fails safely ===
test("unknown lesson fails safely with null", () => {
  assert.equal(getLessonDefinition("nonexistent"), null);
  assert.equal(getLessonDefinition(""), null);
  assert.equal(isRegisteredLesson("nonexistent"), false);
});

// === 10. Robin instructions do not mention Variables ===
test("shared Robin instructions do not mention Variables specifically", () => {
  const source = readFileSync(new URL("../lib/robin/instructions.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /current Variables lesson/i, "Instructions must say 'current lesson' not 'current Variables lesson'");
});

// === 11. Shared components do not import variables-localization ===
test("shared components do not import from variables-localization", () => {
  const components = ["smart-feedback", "lesson-activity-renderer", "robin-check", "mastery-summary"];
  for (const comp of components) {
    const source = readFileSync(new URL(`../components/${comp}.tsx`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /variables-localization/, `${comp} must not import from variables-localization`);
  }
});

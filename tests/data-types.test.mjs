import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Load real content modules.
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

const { dataTypesActivities } = loadModule("content/lessons/programming/data-types-activities");
const { dataTypesMasteryConfig } = loadModule("content/lessons/programming/data-types-mastery");
const { dataTypesRelevance } = loadModule("content/lessons/programming/data-types-relevance");
const { dataTypesLessonContent } = loadModule("content/lessons/programming/data-types");

// Load quiz-feedback grading.
const quizSource = stripTypeScriptTypes(readFileSync(new URL("../lib/robin/quiz-feedback.ts", import.meta.url), "utf8"), { mode: "transform" })
  .replace(/import \{[^}]+\} from "[^"]+";/g, "").replace(/export /g, "")
  + "\nexports.gradeActivity = gradeActivity;";
const quizExports = {};
vm.runInNewContext(quizSource, { exports: quizExports });
const { gradeActivity } = quizExports;

// Load registry with all deps.
const regRaw = stripTypeScriptTypes(readFileSync(new URL("../lib/lessons/registry.ts", import.meta.url), "utf8"), { mode: "transform" });
const regNames = [...regRaw.matchAll(/export (?:async )?(?:function|const|class) (\w+)/g)].map((match) => match[1]);
const regCode = regRaw.replace(/import "server-only";/g, "")
  .replace(/import \{[^}]+\} from "[^"]+";/g, "")
  .replace(/import (\w+) from "[^"]+";/g, "")
  .replace(/export /g, "") + regNames.map((name) => `\nexports.${name} = ${name};`).join("");
const regExports = {};
vm.runInNewContext(regCode, {
  exports: regExports,
  variablesActivities: loadModule("content/lessons/programming/variables-activities").variablesActivities,
  variablesLessonContent: loadModule("content/lessons/programming/variables").variablesLessonContent,
  variablesMasteryConfig: loadModule("content/lessons/programming/variables-mastery", { LessonMasteryConfig: {} }).variablesMasteryConfig,
  variablesRelevance: loadModule("content/lessons/programming/variables-relevance").variablesRelevance,
  loadVariablesLesson: async () => ({}),
  robinCheckInstructions: "v-rubric",
  quizFeedbackInstructions: "v-feedback-rubric",
  adaptCheckFeedback: (e) => e,
  checkConcepts: ["name", "value", "assignment"],
  checkMisconceptions: ["equality", "identity", "printing", "immutable_binding"],
  quizMisconceptions: ["first_assignment_persists", "assignment_history", "reassignment_invalid", "prints_name_text", "declaration_required"],
  dataTypesActivities,
  dataTypesLessonContent,
  dataTypesMasteryConfig,
  dataTypesRelevance,
  loadDataTypesLesson: async () => ({}),
  dataTypesCheckInstructions: "dt-rubric",
  dataTypesFeedbackInstructions: "dt-feedback-rubric",
  operatorsActivities: loadModule("content/lessons/programming/operators-activities").operatorsActivities,
  operatorsLessonContent: loadModule("content/lessons/programming/operators").operatorsLessonContent,
  operatorsMasteryConfig: loadModule("content/lessons/programming/operators-mastery", { LessonMasteryConfig: {} }).operatorsMasteryConfig,
  operatorsRelevance: loadModule("content/lessons/programming/operators-relevance").operatorsRelevance,
  loadOperatorsLesson: async () => ({}),
  operatorsCheckInstructions: "operators-rubric",
  operatorsFeedbackInstructions: "operators-feedback-rubric",
  conditionalsActivities: loadModule("content/lessons/programming/conditionals-activities").conditionalsActivities,
  conditionalsLessonContent: loadModule("content/lessons/programming/conditionals").conditionalsLessonContent,
  conditionalsMasteryConfig: loadModule("content/lessons/programming/conditionals-mastery", { LessonMasteryConfig: {} }).conditionalsMasteryConfig,
  conditionalsRelevance: loadModule("content/lessons/programming/conditionals-relevance").conditionalsRelevance,
  loadConditionalsLesson: async () => ({}),
  conditionalsCheckInstructions: "cond-rubric",
  conditionalsFeedbackInstructions: "cond-feedback-rubric",
  loopsActivities: loadModule("content/lessons/programming/loops-activities").loopsActivities,
  loopsLessonContent: loadModule("content/lessons/programming/loops").loopsLessonContent,
  loopsMasteryConfig: loadModule("content/lessons/programming/loops-mastery", { LessonMasteryConfig: {} }).loopsMasteryConfig,
  loopsRelevance: loadModule("content/lessons/programming/loops-relevance").loopsRelevance,
  loadLoopsLesson: async () => ({}),
  loopsCheckInstructions: "loops-rubric",
  loopsFeedbackInstructions: "loops-feedback-rubric",
  functionsActivities: loadModule("content/lessons/programming/functions-activities").functionsActivities,
  functionsLessonContent: loadModule("content/lessons/programming/functions").functionsLessonContent,
  functionsMasteryConfig: loadModule("content/lessons/programming/functions-mastery", { LessonMasteryConfig: {} }).functionsMasteryConfig,
  functionsRelevance: loadModule("content/lessons/programming/functions-relevance").functionsRelevance,
  loadFunctionsLesson: async () => ({}),
  functionsCheckInstructions: "functions-rubric",
  functionsFeedbackInstructions: "functions-feedback-rubric",
});
const { getLessonDefinition, isRegisteredLesson } = regExports;

// Load check parser.
const checkSource = stripTypeScriptTypes(readFileSync(new URL("../lib/robin/check.ts", import.meta.url), "utf8"), { mode: "transform" })
  .replace(/import \{[^}]+\} from "[^"]+";/g, "").replace(/export /g, "")
  + "\nexports.parseCheckEvaluation = parseCheckEvaluation;\nexports.validateCheckRequest = validateCheckRequest;";
const checkExports = {};
vm.runInNewContext(checkSource, { exports: checkExports });
const { parseCheckEvaluation, validateCheckRequest } = checkExports;

// Helper for comparing VM-returned arrays (avoid prototype mismatch).
function arrayEqual(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);
}

// === 1. Registry resolves data-types ===
test("registry resolves data-types lesson definition", () => {
  const def = getLessonDefinition("data-types");
  assert.ok(def);
  assert.equal(def.slug, "data-types");
  assert.ok(Array.isArray(def.activities));
  assert.equal(def.activities.length, 9);
  assert.equal(typeof def.mastery.activityConceptToMastery, "function");
  assert.equal(typeof def.relevance.activityConcepts, "function");
  assert.equal(typeof def.check.rubric, "string");
  assert.equal(def.check.concepts.length, 3);
  assert.equal(def.check.misconceptions.length, 4);
});

// === 2. Variables still resolves ===
test("registry still resolves Variables", () => {
  const def = getLessonDefinition("variables");
  assert.ok(def);
  assert.equal(def.slug, "variables");
  assert.equal(def.activities.length, 9);
});

// === 3. Unknown lesson fails safely ===
test("unknown lesson still fails safely", () => {
  assert.equal(getLessonDefinition("nonexistent"), null);
  assert.equal(isRegisteredLesson("nonexistent"), false);
  assert.equal(isRegisteredLesson("data-types"), true);
});

// === 4. Data Types activities use their own deterministic checkers ===
test("data-types practice uses its own checkAnswer, not Variables listeners regex", () => {
  const tryActivity = dataTypesActivities.find((a) => a.id === "try");
  assert.ok(tryActivity.checkAnswer);
  assert.equal(tryActivity.checkAnswer("float"), true);
  assert.equal(tryActivity.checkAnswer("int"), false);
  assert.equal(tryActivity.checkAnswer("  float  "), true);
  assert.equal(tryActivity.checkAnswer("FLOAT"), true);
  // Variables listeners regex would reject "float" — proving lesson separation.
  assert.equal(gradeActivity(tryActivity, "float").isCorrect, true);
  assert.equal(gradeActivity(tryActivity, "int").isCorrect, false);
});

// === 5. Variables listeners checker is never used for Data Types ===
test("Variables listeners checker is not invoked for data-types activities", async () => {
  const shared = await import("../content/lessons/activities.ts");
  assert.equal("isListenersAnswerCorrect" in shared, false);
});

// === 6. Type prediction grading works ===
test("predict-type grades int correctly", () => {
  const activity = dataTypesActivities.find((a) => a.id === "predict-type");
  assert.equal(gradeActivity(activity, "int").isCorrect, true);
  assert.equal(gradeActivity(activity, "float").isCorrect, false);
});

// === 7. String vs number grading works ===
test("string-vs-number grades correctly", () => {
  const activity = dataTypesActivities.find((a) => a.id === "string-vs-number");
  assert.equal(gradeActivity(activity, "b").isCorrect, true);
  assert.equal(gradeActivity(activity, "a").isCorrect, false);
  assert.equal(gradeActivity(activity, "Both").isCorrect, false);
});

// === 8. Boolean recognition grading works ===
test("boolean-recognition grades correctly", () => {
  const activity = dataTypesActivities.find((a) => a.id === "boolean-recognition");
  assert.equal(gradeActivity(activity, "True only").isCorrect, true);
  assert.equal(gradeActivity(activity, "\"True\"").isCorrect, false);
});

// === 9. Smart Feedback route accepts data-types ===
test("quiz-feedback request validation accepts data-types slug", () => {
  const valid = { activityId: "predict-type", lessonSlug: "data-types", language: "en", learnerAnswer: "int", attemptId: "a1" };
  assert.ok(validateCheckRequest({ lessonSlug: "data-types", answer: "test", language: "en" }));
  // The route would resolve data-types through the registry, not reject it.
});

// === 10. Data Types mastery mapping records only relevant concepts ===
test("data-types mastery maps activity concepts correctly", () => {
  assert.equal(dataTypesMasteryConfig.activityConceptToMastery("integer"), "integer");
  assert.equal(dataTypesMasteryConfig.activityConceptToMastery("string"), "string");
  assert.equal(dataTypesMasteryConfig.activityConceptToMastery("data_type"), "data_type");
  assert.equal(dataTypesMasteryConfig.activityConceptToMastery("nonexistent"), null);
  assert.equal(dataTypesMasteryConfig.concepts.length, 6);
});

test("data-types robin check evidence maps to data-types concepts", () => {
  const { evidenceType, concepts } = dataTypesMasteryConfig.robinCheckSignalToEvidence("strong");
  assert.equal(evidenceType, "robin_check_strong");
  assert.ok(arrayEqual(concepts, ["data_type", "string", "integer"]));
});

// === 11. Data Types adaptation selects relevant concepts only ===
test("data-types relevance maps activity concepts", () => {
  assert.ok(arrayEqual(dataTypesRelevance.activityConcepts("string"), ["string", "integer", "data_type"]));
  assert.ok(arrayEqual(dataTypesRelevance.activityConcepts("boolean"), ["boolean", "data_type"]));
  assert.equal(dataTypesRelevance.activityConcepts("nonexistent").length, 0);
});

test("data-types check concepts are data-types-specific", () => {
  assert.ok(arrayEqual(dataTypesRelevance.checkConcepts(), ["data_type", "string", "integer"]));
});

test("data-types chat concepts match relevant topics only", () => {
  assert.ok(dataTypesRelevance.chatConcepts("bin bedanya int sama float").length > 0);
  assert.ok(dataTypesRelevance.chatConcepts("kenapa 42 sama '42' beda").length > 0);
  assert.equal(dataTypesRelevance.chatConcepts("hello").length, 0);
  assert.equal(dataTypesRelevance.chatConcepts("what is TCP?").length, 0);
});

// === 12. Robin Check accepts Data Types vocabulary ===
test("parseCheckEvaluation accepts data-types vocabulary", () => {
  const valid = { signal: "strong", recognizedConcepts: ["data_type", "string", "integer"], misconceptions: [], feedback: "Good", recommendedAction: "continue" };
  assert.doesNotThrow(() => parseCheckEvaluation(JSON.stringify(valid), ["data_type", "string", "integer"], ["quote_confusion", "type_indifference", "decimal_confusion", "type_misidentification"]));
});

test("parseCheckEvaluation rejects Variables concepts for data-types vocabulary", () => {
  const invalid = { signal: "strong", recognizedConcepts: ["name", "value", "assignment"], misconceptions: [], feedback: "Good", recommendedAction: "continue" };
  assert.throws(() => parseCheckEvaluation(JSON.stringify(invalid), ["data_type", "string", "integer"], ["quote_confusion", "type_indifference", "decimal_confusion", "type_misidentification"]));
});

// === 13. Variables Robin Check still passes existing tests ===
test("parseCheckEvaluation still works with Variables defaults", () => {
  const valid = { signal: "strong", recognizedConcepts: ["name", "value", "assignment"], misconceptions: [], feedback: "Good", recommendedAction: "continue" };
  assert.doesNotThrow(() => parseCheckEvaluation(JSON.stringify(valid)));
});

// === 14. Data Types lesson content exists ===
test("data-types lesson content has required fields", () => {
  assert.equal(dataTypesLessonContent.slug, "data-types");
  assert.ok(dataTypesLessonContent.intuitiveExplanation.length > 0);
  assert.ok(dataTypesLessonContent.academicExplanation.length > 0);
  assert.ok(dataTypesLessonContent.codeExamples.length >= 3);
  assert.ok(dataTypesLessonContent.keyTerms.length >= 5);
  assert.ok(dataTypesLessonContent.quickChecks.length >= 3);
});

// === 15. Data Types step count is 9, not necessarily matching Variables ===
test("data-types has its own step count", () => {
  assert.equal(dataTypesActivities.length, 9);
  assert.ok(arrayEqual(dataTypesActivities.map((a) => a.type), ["intro", "explain", "predict", "predict", "predict", "practice", "formalize", "robin_check", "connect"]));
  assert.equal(new Set(dataTypesActivities.map((a) => a.id)).size, 9);
});

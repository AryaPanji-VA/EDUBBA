import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Load real content modules that the registry imports.
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

const { propositionsActivities } = loadModule("content/lessons/discrete-math/propositions-activities");
const { propositionsLessonContent } = loadModule("content/lessons/discrete-math/propositions");
const { propositionsMasteryConfig } = loadModule("content/lessons/discrete-math/propositions-mastery", { LessonMasteryConfig: {} });
const { propositionsRelevance } = loadModule("content/lessons/discrete-math/propositions-relevance");

// Load the registry with all its dependencies provided.
const registryRaw = stripTypeScriptTypes(readFileSync(new URL("../lib/lessons/registry.ts", import.meta.url), "utf8"), { mode: "transform" });
const registryNames = [...registryRaw.matchAll(/export (?:async )?(?:function|const|class) (\w+)/g)].map((match) => match[1]);
const registryCode = registryRaw
  .replace(/import "server-only";/g, "")
  .replace(/import \{[^}]+\} from "[^"]+";/g, "")
  .replace(/import (\w+) from "[^"]+";/g, "")
  .replace(/export /g, "")
  + registryNames.map((name) => `\nexports.${name} = ${name};`).join("");
const registryExports = {};
vm.runInNewContext(registryCode, {
  exports: registryExports,
  variablesActivities,
  variablesLessonContent,
  variablesMasteryConfig,
  variablesRelevance,
  loadVariablesLesson: async () => ({}),
  robinCheckInstructions: "rubric",
  quizFeedbackInstructions: "feedback rubric",
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
  operatorsActivities,
  operatorsLessonContent,
  operatorsMasteryConfig,
  operatorsRelevance,
  loadOperatorsLesson: async () => ({}),
  operatorsCheckInstructions: "operators-rubric",
  operatorsFeedbackInstructions: "operators-feedback-rubric",
  conditionalsActivities,
  conditionalsLessonContent,
  conditionalsMasteryConfig,
  conditionalsRelevance,
  loadConditionalsLesson: async () => ({}),
  conditionalsCheckInstructions: "cond-rubric",
  conditionalsFeedbackInstructions: "cond-feedback-rubric",
  loopsActivities,
  loopsLessonContent,
  loopsMasteryConfig,
  loopsRelevance,
  loadLoopsLesson: async () => ({}),
  loopsCheckInstructions: "loops-rubric",
  loopsFeedbackInstructions: "loops-feedback-rubric",
  functionsActivities,
  functionsLessonContent,
  functionsMasteryConfig,
  functionsRelevance,
  loadFunctionsLesson: async () => ({}),
  functionsCheckInstructions: "functions-rubric",
  functionsFeedbackInstructions: "functions-feedback-rubric",
  propositionsActivities,
  propositionsLessonContent,
  propositionsMasteryConfig,
  propositionsRelevance,
  loadPropositionsLesson: async () => ({}),
  propositionsCheckInstructions: "propositions-rubric",
  propositionsFeedbackInstructions: "propositions-feedback-rubric",
  require(name) {
    throw new Error(`Unexpected require after inlining: ${name}`);
  },
});
const { getLessonDefinition, isRegisteredLesson } = registryExports;

// Load the quiz-feedback grading module.
const quizSource = stripTypeScriptTypes(readFileSync(new URL("../lib/robin/quiz-feedback.ts", import.meta.url), "utf8"), { mode: "transform" })
  .replace(/import \{[^}]+\} from "[^"]+";/g, "")
  .replace(/export /g, "")
  + "\nexports.gradeActivity = gradeActivity;";
const quizExports = {};
vm.runInNewContext(quizSource, { exports: quizExports });
const { gradeActivity } = quizExports;

// === 1. Variables resolves through the registry ===
test("registry resolves the Variables lesson definition", () => {
  const def = getLessonDefinition("variables");
  assert.ok(def);
  assert.equal(def.slug, "variables");
  assert.ok(Array.isArray(def.activities));
  assert.equal(def.activities.length, 9);
  assert.equal(typeof def.mastery.activityConceptToMastery, "function");
  assert.equal(typeof def.mastery.robinCheckSignalToEvidence, "function");
  assert.equal(typeof def.relevance.activityConcepts, "function");
  assert.equal(typeof def.relevance.checkConcepts, "function");
  assert.equal(typeof def.relevance.chatConcepts, "function");
  assert.equal(typeof def.check.rubric, "string");
  assert.equal(typeof def.feedback.rubric, "string");
  assert.equal(typeof def.loadLesson, "function");
});

// === 2. Unknown lesson slug fails safely ===
test("registry rejects unknown lesson slugs", () => {
  assert.equal(getLessonDefinition("not-registered"), null);
  assert.equal(getLessonDefinition(""), null);
  assert.equal(getLessonDefinition("nonexistent"), null);
  assert.equal(isRegisteredLesson("nonexistent"), false);
  assert.equal(isRegisteredLesson("variables"), true);
  assert.equal(isRegisteredLesson("data-types"), true);
  assert.equal(isRegisteredLesson("propositions"), true);
});

// === 2b. Trusted course ownership comes from the registry ===
test("each lesson resolves to its trusted course slug from the registry", () => {
  for (const slug of ["variables", "data-types", "operators", "conditionals", "loops", "functions"]) {
    const def = getLessonDefinition(slug);
    assert.ok(def, `${slug} must resolve`);
    assert.equal(def.courseSlug, "programming", `${slug} must belong to programming`);
  }
  const propositions = getLessonDefinition("propositions");
  assert.ok(propositions);
  assert.equal(propositions.courseSlug, "discrete-math");
  assert.equal(propositions.slug, "propositions");
  assert.equal(propositions.activities, propositionsActivities);
});

// === 3. Request types accept non-Variables lesson slugs ===
test("CheckRequest type accepts any string lesson slug", () => {
  const checkSource = stripTypeScriptTypes(readFileSync(new URL("../lib/robin/check.ts", import.meta.url), "utf8"), { mode: "transform" })
    .replace(/import \{[^}]+\} from "[^"]+";/g, "").replace(/export /g, "")
    + "\nexports.validateCheckRequest = validateCheckRequest;";
  const checkExports = {};
  vm.runInNewContext(checkSource, { exports: checkExports });
  const { validateCheckRequest } = checkExports;
  assert.ok(validateCheckRequest({ lessonSlug: "data-types", answer: "test answer", language: "en" }));
  assert.ok(validateCheckRequest({ lessonSlug: "any-lesson", answer: "test answer", language: "id" }));
  assert.equal(validateCheckRequest({ lessonSlug: "", answer: "test", language: "en" }), null);
});

test("QuizFeedbackRequest type accepts any string lesson slug", () => {
  const quizReqSource = stripTypeScriptTypes(readFileSync(new URL("../lib/robin/quiz-feedback.ts", import.meta.url), "utf8"), { mode: "transform" })
    .replace(/import \{[^}]+\} from "[^"]+";/g, "").replace(/export /g, "")
    + "\nexports.validateQuizFeedbackRequest = validateQuizFeedbackRequest;";
  const quizReqExports = {};
  vm.runInNewContext(quizReqSource, { exports: quizReqExports });
  const { validateQuizFeedbackRequest } = quizReqExports;
  assert.ok(validateQuizFeedbackRequest({ activityId: "x", lessonSlug: "data-types", language: "en", learnerAnswer: "42", attemptId: "a1" }));
  assert.ok(validateQuizFeedbackRequest({ activityId: "x", lessonSlug: "any-lesson", language: "id", learnerAnswer: "42", attemptId: "a1" }));
});

// === 4. Variables practice checker is NOT used for another lesson ===
test("a second lesson's practice answer is not evaluated using the Variables listeners regex", () => {
  const lesson2Activity = {
    id: "dt-practice", type: "practice", concept: "integers",
    learningPurpose: "Detect type identification.",
    checkAnswer: (answer) => /\bint\b/i.test(answer.trim()),
  };
  assert.equal(gradeActivity(lesson2Activity, "x = 5").isCorrect, false);
  assert.equal(gradeActivity(lesson2Activity, "int x = 5").isCorrect, true);
});

// === 5. Variables deterministic activity grading still behaves exactly as before ===
test("Variables predict grading is unchanged", () => {
  const predictActivity = {
    id: "reassignment", type: "predict", concept: "reassignment",
    options: ["92", "110", "92 and 110", "Error"], correctAnswer: "110",
  };
  assert.equal(gradeActivity(predictActivity, "110").isCorrect, true);
  assert.equal(gradeActivity(predictActivity, "92").isCorrect, false);
});

test("Variables practice grading uses the activity-owned checkAnswer", () => {
  const tryActivity = getLessonDefinition("variables").activities.find((a) => a.id === "try");
  assert.ok(tryActivity.checkAnswer);
  assert.equal(gradeActivity(tryActivity, "listeners = 150").isCorrect, true);
  assert.equal(gradeActivity(tryActivity, "listeners = listeners + 30").isCorrect, true);
  assert.equal(gradeActivity(tryActivity, "listeners = 120").isCorrect, false);
  assert.equal(gradeActivity(tryActivity, "listeners == 150").isCorrect, false);
});

// === 6. isListenersAnswerCorrect is no longer in shared code ===
test("isListenersAnswerCorrect is not exported from shared activities module", async () => {
  const shared = await import("../content/lessons/activities.ts");
  assert.equal("isListenersAnswerCorrect" in shared, false);
});

// === 7. A test-only second lesson can be represented by the reusable contract ===
test("a test-only second lesson can be represented using the registry contract", () => {
  const fakeLesson = {
    slug: "test-lesson",
    activities: [{ id: "q1", type: "predict", concept: "topic", options: ["a", "b"], correctAnswer: "a" }],
    lessonContent: { slug: "test-lesson", intuitiveExplanation: [], academicExplanation: [], codeExamples: [], keyTerms: [], commonMistakes: [], quickChecks: [] },
    loadLesson: async () => ({ slug: "test-lesson", title: "Test", summary: null, estimatedMinutes: 5, module: { slug: "m", title: "M", position: 1 }, content: {}, sources: [] }),
    mastery: {
      concepts: ["topic"],
      activityConceptToMastery: (c) => c === "topic" ? "topic" : null,
      robinCheckSignalToEvidence: (s) => ({ evidenceType: `robin_check_${s}`, concepts: ["topic"] }),
    },
    relevance: {
      activityConcepts: (c) => c === "topic" ? ["topic"] : [],
      checkConcepts: () => ["topic"],
      chatConcepts: (m) => /topic/i.test(m) ? ["topic"] : [],
    },
    check: {
      rubric: "test rubric", question: "What is a topic?", contextLabel: "Test context",
      lessonContext: { academicExplanation: [], codeExamples: [], keyTerms: [], commonMistakes: [] },
    },
    feedback: { rubric: "test feedback rubric" },
  };
  assert.equal(fakeLesson.slug, "test-lesson");
  assert.equal(typeof fakeLesson.mastery.activityConceptToMastery, "function");
  assert.equal(typeof fakeLesson.relevance.chatConcepts, "function");
  assert.equal(fakeLesson.mastery.activityConceptToMastery("topic"), "topic");
  assert.equal(fakeLesson.mastery.activityConceptToMastery("unknown"), null);
  assert.deepEqual(fakeLesson.relevance.checkConcepts(), ["topic"]);
  assert.deepEqual(fakeLesson.relevance.chatConcepts("hello"), []);
  assert.deepEqual(fakeLesson.relevance.chatConcepts("explain topic"), ["topic"]);
});

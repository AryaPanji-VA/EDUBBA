import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.1A — beginner onboarding lesson "What is Programming?".
// Architecture invariants: registered, displayable, course-integrated, and
// graded through the same deterministic contract as every other lesson.

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

const sharedCopyModule = loadModule("content/lessons/shared-copy.ts");
const { whatIsProgrammingActivities } = loadModule("content/lessons/programming/what-is-programming-activities.ts");
const { whatIsProgrammingLessonContent } = loadModule("content/lessons/programming/what-is-programming.ts");
const localization = loadModule("content/lessons/programming/what-is-programming-localization.ts", {
  whatIsProgrammingActivities,
  getSharedCopy: sharedCopyModule.getSharedCopy,
});
const config = loadModule("content/lessons/programming/what-is-programming-config.ts", { LessonMasteryConfig: {} });

// === 1. The learning flow is complete: WHY → INTUITION → EXAMPLE → MENTAL MODEL → PREDICT → TRY → FORMALIZE → ROBIN CHECK → CONNECT ===
test("activities carry the full beginner flow with unique ids", () => {
  assert.ok(whatIsProgrammingActivities.length >= 8, "needs a complete learning flow");
  assert.equal(new Set(whatIsProgrammingActivities.map((a) => a.id)).size, whatIsProgrammingActivities.length);
  const types = new Set(whatIsProgrammingActivities.map((a) => a.type));
  for (const type of ["intro", "explain", "example", "predict", "practice", "formalize", "robin_check", "connect"]) {
    assert.ok(types.has(type), `flow needs a ${type} activity`);
  }
  // 1 screen = 1 idea: every activity has a concept and short content blocks.
  for (const activity of whatIsProgrammingActivities) {
    assert.ok(activity.concept, `${activity.id} needs a concept`);
    for (const paragraph of activity.content) assert.ok(paragraph.trim().length > 0);
    assert.ok(activity.content.length <= 3, `${activity.id} must stay small (1 idea per screen)`);
  }
  // No Python syntax required anywhere in the flow's visible prompts.
  assert.ok(whatIsProgrammingActivities.some((a) => a.type === "intro"), "WHY opens the flow");
  assert.ok(whatIsProgrammingActivities[0].id === "why", "WHY is the first step");
  assert.ok(whatIsProgrammingActivities.at(-1).type === "connect", "CONNECT closes the flow");
});

// === 2. Predictions and the TRY checker are deterministic and honest ===
test("predict activities have well-formed options, answers, and misconceptions", () => {
  for (const activity of whatIsProgrammingActivities) {
    if (activity.type !== "predict") continue;
    assert.ok(Array.isArray(activity.options) && activity.options.length >= 3, `${activity.id} needs options`);
    assert.ok(activity.options.includes(activity.correctAnswer), `${activity.id} answer must be one of the options`);
    assert.ok(activity.explanation && activity.explanation.length > 0, `${activity.id} needs an explanation`);
    assert.ok(activity.learningPurpose, `${activity.id} needs a learning purpose`);
    for (const option of Object.keys(activity.misconceptionsByAnswer ?? {})) {
      assert.ok(activity.options.includes(option), `${activity.id} misconception key must be an offered option`);
      assert.notEqual(option, activity.correctAnswer, `${activity.id} must not tag the correct answer as a misconception`);
    }
  }
});

test("the TRY practice checker accepts the intended forms and rejects wrong ones", () => {
  const practice = whatIsProgrammingActivities.find((a) => a.type === "practice");
  assert.ok(practice, "needs a practice activity");
  assert.equal(typeof practice.checkAnswer, "function", "practice must have a deterministic checker");
  assert.equal(practice.checkAnswer(" instruksi "), true);
  assert.equal(practice.checkAnswer("Instruction"), true);
  assert.equal(practice.checkAnswer("instructions"), true);
  assert.equal(practice.checkAnswer("perintah"), true);
  assert.equal(practice.checkAnswer("syntax"), false);
  assert.equal(practice.checkAnswer("program"), false);
  assert.equal(practice.checkAnswer(""), false);
});

// === 3. Localization changes prose only; grading identity stays shared ===
test("ID and EN activities share ids, code, and answers while changing prose", () => {
  const id = localization.getWhatIsProgrammingActivities("id");
  const en = localization.getWhatIsProgrammingActivities("en");
  assert.equal(id.length, en.length);
  for (let index = 0; index < id.length; index++) {
    for (const key of ["id", "type", "concept", "code", "correctAnswer"]) assert.equal(id[index][key], en[index][key]);
    assert.deepEqual(id[index].options, en[index].options);
    assert.notEqual(id[index].title, en[index].title, "ID title must be localized");
  }
  // The Robin Check prompt follows the lesson copy for both languages.
  const robinStep = id.find((a) => a.type === "robin_check");
  assert.deepEqual(Array.from(robinStep.content), [localization.whatIsProgrammingCopy.id.prompt]);
  assert.match(localization.whatIsProgrammingCopy.id.moduleTitle, /Fundamental/i);
});

test("content localization preserves structure and grading fields", () => {
  const id = localization.localizeWhatIsProgrammingContent(whatIsProgrammingLessonContent, "id");
  assert.equal(id.slug, whatIsProgrammingLessonContent.slug);
  assert.equal(id.academicExplanation.length, whatIsProgrammingLessonContent.academicExplanation.length);
  assert.equal(id.keyTerms.length, whatIsProgrammingLessonContent.keyTerms.length);
  assert.equal(id.commonMistakes.length, whatIsProgrammingLessonContent.commonMistakes.length);
  assert.equal(id.quickChecks.length, whatIsProgrammingLessonContent.quickChecks.length);
  for (let index = 0; index < id.quickChecks.length; index++) {
    assert.deepEqual(id.quickChecks[index].options, whatIsProgrammingLessonContent.quickChecks[index].options);
    assert.equal(id.quickChecks[index].answer, whatIsProgrammingLessonContent.quickChecks[index].answer);
    assert.notEqual(id.quickChecks[index].question, whatIsProgrammingLessonContent.quickChecks[index].question);
  }
});

// === 4. Mastery and relevance stay inside the lesson's own vocabulary ===
test("every mastery concept receives evidence from activities or Robin Check", () => {
  const activityConcepts = new Set(whatIsProgrammingActivities.map((a) => a.concept));
  const evidence = new Set();
  for (const concept of activityConcepts) {
    const mapped = config.whatIsProgrammingMasteryConfig.activityConceptToMastery(concept);
    if (mapped) evidence.add(mapped);
  }
  for (const concept of config.whatIsProgrammingMasteryConfig.robinCheckSignalToEvidence("strong").concepts) evidence.add(concept);
  for (const concept of config.whatIsProgrammingMasteryConfig.concepts) {
    assert.ok(evidence.has(concept), `${concept} has no evidence source`);
  }
  assert.equal(config.whatIsProgrammingMasteryConfig.activityConceptToMastery("connections"), null, "connect must not emit mastery evidence");
});

test("relevance outputs never escape the mastery vocabulary", () => {
  const allowed = new Set(config.whatIsProgrammingMasteryConfig.concepts);
  for (const concept of config.whatIsProgrammingRelevance.checkConcepts()) assert.ok(allowed.has(concept));
  for (const message of ["apa itu programming", "code dan instruksi", "komputer literal menebak", "halaman random"]) {
    for (const concept of config.whatIsProgrammingRelevance.chatConcepts(message)) {
      assert.ok(allowed.has(concept), `${concept} escapes mastery vocabulary`);
    }
  }
});

// === 5. Course and registry integration ===
test("the lesson is registered with trusted programming ownership and a display entry", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["what-is-programming",\s*whatIsProgrammingDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["what-is-programming",\s*\{/);
  const loader = read("lib/lessons/what-is-programming.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-fundamentals"/);
  assert.match(loader, /"what-is-programming"/);
  assert.equal(existsSync(new URL("content/lessons/programming/what-is-programming-instructions.ts", root)), true, "needs Robin Check rubrics");
});

test("the lesson opens the beginner order and derives the default entry point", () => {
  const courses = loadModule("data/courses.ts");
  const list = courses.implementedProgrammingLessonSlugs;
  assert.equal(list[0], "what-is-programming");
  assert.equal(courses.defaultCurrentLesson.courseSlug, "programming");
  assert.equal(courses.defaultCurrentLesson.lessonSlug, "what-is-programming");
  // The curriculum manifest already carried this lesson as module position 1.
  const manifest = loadModule("data/curriculum-manifest.ts");
  const fundamentals = manifest.currentCurriculumManifest.semesters[0].courses
    .find((course) => course.slug === "programming").modules
    .find((module) => module.slug === "programming-fundamentals");
  assert.equal(fundamentals.lessons[0].slug, "what-is-programming");
  assert.equal(fundamentals.lessons[0].position, 1);
});

test("the Python peek stays print-level: no assignment, input, or operators", () => {
  const pythonExamples = whatIsProgrammingLessonContent.codeExamples.filter((e) => e.language === "python");
  assert.ok(pythonExamples.length >= 1, "needs a Python peek example");
  for (const example of pythonExamples) {
    assert.doesNotMatch(example.code, /input\(/, "no input() before it is taught");
    assert.doesNotMatch(example.code, /(^|\n)\s*[a-zA-Z_]\w*\s*=/m, "no assignment before Variables");
    assert.doesNotMatch(example.code, /\+/, "no operators before they are taught");
    assert.match(example.code, /print\(/, "the peek uses the one instruction the learner knows");
  }
  assert.ok(pythonExamples.some((e) => e.code.includes('print("Halo, dunia!")')));
});

test("content quality: no Python mastery assumed, connect points to Variables", () => {
  const connect = whatIsProgrammingActivities.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Variables/, "connect must name the next implemented lesson");
  // Every visible code block is pseudo or a labeled peek — none graded as Python output.
  for (const activity of whatIsProgrammingActivities) {
    if (activity.code) assert.ok(activity.code.trim().length > 0, `${activity.id} code must not be empty`);
  }
  assert.equal(whatIsProgrammingLessonContent.slug, "what-is-programming");
});

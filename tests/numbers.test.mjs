import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.2C — Module 02 lesson "Numbers". Fresh standard lesson: arithmetic
// (+, -, *, /) is introduced here on purpose; casting, input, and control
// flow stay out.

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
const { numbersActivities } = loadModule("content/lessons/programming/numbers-activities.ts");
const { numbersLessonContent } = loadModule("content/lessons/programming/numbers.ts");
const localization = loadModule("content/lessons/programming/numbers-localization.ts", {
  numbersActivities,
  getSharedCopy: sharedCopyModule.getSharedCopy,
});
const config = loadModule("content/lessons/programming/numbers-config.ts", { LessonMasteryConfig: {} });

// === 1. Learning flow: WHY → INTUITION → SEE → CONTRAST → MENTAL MODEL → PREDICT → TRY → FORMALIZE → ROBIN CHECK → CONNECT ===
test("activities carry the full beginner flow with one idea per screen", () => {
  assert.ok(numbersActivities.length >= 8, "needs a complete learning flow");
  assert.equal(new Set(numbersActivities.map((a) => a.id)).size, numbersActivities.length);
  const types = new Set(numbersActivities.map((a) => a.type));
  for (const type of ["intro", "explain", "example", "predict", "practice", "formalize", "robin_check", "connect"]) {
    assert.ok(types.has(type), `flow needs a ${type} activity`);
  }
  assert.equal(numbersActivities[0].id, "why", "WHY opens the flow");
  assert.equal(numbersActivities.at(-1).type, "connect", "CONNECT closes the flow");
  for (const activity of numbersActivities) {
    assert.ok(activity.concept, `${activity.id} needs a concept`);
    assert.ok(activity.content.length <= 3, `${activity.id} must stay small (1 idea per screen)`);
  }
});

// === 2. Learning targets: int/float shapes, 5 vs 5.0, negatives, variables, calculation ===
test("positive, zero, and negative ints plus floats are all represented", () => {
  const intuition = numbersActivities.find((a) => a.id === "intuition");
  for (const marker of ["10", "0", "-4", "3.14", "-2.5"]) {
    assert.ok(intuition.code.includes(marker), `${marker} must appear in the overview`);
  }
  const firstExample = numbersLessonContent.codeExamples[0];
  for (const marker of ["10", "0", "-4", "3.14", "0.5", "-2.5"]) {
    assert.ok(firstExample.code.includes(marker), `${marker} must appear in the supplement overview`);
  }
});

test("the 5 vs 5.0 contrast names the type difference", () => {
  const contrast = numbersActivities.find((a) => a.id === "contrast");
  assert.match(contrast.code, /type\(5\)/);
  assert.match(contrast.code, /type\(5\.0\)/);
  assert.match(contrast.content.join(" "), /int.*float|float.*int/i, "the type pair must be named");
});

test("variables hold numbers and arithmetic produces a new number", () => {
  const see = numbersActivities.find((a) => a.id === "see-variables");
  assert.match(see.code, /score = 100/);
  assert.match(see.code, /temperature = 36\.5/);
  const model = numbersActivities.find((a) => a.id === "mental-model");
  assert.match(model.code, /total = 10 \+ 5/);
  assert.match(model.code, /output:\n15/);
  for (const op of ["+", "-", "*", "/"]) {
    assert.ok(model.content.join(" ").includes(op), `the four basic operations must be mentioned (${op})`);
  }
});

// === 3. Scope: arithmetic yes, advanced operators / casting / control flow no ===
test("the lesson introduces only the four basic operations", () => {
  const forbiddenCode = /%|\/\/|\*\*|==|\bint\(|\bfloat\(|\bstr\(|\binput\(|\bif\b|\belse\b|\bfor\b|\bwhile\b|\bdef\b|\breturn\b|f"|f'/;
  const forbiddenProse = /\bcasting\b|\bkonversi\b|\bconversion\b|\bint\(|\binput\(|\bmodulo\b|\bfloor division\b|\bexponent\b|\bcomparison\b|\bprecedence\b|\bcondition\b|\bloop\b|\bfunction\b|\bboolean logic\b/i;
  for (const activity of numbersActivities) {
    if (activity.code) assert.doesNotMatch(activity.code, forbiddenCode, `${activity.id} code must stay in scope`);
    if (activity.type === "connect") continue; // connect names the roadmap titles
    for (const paragraph of activity.content) {
      assert.doesNotMatch(paragraph, forbiddenProse, `${activity.id} must not teach later-lesson concepts`);
    }
  }
  for (const example of numbersLessonContent.codeExamples) {
    assert.doesNotMatch(example.code, forbiddenCode, "supplement examples stay in scope");
  }
});

// === 4. Deterministic grading ===
test("predict activities have well-formed options, answers, and misconceptions", () => {
  const predicts = numbersActivities.filter((a) => a.type === "predict");
  assert.ok(predicts.length >= 2, "needs a calculation predict and an int/float identify");
  for (const activity of predicts) {
    assert.ok(activity.options.length >= 3, `${activity.id} needs options`);
    assert.ok(activity.options.includes(activity.correctAnswer), `${activity.id} answer must be one of the options`);
    assert.ok(activity.explanation && activity.explanation.length > 0, `${activity.id} needs an explanation`);
    assert.ok(activity.learningPurpose, `${activity.id} needs a learning purpose`);
    for (const option of Object.keys(activity.misconceptionsByAnswer ?? {})) {
      assert.ok(activity.options.includes(option), `${activity.id} misconception key must be an offered option`);
      assert.notEqual(option, activity.correctAnswer, `${activity.id} must not tag the correct answer as a misconception`);
    }
  }
  // The calculation predict traces reassignment with arithmetic to 15.
  const calc = numbersActivities.find((a) => a.id === "predict-calc");
  assert.match(calc.code, /score = 10\nscore = score \+ 5\nprint\(score\)/);
  assert.match(calc.correctAnswer, /^15/);
  // The identify predict pins 5.0 as float.
  const identify = numbersActivities.find((a) => a.id === "predict-identify");
  assert.match(identify.correctAnswer, /^float/);
});

test("the TRY checker accepts the calculation call and rejects the bare result", () => {
  const practice = numbersActivities.find((a) => a.type === "practice");
  assert.equal(practice.id, "try");
  assert.equal(practice.checkAnswer("print(10 + 5)"), true);
  assert.equal(practice.checkAnswer("print(10+5)"), true);
  assert.equal(practice.checkAnswer("  print( 10 + 5 )  "), true);
  assert.equal(practice.checkAnswer("print(15)"), false, "the learner must let Python calculate");
  assert.equal(practice.checkAnswer("10 + 5"), false, "missing print");
  assert.equal(practice.checkAnswer(""), false);
});

// === 5. Mastery (3 concepts) and relevance vocabulary ===
test("every mastery concept receives evidence and connect stays out", () => {
  assert.ok(config.numbersMasteryConfig.concepts.length >= 2 && config.numbersMasteryConfig.concepts.length <= 3, "mastery stays at 2-3 concepts");
  const evidence = new Set();
  for (const activity of numbersActivities) {
    const mapped = config.numbersMasteryConfig.activityConceptToMastery(activity.concept);
    if (mapped) evidence.add(mapped);
  }
  for (const concept of config.numbersMasteryConfig.robinCheckSignalToEvidence("strong").concepts) evidence.add(concept);
  for (const concept of config.numbersMasteryConfig.concepts) {
    assert.ok(evidence.has(concept), `${concept} has no evidence source`);
  }
  assert.equal(config.numbersMasteryConfig.activityConceptToMastery("connections"), null, "connect must not emit mastery evidence");
});

test("relevance outputs never escape the mastery vocabulary", () => {
  const allowed = new Set(config.numbersMasteryConfig.concepts);
  for (const concept of config.numbersRelevance.checkConcepts()) assert.ok(allowed.has(concept));
  for (const message of ["angka 5 dan 5.0", "cara hitung 10 + 5", "cuaca hari ini"]) {
    for (const concept of config.numbersRelevance.chatConcepts(message)) {
      assert.ok(allowed.has(concept), `${concept} escapes mastery vocabulary`);
    }
  }
});

// === 6. Localization shares grading identity, changes prose only ===
test("ID and EN activities share ids, code, and answers while changing prose", () => {
  const id = localization.getNumbersActivities("id");
  const en = localization.getNumbersActivities("en");
  assert.equal(id.length, en.length);
  for (let index = 0; index < id.length; index++) {
    for (const key of ["id", "type", "concept", "code", "correctAnswer"]) assert.equal(id[index][key], en[index][key]);
    assert.deepEqual(id[index].options, en[index].options);
    assert.notEqual(id[index].title, en[index].title, "ID title must be localized");
  }
  const robinStep = id.find((a) => a.type === "robin_check");
  assert.deepEqual(Array.from(robinStep.content), [localization.numbersCopy.id.prompt]);
});

test("content localization preserves structure and grading fields", () => {
  const id = localization.localizeNumbersContent(numbersLessonContent, "id");
  assert.equal(id.slug, numbersLessonContent.slug);
  assert.equal(id.academicExplanation.length, numbersLessonContent.academicExplanation.length);
  assert.equal(id.keyTerms.length, numbersLessonContent.keyTerms.length);
  assert.equal(id.commonMistakes.length, numbersLessonContent.commonMistakes.length);
  assert.equal(id.quickChecks.length, numbersLessonContent.quickChecks.length);
  for (let index = 0; index < id.quickChecks.length; index++) {
    assert.deepEqual(id.quickChecks[index].options, numbersLessonContent.quickChecks[index].options);
    assert.equal(id.quickChecks[index].answer, numbersLessonContent.quickChecks[index].answer);
    assert.notEqual(id.quickChecks[index].question, numbersLessonContent.quickChecks[index].question);
  }
});

// === 7. Course and registry integration, Module 02 order, progress safety ===
test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["numbers", numbersDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["numbers", \{ getActivities: getNumbersActivities/);
  const loader = read("lib/lessons/numbers.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-building-blocks"/);
  assert.match(loader, /"numbers"/);
  assert.equal(existsSync(new URL("content/lessons/programming/numbers-instructions.ts", root)), true, "needs Robin Check rubrics");
});

test("the lesson is building-blocks position 3 and shifts legacy lessons safely", () => {
  const courses = loadModule("data/courses.ts");
  const list = courses.implementedProgrammingLessonSlugs;
  assert.equal(list[7], "data-types", "Data Types stays right before Numbers");
  assert.equal(list[8], "numbers", "Numbers stays in the Module 02 order");
  assert.equal(list[9], "casting", "Casting follows Numbers");
  assert.equal(list[10], "strings", "Strings follows Casting");
  assert.equal(list[11], "booleans", "Booleans follows Strings");
  assert.equal(list[12], "operators", "Operators survives after the insertions");
  assert.equal(courses.defaultCurrentLesson.lessonSlug, "what-is-programming", "default entry point unchanged");
  // The manifest and baseline seed include the later User Input insertion.
  const manifest = loadModule("data/curriculum-manifest.ts");
  const blocks = manifest.currentCurriculumManifest.semesters[0].courses
    .find((course) => course.slug === "programming").modules
    .find((module) => module.slug === "programming-building-blocks");
  const byslug = Object.fromEntries(blocks.lessons.map((lesson) => [lesson.slug, lesson.position]));
  assert.equal(byslug["variables"], 1);
  assert.equal(byslug["data-types"], 2);
  assert.equal(byslug["numbers"], 3);
  assert.equal(byslug["casting"], 4);
  assert.equal(byslug["strings"], 5);
  assert.equal(byslug["booleans"], 6);
  assert.equal(byslug["operators"], 7);
  assert.equal(byslug["functions"], 11);
  const seed = read("database/phase4-seed.sql");
  assert.match(seed, /\('programming-building-blocks', 'numbers', 'Numbers', '[^']+', 12, 3\)/);
  const migration = read("database/phase20-2c-numbers.sql");
  assert.match(migration, /'numbers'/);
  assert.match(migration, /on conflict \(module_id, slug\) do update/);
  assert.doesNotMatch(migration, /delete from/i, "migration must never delete data");
});

test("connect points to Casting, the next Module 02 lesson", () => {
  const connect = numbersActivities.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Casting/, "connect must name the next lesson");
});

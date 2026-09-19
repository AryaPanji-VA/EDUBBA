import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.3B — Module 03 lesson "User Input". Fresh standard lesson:
// input() receives a string, two-step casting, then the compact form.
// No conditionals, loops, try/except, or advanced IO.

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
const { userInputActivities } = loadModule("content/lessons/programming/user-input-activities.ts");
const { userInputLessonContent } = loadModule("content/lessons/programming/user-input.ts");
const localization = loadModule("content/lessons/programming/user-input-localization.ts", {
  userInputActivities,
  getSharedCopy: sharedCopyModule.getSharedCopy,
});
const config = loadModule("content/lessons/programming/user-input-config.ts", { LessonMasteryConfig: {} });

// === 1. Learning flow: WHY → INTUITION → SEE → MENTAL MODEL → PREDICT → TRY → FORMALIZE → ROBIN CHECK → CONNECT ===
test("activities carry the full beginner flow with one idea per screen", () => {
  assert.ok(userInputActivities.length >= 8, "needs a complete learning flow");
  assert.equal(new Set(userInputActivities.map((a) => a.id)).size, userInputActivities.length);
  const types = new Set(userInputActivities.map((a) => a.type));
  for (const type of ["intro", "explain", "example", "predict", "practice", "formalize", "robin_check", "connect"]) {
    assert.ok(types.has(type), `flow needs a ${type} activity`);
  }
  assert.equal(userInputActivities[0].id, "why", "WHY opens the flow");
  assert.equal(userInputActivities.at(-1).type, "connect", "CONNECT closes the flow");
  for (const activity of userInputActivities) {
    assert.ok(activity.concept, `${activity.id} needs a concept`);
    assert.ok(activity.content.length <= 3, `${activity.id} must stay small (1 idea per screen)`);
  }
});

// === 2. Scope: no conditionals, loops, try/except, or advanced IO ===
test("the lesson stays inside the user-input scope", () => {
  const forbiddenCode = /\bif\b|\belif\b|\belse\b|\bwhile\b|\bfor\b|\bdef\b|\breturn\b|\btry\b|\bexcept\b|sys\.stdin|\bopen\(|\bbool\(|f"|f'/;
  const forbiddenProse = /\binput\(\s*\)\s+if\b|\bif statement\b|\belif\b|\bcondition\b|\bloop\b|\btry\/except\b|\bValueError\b|\bvalidation\b|\bcommand-line\b|\bsys\.stdin\b|\bGUI\b/i;
  for (const activity of userInputActivities) {
    if (activity.code) assert.doesNotMatch(activity.code, forbiddenCode, `${activity.id} code must stay in scope`);
    if (activity.type === "connect") continue; // connect names the roadmap titles
    for (const paragraph of activity.content) {
      assert.doesNotMatch(paragraph, forbiddenProse, `${activity.id} must not teach later-lesson concepts`);
    }
  }
  for (const example of userInputLessonContent.codeExamples) {
    assert.doesNotMatch(example.code, forbiddenCode, "supplement examples stay in scope");
  }
  // No conditional preview in disguise.
  assert.doesNotMatch(read("content/lessons/programming/user-input-activities.ts"), /if age|if\s+\w+\s*[><=]/, "no conditional preview");
});

// === 3. Learning targets: input+prompt, always str, in vs out, two-step then compact ===
test("basic input with a prompt appears, and the prompt is explained as guidance", () => {
  const see = userInputActivities.find((a) => a.id === "see-input");
  assert.match(see.code, /input\("Name: "\)/);
  assert.match(see.content.join(" "), /prompt/i);
  assert.match(see.content.join(" "), /input\(\) pulls data in|input\(\) menarik data masuk/i);
});

test("the always-a-string result is the core checkpoint", () => {
  const predict = userInputActivities.find((a) => a.id === "predict-type");
  assert.match(predict.code, /input\("Age: "\)/);
  assert.match(predict.correctAnswer, /^str/);
  // The spot checkpoint pins typed digits as text too.
  const spot = userInputActivities.find((a) => a.id === "predict-spot");
  assert.match(spot.correctAnswer, /^Neither/);
});

test("two-step conversion comes before the compact form", () => {
  const twoStep = userInputActivities.find((a) => a.id === "input-casting");
  assert.match(twoStep.code, /age_text = input\("Age: "\)/);
  assert.match(twoStep.code, /age = int\(age_text\)/);
  assert.match(twoStep.content.join(" "), /int\(input\("Age: "\)\)/);
  const compact = userInputActivities.find((a) => a.id === "predict-compact");
  assert.match(compact.code, /int\(input\("Age: "\)\)/);
  assert.match(compact.correctAnswer, /^14/);
});

// === 4. Deterministic grading ===
test("predict activities have well-formed options, answers, and misconceptions", () => {
  const predicts = userInputActivities.filter((a) => a.type === "predict");
  assert.ok(predicts.length >= 3, "needs type, compact, and spot predicts");
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
});

test("the TRY checker requires input() and rejects the hardcoded substitute", () => {
  const practice = userInputActivities.find((a) => a.type === "practice");
  assert.equal(practice.id, "try");
  assert.equal(practice.checkAnswer('name = input("Name: ")\nprint(name)'), true);
  assert.equal(practice.checkAnswer("name = input('Name: ')\nprint(name)"), true);
  assert.equal(practice.checkAnswer('name = input("Your name: ")\nprint(name)'), true, "any prompt works");
  assert.equal(practice.checkAnswer('name = "Arya"\nprint(name)'), false, "hardcoded substitute must be rejected");
  assert.equal(practice.checkAnswer('print(input("Name: "))'), false, "the variable must be stored");
  assert.equal(practice.checkAnswer('name = input("Name: ")'), false, "the print must be part of the answer");
  assert.equal(practice.checkAnswer(""), false);
});

// === 5. Mastery (3 concepts) and relevance vocabulary ===
test("every mastery concept receives evidence and connect stays out", () => {
  assert.ok(config.userInputMasteryConfig.concepts.length >= 2 && config.userInputMasteryConfig.concepts.length <= 3, "mastery stays at 2-3 concepts");
  const evidence = new Set();
  for (const activity of userInputActivities) {
    const mapped = config.userInputMasteryConfig.activityConceptToMastery(activity.concept);
    if (mapped) evidence.add(mapped);
  }
  for (const concept of config.userInputMasteryConfig.robinCheckSignalToEvidence("strong").concepts) evidence.add(concept);
  for (const concept of config.userInputMasteryConfig.concepts) {
    assert.ok(evidence.has(concept), `${concept} has no evidence source`);
  }
  assert.equal(config.userInputMasteryConfig.activityConceptToMastery("connections"), null, "connect must not emit mastery evidence");
});

test("relevance outputs never escape the mastery vocabulary", () => {
  const allowed = new Set(config.userInputMasteryConfig.concepts);
  for (const concept of config.userInputRelevance.checkConcepts()) assert.ok(allowed.has(concept));
  for (const message of ["input itu apa", "hasilnya string atau int", "cara convert input", "cuaca hari ini"]) {
    for (const concept of config.userInputRelevance.chatConcepts(message)) {
      assert.ok(allowed.has(concept), `${concept} escapes mastery vocabulary`);
    }
  }
});

// === 6. Localization shares grading identity, changes prose only ===
test("ID and EN activities share ids, code, and answers while changing prose", () => {
  const id = localization.getUserInputActivities("id");
  const en = localization.getUserInputActivities("en");
  assert.equal(id.length, en.length);
  for (let index = 0; index < id.length; index++) {
    for (const key of ["id", "type", "concept", "code", "correctAnswer"]) assert.equal(id[index][key], en[index][key]);
    assert.deepEqual(id[index].options, en[index].options);
    assert.notEqual(id[index].title, en[index].title, "ID title must be localized");
  }
  const robinStep = id.find((a) => a.type === "robin_check");
  assert.deepEqual(Array.from(robinStep.content), [localization.userInputCopy.id.prompt]);
});

test("content localization preserves structure and grading fields", () => {
  const id = localization.localizeUserInputContent(userInputLessonContent, "id");
  assert.equal(id.slug, userInputLessonContent.slug);
  assert.equal(id.academicExplanation.length, userInputLessonContent.academicExplanation.length);
  assert.equal(id.keyTerms.length, userInputLessonContent.keyTerms.length);
  assert.equal(id.commonMistakes.length, userInputLessonContent.commonMistakes.length);
  assert.equal(id.quickChecks.length, userInputLessonContent.quickChecks.length);
  for (let index = 0; index < id.quickChecks.length; index++) {
    assert.deepEqual(id.quickChecks[index].options, userInputLessonContent.quickChecks[index].options);
    assert.equal(id.quickChecks[index].answer, userInputLessonContent.quickChecks[index].answer);
    assert.notEqual(id.quickChecks[index].question, userInputLessonContent.quickChecks[index].question);
  }
});

// === 7. Course and registry integration, Module 03 order, progress safety ===
test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["user-input", userInputDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["user-input", \{ getActivities: getUserInputActivities/);
  const loader = read("lib/lessons/user-input.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-building-blocks"/);
  assert.match(loader, /"user-input"/);
  assert.equal(existsSync(new URL("content/lessons/programming/user-input-instructions.ts", root)), true, "needs Robin Check rubrics");
});

test("the lesson is building-blocks position 8 between Operators and Conditionals", () => {
  const courses = loadModule("data/courses.ts");
  const list = courses.implementedProgrammingLessonSlugs;
  assert.equal(list[12], "operators", "Operators comes right before User Input");
  assert.equal(list[13], "user-input", "User Input is the new Module 03 lesson");
  assert.equal(list[14], "conditionals", "Conditionals follows on the roadmap");
  assert.equal(courses.defaultCurrentLesson.lessonSlug, "what-is-programming", "default entry point unchanged");
  const manifest = loadModule("data/curriculum-manifest.ts");
  const blocks = manifest.currentCurriculumManifest.semesters[0].courses
    .find((course) => course.slug === "programming").modules
    .find((module) => module.slug === "programming-building-blocks");
  const byslug = Object.fromEntries(blocks.lessons.map((lesson) => [lesson.slug, lesson.position]));
  assert.equal(byslug["operators"], 7);
  assert.equal(byslug["user-input"], 8);
  assert.equal(byslug["conditionals"], 9);
  assert.equal(byslug["functions"], 11);
  const seed = read("database/phase4-seed.sql");
  assert.match(seed, /\('programming-building-blocks', 'user-input', 'User Input', '[^']+', 12, 8\)/);
  const migration = read("database/phase20-3b-user-input.sql");
  assert.match(migration, /'user-input'/);
  assert.match(migration, /on conflict \(module_id, slug\) do update/);
  assert.doesNotMatch(migration, /delete from/i, "migration must never delete data");
});

test("connect points to Conditionals without teaching it", () => {
  const connect = userInputActivities.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Conditionals/, "connect must name the next lesson");
  assert.doesNotMatch(connect.content.join(" "), /\bif\s+\w+|\belif\b|\belse\b/, "no conditional syntax in the connect");
});

test("User Input stays directly accessible without Operators completion", () => {
  const access = read("lib/courses/lesson-access.ts");
  const course = read("components/programming-course-client.tsx");
  assert.match(access, /for \(const slug of input\.implementedSlugs\) states\[slug\] = "available"/);
  assert.match(course, /state !== "coming-soon" && implementedProgrammingLessonSlugs\.some/);
  assert.doesNotMatch(course, /operators.*completed.*user-input|user-input.*locked/is);
});

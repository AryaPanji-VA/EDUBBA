import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.2D — Module 02 lesson "Casting". Fresh standard lesson: deliberate
// conversion with int()/float()/str(). No input(), no bool(), no string
// methods, no control flow.

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
const { castingActivities } = loadModule("content/lessons/programming/casting-activities.ts");
const { castingLessonContent } = loadModule("content/lessons/programming/casting.ts");
const localization = loadModule("content/lessons/programming/casting-localization.ts", {
  castingActivities,
  getSharedCopy: sharedCopyModule.getSharedCopy,
});
const config = loadModule("content/lessons/programming/casting-config.ts", { LessonMasteryConfig: {} });

// === 1. Learning flow: WHY → INTUITION → SEE → MENTAL MODEL → CONTRAST → PREDICT → TRY → FORMALIZE → ROBIN CHECK → CONNECT ===
test("activities carry the full beginner flow with one idea per screen", () => {
  assert.ok(castingActivities.length >= 8, "needs a complete learning flow");
  assert.equal(new Set(castingActivities.map((a) => a.id)).size, castingActivities.length);
  const types = new Set(castingActivities.map((a) => a.type));
  for (const type of ["intro", "explain", "example", "predict", "practice", "formalize", "robin_check", "connect"]) {
    assert.ok(types.has(type), `flow needs a ${type} activity`);
  }
  assert.equal(castingActivities[0].id, "why", "WHY opens the flow");
  assert.equal(castingActivities.at(-1).type, "connect", "CONNECT closes the flow");
  for (const activity of castingActivities) {
    assert.ok(activity.concept, `${activity.id} needs a concept`);
    assert.ok(activity.content.length <= 3, `${activity.id} must stay small (1 idea per screen)`);
  }
});

// === 2. Scope: the three functions only — no input, bool, methods, control flow ===
test("the lesson stays inside the casting scope", () => {
  const forbiddenCode = /\binput\(|\bbool\(|\.upper\(|\.lower\(|\.strip\(|\btry\b|\bexcept\b|,\s*base\b|\bround\(|\bif\b|\belse\b|\bfor\b|\bwhile\b|\bdef\b|\breturn\b/;
  const forbiddenProse = /\binput\(|\bbool\(|truthiness|\bstring method|\bexception\b|\btry\/except\b|\bdebugger\b|\btraceback\b|\bbase\b|\bround(ing)?\b|\bcondition\b|\bloop\b|\bcollection\b/i;
  for (const activity of castingActivities) {
    if (activity.code) assert.doesNotMatch(activity.code, forbiddenCode, `${activity.id} code must stay in scope`);
    if (activity.type === "connect") continue; // connect names the roadmap titles
    for (const paragraph of activity.content) {
      assert.doesNotMatch(paragraph, forbiddenProse, `${activity.id} must not teach later-lesson concepts`);
    }
  }
  for (const example of castingLessonContent.codeExamples) {
    assert.doesNotMatch(example.code, forbiddenCode, "supplement examples stay in scope");
  }
});

// === 3. Learning targets: visual conversion, contrast, predict the type ===
test("the three conversion functions and the visual conversion appear", () => {
  const intuition = castingActivities.find((a) => a.id === "intuition");
  assert.match(intuition.code, /"20"\s+→ int\(\)\s+→ 20/);
  assert.match(intuition.code, /float\(\)/);
  assert.match(intuition.code, /str\(\)/);
  const see = castingActivities.find((a) => a.id === "see-conversion");
  assert.match(see.code, /age_text = "20"/);
  assert.match(see.code, /age = int\(age_text\)/);
  assert.match(see.content.join(" "), /float\("12\.5"\)/);
  assert.match(see.content.join(" "), /str\(100\)/);
});

test("the contrast separates the string from the converted int", () => {
  const contrast = castingActivities.find((a) => a.id === "contrast");
  assert.match(contrast.code, /a = "20"/);
  assert.match(contrast.code, /b = int\("20"\)/);
  assert.match(contrast.correctAnswer, /^b/);
});

test("the type-after-conversion predict stays focused on int", () => {
  const predict = castingActivities.find((a) => a.id === "predict-type");
  assert.match(predict.code, /int\(value\)/);
  assert.match(predict.code, /type\(number\)/);
  assert.match(predict.correctAnswer, /^int/);
});

// === 4. Deterministic grading ===
test("predict activities have well-formed options, answers, and misconceptions", () => {
  const predicts = castingActivities.filter((a) => a.type === "predict");
  assert.ok(predicts.length >= 3, "needs contrast, type-result, and choose-conversion predicts");
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
  // Choose-conversion: text that reads as a whole number converts with int().
  const choose = castingActivities.find((a) => a.id === "choose-conversion");
  assert.equal(choose.correctAnswer, "int(count_text)");
});

test("the TRY checker requires the conversion, not the literal", () => {
  const practice = castingActivities.find((a) => a.type === "practice");
  assert.equal(practice.id, "try");
  assert.equal(practice.checkAnswer('age = int("30")'), true);
  assert.equal(practice.checkAnswer("age = int('30')"), true);
  assert.equal(practice.checkAnswer('int("30")'), true);
  assert.equal(practice.checkAnswer('  age = int( "30" )  '), true);
  assert.equal(practice.checkAnswer('age = "30"'), false, "storing the text is not conversion");
  assert.equal(practice.checkAnswer("age = 30"), false, "the literal alone skips the conversion");
  assert.equal(practice.checkAnswer('float("30")'), false, "wrong target function");
  assert.equal(practice.checkAnswer(""), false);
});

// === 5. Mastery (3 concepts) and relevance vocabulary ===
test("every mastery concept receives evidence and connect stays out", () => {
  assert.ok(config.castingMasteryConfig.concepts.length >= 2 && config.castingMasteryConfig.concepts.length <= 3, "mastery stays at 2-3 concepts");
  const evidence = new Set();
  for (const activity of castingActivities) {
    const mapped = config.castingMasteryConfig.activityConceptToMastery(activity.concept);
    if (mapped) evidence.add(mapped);
  }
  for (const concept of config.castingMasteryConfig.robinCheckSignalToEvidence("strong").concepts) evidence.add(concept);
  for (const concept of config.castingMasteryConfig.concepts) {
    assert.ok(evidence.has(concept), `${concept} has no evidence source`);
  }
  assert.equal(config.castingMasteryConfig.activityConceptToMastery("connections"), null, "connect must not emit mastery evidence");
});

test("relevance outputs never escape the mastery vocabulary", () => {
  const allowed = new Set(config.castingMasteryConfig.concepts);
  for (const concept of config.castingRelevance.checkConcepts()) assert.ok(allowed.has(concept));
  for (const message of ["cara convert teks ke angka", "pilih int atau float", "hasilnya jadi type apa", "cuaca hari ini"]) {
    for (const concept of config.castingRelevance.chatConcepts(message)) {
      assert.ok(allowed.has(concept), `${concept} escapes mastery vocabulary`);
    }
  }
});

// === 6. Localization shares grading identity, changes prose only ===
test("ID and EN activities share ids, code, and answers while changing prose", () => {
  const id = localization.getCastingActivities("id");
  const en = localization.getCastingActivities("en");
  assert.equal(id.length, en.length);
  for (let index = 0; index < id.length; index++) {
    for (const key of ["id", "type", "concept", "code", "correctAnswer"]) assert.equal(id[index][key], en[index][key]);
    assert.deepEqual(id[index].options, en[index].options);
    assert.notEqual(id[index].title, en[index].title, "ID title must be localized");
  }
  const robinStep = id.find((a) => a.type === "robin_check");
  assert.deepEqual(Array.from(robinStep.content), [localization.castingCopy.id.prompt]);
});

test("content localization preserves structure and grading fields", () => {
  const id = localization.localizeCastingContent(castingLessonContent, "id");
  assert.equal(id.slug, castingLessonContent.slug);
  assert.equal(id.academicExplanation.length, castingLessonContent.academicExplanation.length);
  assert.equal(id.keyTerms.length, castingLessonContent.keyTerms.length);
  assert.equal(id.commonMistakes.length, castingLessonContent.commonMistakes.length);
  assert.equal(id.quickChecks.length, castingLessonContent.quickChecks.length);
  for (let index = 0; index < id.quickChecks.length; index++) {
    assert.deepEqual(id.quickChecks[index].options, castingLessonContent.quickChecks[index].options);
    assert.equal(id.quickChecks[index].answer, castingLessonContent.quickChecks[index].answer);
    assert.notEqual(id.quickChecks[index].question, castingLessonContent.quickChecks[index].question);
  }
});

// === 7. Course and registry integration, Module 02 order, progress safety ===
test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["casting", castingDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["casting", \{ getActivities: getCastingActivities/);
  const loader = read("lib/lessons/casting.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-building-blocks"/);
  assert.match(loader, /"casting"/);
  assert.equal(existsSync(new URL("content/lessons/programming/casting-instructions.ts", root)), true, "needs Robin Check rubrics");
});

test("the lesson is building-blocks position 4 and shifts legacy lessons safely", () => {
  const courses = loadModule("data/courses.ts");
  const list = courses.implementedProgrammingLessonSlugs;
  assert.equal(list[8], "numbers", "Numbers stays right before Casting");
  assert.equal(list[9], "casting", "Casting stays in the Module 02 order");
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
  assert.equal(byslug["numbers"], 3);
  assert.equal(byslug["casting"], 4);
  assert.equal(byslug["strings"], 5);
  assert.equal(byslug["booleans"], 6);
  assert.equal(byslug["operators"], 7);
  assert.equal(byslug["functions"], 11);
  const seed = read("database/phase4-seed.sql");
  assert.match(seed, /\('programming-building-blocks', 'casting', 'Casting', '[^']+', 12, 4\)/);
  const migration = read("database/phase20-2d-casting.sql");
  assert.match(migration, /'casting'/);
  assert.match(migration, /on conflict \(module_id, slug\) do update/);
  assert.doesNotMatch(migration, /delete from/i, "migration must never delete data");
});

test("connect points to Strings, the next Module 02 lesson", () => {
  const connect = castingActivities.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Strings/, "connect must name the next lesson");
});

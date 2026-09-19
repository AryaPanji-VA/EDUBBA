import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.2E — Module 02 lesson "Strings". Fresh standard lesson: strings as
// character sequences with 0-based indexing, len(), and concatenation.
// No input(), string methods, slicing, negative indexing, or f-strings.

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
const { stringsActivities } = loadModule("content/lessons/programming/strings-activities.ts");
const { stringsLessonContent } = loadModule("content/lessons/programming/strings.ts");
const localization = loadModule("content/lessons/programming/strings-localization.ts", {
  stringsActivities,
  getSharedCopy: sharedCopyModule.getSharedCopy,
});
const config = loadModule("content/lessons/programming/strings-config.ts", { LessonMasteryConfig: {} });

// === 1. Learning flow: WHY → INTUITION → SEE → MENTAL MODEL → CONTRAST → PREDICT → TRY → FORMALIZE → ROBIN CHECK → CONNECT ===
test("activities carry the full beginner flow with one idea per screen", () => {
  assert.ok(stringsActivities.length >= 8, "needs a complete learning flow");
  assert.equal(new Set(stringsActivities.map((a) => a.id)).size, stringsActivities.length);
  const types = new Set(stringsActivities.map((a) => a.type));
  for (const type of ["intro", "explain", "example", "predict", "practice", "formalize", "robin_check", "connect"]) {
    assert.ok(types.has(type), `flow needs a ${type} activity`);
  }
  assert.equal(stringsActivities[0].id, "why", "WHY opens the flow");
  assert.equal(stringsActivities.at(-1).type, "connect", "CONNECT closes the flow");
  for (const activity of stringsActivities) {
    assert.ok(activity.concept, `${activity.id} needs a concept`);
    assert.ok(activity.content.length <= 3, `${activity.id} must stay small (1 idea per screen)`);
  }
});

// === 2. Scope: no methods, slicing, negative indexing, f-strings, control flow ===
test("the lesson stays inside the strings scope", () => {
  const forbiddenCode = /\.upper\(|\.lower\(|\.strip\(|\.replace\(|\.split\(|\[.-?\d:\]|\[-\d\]|f"|f'|\binput\(|\bformat\(|\bif\b|\belse\b|\bfor\b|\bwhile\b|\bdef\b|\breturn\b|\bbool\(/;
  const forbiddenProse = /\binput\(|\bslicing\b|negative index|\bf-string\b|\bformat\(|\bescape sequence\b|\bmethod\b|\bcondition\b|\bloop\b|\bboolean\b|\bbool\(|\bcollection\b|\buser-defined\b/i;
  for (const activity of stringsActivities) {
    if (activity.code) assert.doesNotMatch(activity.code, forbiddenCode, `${activity.id} code must stay in scope`);
    if (activity.type === "connect") continue; // connect names the roadmap titles
    for (const paragraph of activity.content) {
      assert.doesNotMatch(paragraph, forbiddenProse, `${activity.id} must not teach later-lesson concepts`);
    }
  }
  for (const example of stringsLessonContent.codeExamples) {
    assert.doesNotMatch(example.code, forbiddenCode, "supplement examples stay in scope");
  }
});

// === 3. Learning targets: anatomy, quotes, indexing from 0, len(), contrast ===
test("the string anatomy shows characters over their 0-based indexes", () => {
  const intuition = stringsActivities.find((a) => a.id === "intuition");
  assert.match(intuition.code, /name = "Arya"/);
  assert.match(intuition.code, /A  r  y  a/);
  assert.match(intuition.code, /0  1  2  3/);
  assert.match(intuition.content.join(" "), /from 0|dari 0/i);
  // The index checkpoint is explicitly present.
  const checkpoint = stringsActivities.find((a) => a.id === "predict-index1");
  assert.match(checkpoint.code, /name\[1\]/);
  assert.match(checkpoint.correctAnswer, /^r /);
});

test("both quote styles make strings and variables stay distinct from text", () => {
  const see = stringsActivities.find((a) => a.id === "see-strings");
  assert.match(see.code, /name = "Arya"/);
  assert.match(see.code, /greeting = 'Hello'/);
  assert.match(see.content.join(" "), /"name"|kata empat huruf/i, "variable vs string distinction must appear");
});

test("len() is introduced lightly and predicted", () => {
  const lenPredict = stringsActivities.find((a) => a.id === "predict-len");
  assert.match(lenPredict.code, /len\(word\)/);
  assert.equal(lenPredict.correctAnswer.startsWith("6"), true);
  assert.match(lenPredict.explanation, /counts|menghitung/i);
  // len() is framed as a built-in tool, never as a functions lesson.
  const model = stringsActivities.find((a) => a.id === "mental-model");
  assert.match(model.content.join(" "), /built-in tool|built-in tool/i);
});

test("the + contrast shows numbers calculating while strings glue", () => {
  const contrast = stringsActivities.find((a) => a.id === "contrast");
  assert.match(contrast.code, /10 \+ 5/);
  assert.match(contrast.code, /"10" \+ "5"/);
  assert.match(contrast.content.join(" "), /105/);
});

// === 4. Deterministic grading ===
test("predict activities have well-formed options, answers, and misconceptions", () => {
  const predicts = stringsActivities.filter((a) => a.type === "predict");
  assert.ok(predicts.length >= 3, "needs indexing, index-1 checkpoint, and len predicts");
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

test("the TRY checker requires real concatenation, not the finished sentence", () => {
  const practice = stringsActivities.find((a) => a.type === "practice");
  assert.equal(practice.id, "try");
  assert.equal(practice.checkAnswer('print(first + " " + name)'), true);
  assert.equal(practice.checkAnswer("print(first + ' ' + name)"), true);
  assert.equal(practice.checkAnswer("print( first + ' ' + name )"), true);
  assert.equal(practice.checkAnswer('print("Hello Arya")'), false, "typing the result skips the concatenation");
  assert.equal(practice.checkAnswer("print(first + name)"), false, "the space between words must be a value");
  assert.equal(practice.checkAnswer('print("Hello" + " " + name)'), false, "the first word must come from the variable");
  assert.equal(practice.checkAnswer(""), false);
});

// === 5. Mastery (3 concepts) and relevance vocabulary ===
test("every mastery concept receives evidence and connect stays out", () => {
  assert.ok(config.stringsMasteryConfig.concepts.length >= 2 && config.stringsMasteryConfig.concepts.length <= 3, "mastery stays at 2-3 concepts");
  const evidence = new Set();
  for (const activity of stringsActivities) {
    const mapped = config.stringsMasteryConfig.activityConceptToMastery(activity.concept);
    if (mapped) evidence.add(mapped);
  }
  for (const concept of config.stringsMasteryConfig.robinCheckSignalToEvidence("strong").concepts) evidence.add(concept);
  for (const concept of config.stringsMasteryConfig.concepts) {
    assert.ok(evidence.has(concept), `${concept} has no evidence source`);
  }
  assert.equal(config.stringsMasteryConfig.activityConceptToMastery("connections"), null, "connect must not emit mastery evidence");
});

test("relevance outputs never escape the mastery vocabulary", () => {
  const allowed = new Set(config.stringsMasteryConfig.concepts);
  for (const concept of config.stringsRelevance.checkConcepts()) assert.ok(allowed.has(concept));
  for (const message of ["index mulai dari apa", "gabung dua string", "apa itu string"]) {
    for (const concept of config.stringsRelevance.chatConcepts(message)) {
      assert.ok(allowed.has(concept), `${concept} escapes mastery vocabulary`);
    }
  }
});

// === 6. Localization shares grading identity, changes prose only ===
test("ID and EN activities share ids, code, and answers while changing prose", () => {
  const id = localization.getStringsActivities("id");
  const en = localization.getStringsActivities("en");
  assert.equal(id.length, en.length);
  for (let index = 0; index < id.length; index++) {
    for (const key of ["id", "type", "concept", "code", "correctAnswer"]) assert.equal(id[index][key], en[index][key]);
    assert.deepEqual(id[index].options, en[index].options);
    assert.notEqual(id[index].title, en[index].title, "ID title must be localized");
  }
  const robinStep = id.find((a) => a.type === "robin_check");
  assert.deepEqual(Array.from(robinStep.content), [localization.stringsCopy.id.prompt]);
});

test("content localization preserves structure and grading fields", () => {
  const id = localization.localizeStringsContent(stringsLessonContent, "id");
  assert.equal(id.slug, stringsLessonContent.slug);
  assert.equal(id.academicExplanation.length, stringsLessonContent.academicExplanation.length);
  assert.equal(id.keyTerms.length, stringsLessonContent.keyTerms.length);
  assert.equal(id.commonMistakes.length, stringsLessonContent.commonMistakes.length);
  assert.equal(id.quickChecks.length, stringsLessonContent.quickChecks.length);
  for (let index = 0; index < id.quickChecks.length; index++) {
    assert.deepEqual(id.quickChecks[index].options, stringsLessonContent.quickChecks[index].options);
    assert.equal(id.quickChecks[index].answer, stringsLessonContent.quickChecks[index].answer);
    assert.notEqual(id.quickChecks[index].question, stringsLessonContent.quickChecks[index].question);
  }
});

// === 7. Course and registry integration, Module 02 order, progress safety ===
test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["strings", stringsDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["strings", \{ getActivities: getStringsActivities/);
  const loader = read("lib/lessons/strings.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-building-blocks"/);
  assert.match(loader, /"strings"/);
  assert.equal(existsSync(new URL("content/lessons/programming/strings-instructions.ts", root)), true, "needs Robin Check rubrics");
});

test("the lesson is building-blocks position 5 and shifts legacy lessons safely", () => {
  const courses = loadModule("data/courses.ts");
  const list = courses.implementedProgrammingLessonSlugs;
  assert.equal(list[9], "casting", "Casting stays right before Strings");
  assert.equal(list[10], "strings", "Strings stays in the Module 02 order");
  assert.equal(list[11], "booleans", "Booleans follows Strings");
  assert.equal(list[12], "operators", "Operators survives after the insertions");
  assert.equal(courses.defaultCurrentLesson.lessonSlug, "what-is-programming", "default entry point unchanged");
  // The manifest and baseline seed include the later User Input insertion.
  const manifest = loadModule("data/curriculum-manifest.ts");
  const blocks = manifest.currentCurriculumManifest.semesters[0].courses
    .find((course) => course.slug === "programming").modules
    .find((module) => module.slug === "programming-building-blocks");
  const byslug = Object.fromEntries(blocks.lessons.map((lesson) => [lesson.slug, lesson.position]));
  assert.equal(byslug["casting"], 4);
  assert.equal(byslug["strings"], 5);
  assert.equal(byslug["booleans"], 6);
  assert.equal(byslug["operators"], 7);
  assert.equal(byslug["functions"], 11);
  const seed = read("database/phase4-seed.sql");
  assert.match(seed, /\('programming-building-blocks', 'strings', 'Strings', '[^']+', 14, 5\)/);
  const migration = read("database/phase20-2e-strings.sql");
  assert.match(migration, /'strings'/);
  assert.match(migration, /on conflict \(module_id, slug\) do update/);
  assert.doesNotMatch(migration, /delete from/i, "migration must never delete data");
});

test("connect points to Booleans, the closing Module 02 lesson", () => {
  const connect = stringsActivities.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Booleans/, "connect must name the next lesson");
});

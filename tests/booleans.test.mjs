import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.2F — Module 02 lesson "Booleans". Closes Module 02. Fresh standard
// lesson: boolean as data (True/False literals, states in variables) with a
// light introduction to comparisons producing booleans. No bool(), input(),
// control flow, and/or/not, truthiness, or advanced comparisons.

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
const { booleansActivities } = loadModule("content/lessons/programming/booleans-activities.ts");
const { booleansLessonContent } = loadModule("content/lessons/programming/booleans.ts");
const localization = loadModule("content/lessons/programming/booleans-localization.ts", {
  booleansActivities,
  getSharedCopy: sharedCopyModule.getSharedCopy,
});
const config = loadModule("content/lessons/programming/booleans-config.ts", { LessonMasteryConfig: {} });

// === 1. Learning flow: WHY → INTUITION → SEE → MENTAL MODEL → CONTRAST → PREDICT → TRY → FORMALIZE → ROBIN CHECK → CONNECT ===
test("activities carry the full beginner flow with one idea per screen", () => {
  assert.ok(booleansActivities.length >= 8, "needs a complete learning flow");
  assert.equal(new Set(booleansActivities.map((a) => a.id)).size, booleansActivities.length);
  const types = new Set(booleansActivities.map((a) => a.type));
  for (const type of ["intro", "explain", "example", "predict", "practice", "formalize", "robin_check", "connect"]) {
    assert.ok(types.has(type), `flow needs a ${type} activity`);
  }
  assert.equal(booleansActivities[0].id, "why", "WHY opens the flow");
  assert.equal(booleansActivities.at(-1).type, "connect", "CONNECT closes the flow");
  for (const activity of booleansActivities) {
    assert.ok(activity.concept, `${activity.id} needs a concept`);
    assert.ok(activity.content.length <= 3, `${activity.id} must stay small (1 idea per screen)`);
  }
});

// === 2. Scope: boolean as data — no bool(), input, control flow, or boolean logic ===
test("the lesson stays inside the booleans scope", () => {
  const forbiddenCode = /\bbool\(|\binput\(|\bif\b|\belif\b|\belse\b|\bwhile\b|\bfor\b|\bdef\b|\breturn\b|\band\b|\bor\b|\bnot\b|>=|<=|!=|f"|f'/;
  const forbiddenProse = /\bbool\(|\binput\(|\btruthiness\b|\bfalsiness\b|\btruth table\b|\bif statement\b|\bcondition\b|\bloop\b|\bcollection\b|\belif\b/i;
  for (const activity of booleansActivities) {
    if (activity.code) assert.doesNotMatch(activity.code, forbiddenCode, `${activity.id} code must stay in scope`);
    if (activity.type === "connect") continue; // connect names the roadmap titles
    for (const paragraph of activity.content) {
      assert.doesNotMatch(paragraph, forbiddenProse, `${activity.id} must not teach later-lesson concepts`);
    }
  }
  for (const example of booleansLessonContent.codeExamples) {
    assert.doesNotMatch(example.code, forbiddenCode, "supplement examples stay in scope");
  }
  // No if-preview even in disguise.
  assert.doesNotMatch(read("content/lessons/programming/booleans-activities.ts"), /if is_online|if\s+\w+:/, "no conditional preview");
});

// === 3. Learning targets: two values, capitalization, True vs "True", states ===
test("the two boolean literals appear with correct capitalization", () => {
  const intuition = booleansActivities.find((a) => a.id === "intuition");
  assert.match(intuition.code, /is_online = True/);
  assert.match(intuition.code, /is_logged_in = False/);
  const contrast = booleansActivities.find((a) => a.id === "contrast");
  assert.match(contrast.code, /type\(True\)/);
  assert.match(contrast.code, /type\("True"\)/);
  assert.match(contrast.code, /type\(true\)/, "the lowercase spelling trap is shown");
  assert.match(contrast.content.join(" "), /capital/i);
});

test("states-in-variables use the is/has naming pattern", () => {
  const model = booleansActivities.find((a) => a.id === "mental-model");
  assert.match(model.code, /is_online/);
  assert.match(model.code, /has_access/);
  assert.match(model.code, /is_ready\s+→ False/);
  assert.match(model.code, /→ bool/);
});

test("comparisons produce booleans with a light = vs == distinction", () => {
  const equality = booleansActivities.find((a) => a.id === "predict-equality");
  assert.match(equality.code, /age = 20/);
  assert.match(equality.code, /age == 20/);
  assert.equal(equality.correctAnswer.startsWith("True"), true);
  assert.ok(Object.values(equality.misconceptionsByAnswer ?? {}).includes("assignment_comparison_confusion"));
  // Only > and == appear; no advanced comparison operators are taught.
  const allCode = booleansActivities.map((a) => a.code ?? "").join("\n");
  assert.doesNotMatch(allCode, />=|<=|!=/);
});

// === 4. Deterministic grading ===
test("predict activities have well-formed options, answers, and misconceptions", () => {
  const predicts = booleansActivities.filter((a) => a.type === "predict");
  assert.ok(predicts.length >= 4, "needs print, comparison, equality, and quoted-type predicts");
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
  // The quoted-type misconception checkpoint pins "False" as str.
  const quoted = booleansActivities.find((a) => a.id === "predict-quoted");
  assert.match(quoted.correctAnswer, /^str/);
  // The comparison predict pins score > 5 to True.
  const comparison = booleansActivities.find((a) => a.id === "predict-comparison");
  assert.match(comparison.correctAnswer, /^True/);
});

test("the TRY checker requires the unquoted literal assignment and the print", () => {
  const practice = booleansActivities.find((a) => a.type === "practice");
  assert.equal(practice.id, "try");
  assert.equal(practice.checkAnswer('is_online = True\nprint(is_online)'), true);
  assert.equal(practice.checkAnswer('is_online = True\r\nprint(is_online)'), true);
  assert.equal(practice.checkAnswer('is_online = True\n  print( is_online )'), true);
  assert.equal(practice.checkAnswer('is_online = "True"\nprint(is_online)'), false, "a quoted boolean is a string");
  assert.equal(practice.checkAnswer('is_online = true\nprint(is_online)'), false, "lowercase is not the literal");
  assert.equal(practice.checkAnswer("is_online = True"), false, "the print must be part of the answer");
  assert.equal(practice.checkAnswer(""), false);
});

// === 5. Mastery (3 concepts) and relevance vocabulary ===
test("every mastery concept receives evidence and connect stays out", () => {
  assert.ok(config.booleansMasteryConfig.concepts.length >= 2 && config.booleansMasteryConfig.concepts.length <= 3, "mastery stays at 2-3 concepts");
  const evidence = new Set();
  for (const activity of booleansActivities) {
    const mapped = config.booleansMasteryConfig.activityConceptToMastery(activity.concept);
    if (mapped) evidence.add(mapped);
  }
  for (const concept of config.booleansMasteryConfig.robinCheckSignalToEvidence("strong").concepts) evidence.add(concept);
  for (const concept of config.booleansMasteryConfig.concepts) {
    assert.ok(evidence.has(concept), `${concept} has no evidence source`);
  }
  assert.equal(config.booleansMasteryConfig.activityConceptToMastery("connections"), null, "connect must not emit mastery evidence");
});

test("relevance outputs never escape the mastery vocabulary", () => {
  const allowed = new Set(config.booleansMasteryConfig.concepts);
  for (const concept of config.booleansRelevance.checkConcepts()) assert.ok(allowed.has(concept));
  for (const message of ["beda True dan \"True\"", "kenapa harus huruf besar", "hasil dari perbandingan", "cuaca hari ini"]) {
    for (const concept of config.booleansRelevance.chatConcepts(message)) {
      assert.ok(allowed.has(concept), `${concept} escapes mastery vocabulary`);
    }
  }
});

// === 6. Localization shares grading identity, changes prose only ===
test("ID and EN activities share ids, code, and answers while changing prose", () => {
  const id = localization.getBooleansActivities("id");
  const en = localization.getBooleansActivities("en");
  assert.equal(id.length, en.length);
  for (let index = 0; index < id.length; index++) {
    for (const key of ["id", "type", "concept", "code", "correctAnswer"]) assert.equal(id[index][key], en[index][key]);
    assert.deepEqual(id[index].options, en[index].options);
    assert.notEqual(id[index].title, en[index].title, "ID title must be localized");
  }
  const robinStep = id.find((a) => a.type === "robin_check");
  assert.deepEqual(Array.from(robinStep.content), [localization.booleansCopy.id.prompt]);
});

test("content localization preserves structure and grading fields", () => {
  const id = localization.localizeBooleansContent(booleansLessonContent, "id");
  assert.equal(id.slug, booleansLessonContent.slug);
  assert.equal(id.academicExplanation.length, booleansLessonContent.academicExplanation.length);
  assert.equal(id.keyTerms.length, booleansLessonContent.keyTerms.length);
  assert.equal(id.commonMistakes.length, booleansLessonContent.commonMistakes.length);
  assert.equal(id.quickChecks.length, booleansLessonContent.quickChecks.length);
  for (let index = 0; index < id.quickChecks.length; index++) {
    assert.deepEqual(id.quickChecks[index].options, booleansLessonContent.quickChecks[index].options);
    assert.equal(id.quickChecks[index].answer, booleansLessonContent.quickChecks[index].answer);
    assert.notEqual(id.quickChecks[index].question, booleansLessonContent.quickChecks[index].question);
  }
});

// === 7. Course and registry integration, Module 02 order, progress safety ===
test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["booleans", booleansDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["booleans", \{ getActivities: getBooleansActivities/);
  const loader = read("lib/lessons/booleans.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-building-blocks"/);
  assert.match(loader, /"booleans"/);
  assert.equal(existsSync(new URL("content/lessons/programming/booleans-instructions.ts", root)), true, "needs Robin Check rubrics");
});

test("Module 02 closes at building-blocks position 6 with Operators after it", () => {
  const courses = loadModule("data/courses.ts");
  const list = courses.implementedProgrammingLessonSlugs;
  // Final Module 02 order: Variables → Data Types → Numbers → Casting → Strings → Booleans.
  assert.deepEqual(Array.from(list).slice(6, 12), [
    "variables", "data-types", "numbers", "casting", "strings", "booleans",
  ]);
  assert.equal(list[12], "operators", "Operators comes after Booleans");
  assert.equal(courses.defaultCurrentLesson.lessonSlug, "what-is-programming", "default entry point unchanged");
  // The manifest and baseline seed mirror the roadmap: booleans at 6, block lessons at 7-10.
  const manifest = loadModule("data/curriculum-manifest.ts");
  const blocks = manifest.currentCurriculumManifest.semesters[0].courses
    .find((course) => course.slug === "programming").modules
    .find((module) => module.slug === "programming-building-blocks");
  const byslug = Object.fromEntries(blocks.lessons.map((lesson) => [lesson.slug, lesson.position]));
  assert.equal(byslug["strings"], 5);
  assert.equal(byslug["booleans"], 6);
  assert.equal(byslug["operators"], 7);
  assert.equal(byslug["functions"], 10);
  const seed = read("database/phase4-seed.sql");
  assert.match(seed, /\('programming-building-blocks', 'booleans', 'Booleans', '[^']+', 12, 6\)/);
  const migration = read("database/phase20-2f-booleans.sql");
  assert.match(migration, /'booleans'/);
  assert.match(migration, /on conflict \(module_id, slug\) do update/);
  assert.doesNotMatch(migration, /delete from/i, "migration must never delete data");
});

test("connect frames Module 03 conceptually without teaching it", () => {
  const connect = booleansActivities.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Operators/, "connect must name the next lesson");
  assert.match(connect.content.join(" "), /Module 02|Module 03/);
  // No operator or control-flow teaching leaks into the roadmap framing
  // (plain English and/or in prose is fine — only code teaching is forbidden).
  assert.doesNotMatch(connect.content.join(" "), /\bif\s+\w+|truthiness|truth table/i);
});

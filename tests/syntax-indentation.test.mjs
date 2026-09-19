import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.1D — beginner onboarding lesson "Syntax & Indentation".
// Same architecture contract as 20.1A-20.1C. Scope: writing rules only —
// no conditionals/loops/functions/variables/input/comments/error teaching.

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
const { syntaxIndentationActivities } = loadModule("content/lessons/programming/syntax-indentation-activities.ts");
const { syntaxIndentationLessonContent } = loadModule("content/lessons/programming/syntax-indentation.ts");
const localization = loadModule("content/lessons/programming/syntax-indentation-localization.ts", {
  syntaxIndentationActivities,
  getSharedCopy: sharedCopyModule.getSharedCopy,
});
const config = loadModule("content/lessons/programming/syntax-indentation-config.ts", { LessonMasteryConfig: {} });

// === 1. Learning flow: WHY → INTUITION → SEE → MENTAL MODEL → PREDICT → TRY → FORMALIZE → ROBIN CHECK → CONNECT ===
test("activities carry the full beginner flow with one idea per screen", () => {
  assert.ok(syntaxIndentationActivities.length >= 8, "needs a complete learning flow");
  assert.equal(new Set(syntaxIndentationActivities.map((a) => a.id)).size, syntaxIndentationActivities.length);
  const types = new Set(syntaxIndentationActivities.map((a) => a.type));
  for (const type of ["intro", "explain", "example", "predict", "practice", "formalize", "robin_check", "connect"]) {
    assert.ok(types.has(type), `flow needs a ${type} activity`);
  }
  assert.equal(syntaxIndentationActivities[0].id, "why", "WHY opens the flow");
  assert.equal(syntaxIndentationActivities.at(-1).type, "connect", "CONNECT closes the flow");
  for (const activity of syntaxIndentationActivities) {
    assert.ok(activity.concept, `${activity.id} needs a concept`);
    assert.ok(activity.content.length <= 3, `${activity.id} must stay small (1 idea per screen)`);
  }
});

// === 2. Scope: writing rules only — no later-lesson concepts ===
test("the lesson stays inside syntax/indentation scope", () => {
  const forbiddenCode = /\b(if|elif|else|for |while |def |return|input\(|#|f"|f')/;
  const forbiddenProse = /\b(variable|data type|operator|condition|loop|function|concatenat|f-string|input\(|SyntaxError|IndentationError|traceback|try\/except)\b/i;
  for (const activity of syntaxIndentationActivities) {
    if (activity.code) assert.doesNotMatch(activity.code, forbiddenCode, `${activity.id} code must stay at print-level`);
    if (activity.type === "connect") continue; // connect names the roadmap titles
    for (const paragraph of activity.content) {
      assert.doesNotMatch(paragraph, forbiddenProse, `${activity.id} must not teach later-lesson concepts`);
    }
  }
  for (const example of syntaxIndentationLessonContent.codeExamples) {
    assert.doesNotMatch(example.code, forbiddenCode, "supplement examples stay at print-level");
  }
});

// === 3. Visual comparison: correct vs wrong shape is shown explicitly ===
test("the lesson shows a visual correct-vs-wrong comparison and a spot-the-difference", () => {
  const spot = syntaxIndentationActivities.find((a) => a.id === "spot-indentation");
  assert.ok(spot, "needs a Spot the Difference activity");
  assert.match(spot.code, /Versi A/);
  assert.match(spot.code, /Versi B/);
  // The comparison must contrast flush-left with indented lines.
  assert.match(spot.code, /print\("Hello!"\)\s+print\("Hello!"\)/);
  assert.ok(syntaxIndentationLessonContent.codeExamples.some((e) => /Versi rapi/.test(e.code)), "supplement shows a side-by-side shape comparison");
  // Case sensitivity is covered explicitly.
  assert.ok(syntaxIndentationActivities.some((a) => a.code?.includes("Print(\"Hello!\")")), "Print vs print must be shown");
});

// === 4. Deterministic grading ===
test("predict activities have well-formed options, answers, and misconceptions", () => {
  const predicts = syntaxIndentationActivities.filter((a) => a.type === "predict");
  assert.ok(predicts.length >= 2, "needs at least two Predict/Spot activities");
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

test("the TRY checker accepts the correct shape and rejects wrong shapes", () => {
  const practice = syntaxIndentationActivities.find((a) => a.type === "practice");
  assert.ok(practice, "needs a practice activity");
  assert.equal(typeof practice.checkAnswer, "function");
  assert.equal(practice.checkAnswer('print("Halo, dunia!")'), true);
  assert.equal(practice.checkAnswer("print('Halo, dunia!')"), true);
  assert.equal(practice.checkAnswer('  print( "Halo, dunia!" )  '), true);
  assert.equal(practice.checkAnswer('Print("Halo, dunia!")'), false, "capitalized name must be rejected");
  assert.equal(practice.checkAnswer('PRINT("Halo, dunia!")'), false, "any other casing must be rejected");
  assert.equal(practice.checkAnswer('print("Halo dunia!")'), false);
  assert.equal(practice.checkAnswer(""), false);
});

// === 5. Localization changes prose only; grading identity stays shared ===
test("ID and EN activities share ids, code, and answers while changing prose", () => {
  const id = localization.getSyntaxIndentationActivities("id");
  const en = localization.getSyntaxIndentationActivities("en");
  assert.equal(id.length, en.length);
  for (let index = 0; index < id.length; index++) {
    for (const key of ["id", "type", "concept", "code", "correctAnswer"]) assert.equal(id[index][key], en[index][key]);
    assert.deepEqual(id[index].options, en[index].options);
    assert.notEqual(id[index].title, en[index].title, "ID title must be localized");
  }
  const robinStep = id.find((a) => a.type === "robin_check");
  assert.deepEqual(Array.from(robinStep.content), [localization.syntaxIndentationCopy.id.prompt]);
});

test("content localization preserves structure and grading fields", () => {
  const id = localization.localizeSyntaxIndentationContent(syntaxIndentationLessonContent, "id");
  assert.equal(id.slug, syntaxIndentationLessonContent.slug);
  assert.equal(id.academicExplanation.length, syntaxIndentationLessonContent.academicExplanation.length);
  assert.equal(id.keyTerms.length, syntaxIndentationLessonContent.keyTerms.length);
  assert.equal(id.commonMistakes.length, syntaxIndentationLessonContent.commonMistakes.length);
  assert.equal(id.quickChecks.length, syntaxIndentationLessonContent.quickChecks.length);
  for (let index = 0; index < id.quickChecks.length; index++) {
    assert.deepEqual(id.quickChecks[index].options, syntaxIndentationLessonContent.quickChecks[index].options);
    assert.equal(id.quickChecks[index].answer, syntaxIndentationLessonContent.quickChecks[index].answer);
    assert.notEqual(id.quickChecks[index].question, syntaxIndentationLessonContent.quickChecks[index].question);
  }
});

// === 6. Mastery (3 concepts) and relevance vocabulary ===
test("every mastery concept receives evidence and connect stays out", () => {
  assert.ok(config.syntaxIndentationMasteryConfig.concepts.length >= 2 && config.syntaxIndentationMasteryConfig.concepts.length <= 3, "mastery stays at 2-3 concepts");
  const evidence = new Set();
  for (const activity of syntaxIndentationActivities) {
    const mapped = config.syntaxIndentationMasteryConfig.activityConceptToMastery(activity.concept);
    if (mapped) evidence.add(mapped);
  }
  for (const concept of config.syntaxIndentationMasteryConfig.robinCheckSignalToEvidence("strong").concepts) evidence.add(concept);
  for (const concept of config.syntaxIndentationMasteryConfig.concepts) {
    assert.ok(evidence.has(concept), `${concept} has no evidence source`);
  }
  assert.equal(config.syntaxIndentationMasteryConfig.activityConceptToMastery("connections"), null, "connect must not emit mastery evidence");
});

test("relevance outputs never escape the mastery vocabulary", () => {
  const allowed = new Set(config.syntaxIndentationMasteryConfig.concepts);
  for (const concept of config.syntaxIndentationRelevance.checkConcepts()) assert.ok(allowed.has(concept));
  for (const message of ["apa itu syntax", "print dengan huruf besar", "indentation itu apa", "resep nasi goreng"]) {
    for (const concept of config.syntaxIndentationRelevance.chatConcepts(message)) {
      assert.ok(allowed.has(concept), `${concept} escapes mastery vocabulary`);
    }
  }
});

// === 7. Course and registry integration, roadmap order, progress safety ===
test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["syntax-indentation",\s*syntaxIndentationDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["syntax-indentation",\s*\{/);
  const loader = read("lib/lessons/syntax-indentation.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-fundamentals"/);
  assert.match(loader, /"syntax-indentation"/);
  assert.equal(existsSync(new URL("content/lessons/programming/syntax-indentation-instructions.ts", root)), true, "needs Robin Check rubrics");
});

test("the lesson is roadmap position 04 and the legacy placeholders moved below it", () => {
  const courses = loadModule("data/courses.ts");
  const list = courses.implementedProgrammingLessonSlugs;
  assert.deepEqual(Array.from(list).slice(0, 6), ["what-is-programming", "hello-python", "print-output", "syntax-indentation", "comments", "understanding-errors"]);
  assert.equal(list[6], "variables", "existing lesson order must survive");
  assert.equal(courses.defaultCurrentLesson.lessonSlug, "what-is-programming", "default entry point unchanged");
  // The manifest and baseline seed mirror the roadmap: 04 = syntax-indentation,
  // placeholders parked at 7-8 (never deleted, positions only).
  const manifest = loadModule("data/curriculum-manifest.ts");
  const fundamentals = manifest.currentCurriculumManifest.semesters[0].courses
    .find((course) => course.slug === "programming").modules
    .find((module) => module.slug === "programming-fundamentals");
  assert.equal(fundamentals.lessons[3].slug, "syntax-indentation");
  assert.equal(fundamentals.lessons[3].position, 4);
  const placeholders = Object.fromEntries(fundamentals.lessons
    .filter((lesson) => ["programming-languages", "syntax-vs-semantics"].includes(lesson.slug))
    .map((lesson) => [lesson.slug, lesson.position]));
  assert.equal(placeholders["programming-languages"], 7);
  assert.equal(placeholders["syntax-vs-semantics"], 8);
  const seed = read("database/phase4-seed.sql");
  assert.match(seed, /\('programming-fundamentals', 'syntax-indentation', 'Syntax & Indentation', '([^']+)', 12, 4\)/);
  assert.match(seed, /\('programming-fundamentals', 'programming-languages', '[^']+', '[^']+', 12, 7\)/);
  assert.match(seed, /\('programming-fundamentals', 'syntax-vs-semantics', '[^']+', '[^']+', 12, 8\)/);
  const migration = read("database/phase20-1d-syntax-indentation.sql");
  assert.match(migration, /'syntax-indentation'/);
  assert.match(migration, /on conflict \(module_id, slug\) do update/);
  assert.doesNotMatch(migration, /delete from/i, "migration must never delete data");
});

test("connect names the next lesson in the beginner path", () => {
  const connect = syntaxIndentationActivities.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Comments/, "connect must name the next lesson");
});

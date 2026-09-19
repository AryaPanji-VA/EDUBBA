import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.1E — beginner onboarding lesson "Comments".
// Same architecture contract as 20.1A-20.1D. Scope: single-line comments only —
// no docstrings, TODO/FIXME conventions, or later-lesson concepts.

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
const { commentsActivities } = loadModule("content/lessons/programming/comments-activities.ts");
const { commentsLessonContent } = loadModule("content/lessons/programming/comments.ts");
const localization = loadModule("content/lessons/programming/comments-localization.ts", {
  commentsActivities,
  getSharedCopy: sharedCopyModule.getSharedCopy,
});
const config = loadModule("content/lessons/programming/comments-config.ts", { LessonMasteryConfig: {} });

// === 1. Learning flow: WHY → INTUITION → SEE → MENTAL MODEL → PREDICT → TRY → FORMALIZE → ROBIN CHECK → CONNECT ===
test("activities carry the full beginner flow with one idea per screen", () => {
  assert.ok(commentsActivities.length >= 8, "needs a complete learning flow");
  assert.equal(new Set(commentsActivities.map((a) => a.id)).size, commentsActivities.length);
  const types = new Set(commentsActivities.map((a) => a.type));
  for (const type of ["intro", "explain", "example", "predict", "practice", "formalize", "robin_check", "connect"]) {
    assert.ok(types.has(type), `flow needs a ${type} activity`);
  }
  assert.equal(commentsActivities[0].id, "why", "WHY opens the flow");
  assert.equal(commentsActivities.at(-1).type, "connect", "CONNECT closes the flow");
  for (const activity of commentsActivities) {
    assert.ok(activity.concept, `${activity.id} needs a concept`);
    assert.ok(activity.content.length <= 3, `${activity.id} must stay small (1 idea per screen)`);
  }
});

// === 2. Scope: single-line comments only ===
test("the lesson stays inside single-line comment scope", () => {
  const forbiddenCode = /"""|f"|f'|input\(|\bif\b|\belse\b|\bfor\b|\bwhile\b|\bdef\b|\breturn\b/;
  const forbiddenProse = /\b(variable|data type|operator|condition|loop|function|concatenat|f-string|input\(|docstring|TODO|FIXME|try\/except)\b/i;
  for (const activity of commentsActivities) {
    if (activity.code) assert.doesNotMatch(activity.code, forbiddenCode, `${activity.id} code must stay at print-level`);
    if (activity.type === "connect") continue; // connect names the roadmap titles
    for (const paragraph of activity.content) {
      assert.doesNotMatch(paragraph, forbiddenProse, `${activity.id} must not teach later-lesson concepts`);
    }
  }
  for (const example of commentsLessonContent.codeExamples) {
    assert.doesNotMatch(example.code, forbiddenCode, "supplement examples stay at print-level");
  }
});

// === 3. Visual distinction: code vs comment vs output ===
test("code blocks show comment, code, and output as distinct sections", () => {
  const canonical = commentsActivities.find((a) => a.code?.includes("# Ini adalah comment"));
  assert.ok(canonical, "the brief's canonical example must appear");
  assert.match(canonical.code, /output:\nHello!/);
  assert.ok(commentsActivities.some((a) => a.code?.includes('print("Hello!") # menampilkan sapaan')), "inline comment example must appear");
  assert.ok(commentsLessonContent.codeExamples.some((e) => /mengulang code/.test(e.code)), "helpful vs repeated comment comparison must appear");
});

// === 4. Deterministic grading ===
test("predict activities have well-formed options, answers, and misconceptions", () => {
  const predicts = commentsActivities.filter((a) => a.type === "predict");
  assert.ok(predicts.length >= 2, "needs at least two Predict activities");
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

test("the TRY checker accepts the comment form and rejects non-comment lines", () => {
  const practice = commentsActivities.find((a) => a.type === "practice");
  assert.ok(practice, "needs a practice activity");
  assert.equal(typeof practice.checkAnswer, "function");
  assert.equal(practice.checkAnswer("# menyapa pengguna"), true);
  assert.equal(practice.checkAnswer("  #  Menyapa Pengguna  "), true, "note text is human text");
  assert.equal(practice.checkAnswer("menyapa pengguna"), false, "missing # is not a comment");
  assert.equal(practice.checkAnswer("// menyapa pengguna"), false, "wrong marker");
  assert.equal(practice.checkAnswer('print("menyapa pengguna")'), false, "a print call is not a comment");
  assert.equal(practice.checkAnswer(""), false);
});

// === 5. Localization changes prose only; grading identity stays shared ===
test("ID and EN activities share ids, code, and answers while changing prose", () => {
  const id = localization.getCommentsActivities("id");
  const en = localization.getCommentsActivities("en");
  assert.equal(id.length, en.length);
  for (let index = 0; index < id.length; index++) {
    for (const key of ["id", "type", "concept", "code", "correctAnswer"]) assert.equal(id[index][key], en[index][key]);
    assert.deepEqual(id[index].options, en[index].options);
    assert.notEqual(id[index].title, en[index].title, "ID title must be localized");
  }
  const robinStep = id.find((a) => a.type === "robin_check");
  assert.deepEqual(Array.from(robinStep.content), [localization.commentsCopy.id.prompt]);
});

test("content localization preserves structure and grading fields", () => {
  const id = localization.localizeCommentsContent(commentsLessonContent, "id");
  assert.equal(id.slug, commentsLessonContent.slug);
  assert.equal(id.academicExplanation.length, commentsLessonContent.academicExplanation.length);
  assert.equal(id.keyTerms.length, commentsLessonContent.keyTerms.length);
  assert.equal(id.commonMistakes.length, commentsLessonContent.commonMistakes.length);
  assert.equal(id.quickChecks.length, commentsLessonContent.quickChecks.length);
  for (let index = 0; index < id.quickChecks.length; index++) {
    assert.deepEqual(id.quickChecks[index].options, commentsLessonContent.quickChecks[index].options);
    assert.equal(id.quickChecks[index].answer, commentsLessonContent.quickChecks[index].answer);
    assert.notEqual(id.quickChecks[index].question, commentsLessonContent.quickChecks[index].question);
  }
});

// === 6. Mastery (3 concepts) and relevance vocabulary ===
test("every mastery concept receives evidence and connect stays out", () => {
  assert.ok(config.commentsMasteryConfig.concepts.length >= 2 && config.commentsMasteryConfig.concepts.length <= 3, "mastery stays at 2-3 concepts");
  const evidence = new Set();
  for (const activity of commentsActivities) {
    const mapped = config.commentsMasteryConfig.activityConceptToMastery(activity.concept);
    if (mapped) evidence.add(mapped);
  }
  for (const concept of config.commentsMasteryConfig.robinCheckSignalToEvidence("strong").concepts) evidence.add(concept);
  for (const concept of config.commentsMasteryConfig.concepts) {
    assert.ok(evidence.has(concept), `${concept} has no evidence source`);
  }
  assert.equal(config.commentsMasteryConfig.activityConceptToMastery("connections"), null, "connect must not emit mastery evidence");
});

test("relevance outputs never escape the mastery vocabulary", () => {
  const allowed = new Set(config.commentsMasteryConfig.concepts);
  for (const concept of config.commentsRelevance.checkConcepts()) assert.ok(allowed.has(concept));
  for (const message of ["apa itu comment", "cara nulis tanda pagar", "beda code dan output", "cuaca hari ini"]) {
    for (const concept of config.commentsRelevance.chatConcepts(message)) {
      assert.ok(allowed.has(concept), `${concept} escapes mastery vocabulary`);
    }
  }
});

// === 7. Course and registry integration, roadmap order, progress safety ===
test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["comments",\s*commentsDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["comments",\s*\{/);
  const loader = read("lib/lessons/comments.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-fundamentals"/);
  assert.match(loader, /"comments"/);
  assert.equal(existsSync(new URL("content/lessons/programming/comments-instructions.ts", root)), true, "needs Robin Check rubrics");
});

test("the lesson is roadmap position 05 and the placeholders stay parked below", () => {
  const courses = loadModule("data/courses.ts");
  const list = courses.implementedProgrammingLessonSlugs;
  assert.deepEqual(Array.from(list).slice(0, 6), [
    "what-is-programming", "hello-python", "print-output", "syntax-indentation", "comments", "understanding-errors",
  ]);
  assert.equal(list[6], "variables", "existing lesson order must survive");
  assert.equal(courses.defaultCurrentLesson.lessonSlug, "what-is-programming", "default entry point unchanged");
  // The manifest and baseline seed mirror the roadmap: 05 = comments,
  // slot 6 reserved for Understanding Errors, placeholders parked at 7-8.
  const manifest = loadModule("data/curriculum-manifest.ts");
  const fundamentals = manifest.currentCurriculumManifest.semesters[0].courses
    .find((course) => course.slug === "programming").modules
    .find((module) => module.slug === "programming-fundamentals");
  const byslug = Object.fromEntries(fundamentals.lessons.map((lesson) => [lesson.slug, lesson.position]));
  assert.equal(byslug["comments"], 5);
  assert.equal(byslug["programming-languages"], 7);
  assert.equal(byslug["syntax-vs-semantics"], 8);
  const seed = read("database/phase4-seed.sql");
  assert.match(seed, /\('programming-fundamentals', 'comments', 'Comments', '[^']+', 10, 5\)/);
  assert.match(seed, /\('programming-fundamentals', 'programming-languages', '[^']+', '[^']+', 12, 7\)/);
  const migration = read("database/phase20-1e-comments.sql");
  assert.match(migration, /'comments'/);
  assert.match(migration, /on conflict \(module_id, slug\) do update/);
  assert.doesNotMatch(migration, /delete from/i, "migration must never delete data");
});

test("connect names the next lesson in the beginner path", () => {
  const connect = commentsActivities.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Understanding Errors/, "connect must name the next lesson");
});

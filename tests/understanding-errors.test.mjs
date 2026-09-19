import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.1F — beginner onboarding lesson "Understanding Errors". Closes the
// active Module 01 roadmap. Scope: errors as information + light SyntaxError/
// IndentationError naming only — no try/except, traceback, debugger, or
// later-lesson concepts.

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
const { understandingErrorsActivities } = loadModule("content/lessons/programming/understanding-errors-activities.ts");
const { understandingErrorsLessonContent } = loadModule("content/lessons/programming/understanding-errors.ts");
const localization = loadModule("content/lessons/programming/understanding-errors-localization.ts", {
  understandingErrorsActivities,
  getSharedCopy: sharedCopyModule.getSharedCopy,
});
const config = loadModule("content/lessons/programming/understanding-errors-config.ts", { LessonMasteryConfig: {} });

// === 1. Learning flow: WHY → INTUITION → SEE → MENTAL MODEL → PREDICT → TRY → FORMALIZE → ROBIN CHECK → CONNECT ===
test("activities carry the full beginner flow with one idea per screen", () => {
  assert.ok(understandingErrorsActivities.length >= 8, "needs a complete learning flow");
  assert.equal(new Set(understandingErrorsActivities.map((a) => a.id)).size, understandingErrorsActivities.length);
  const types = new Set(understandingErrorsActivities.map((a) => a.type));
  for (const type of ["intro", "explain", "example", "predict", "practice", "formalize", "robin_check", "connect"]) {
    assert.ok(types.has(type), `flow needs a ${type} activity`);
  }
  assert.equal(understandingErrorsActivities[0].id, "why", "WHY opens the flow");
  assert.equal(understandingErrorsActivities.at(-1).type, "connect", "CONNECT closes the flow");
  for (const activity of understandingErrorsActivities) {
    assert.ok(activity.concept, `${activity.id} needs a concept`);
    assert.ok(activity.content.length <= 3, `${activity.id} must stay small (1 idea per screen)`);
  }
});

// === 2. Scope: known shapes only — no try/except, traceback, debugger, or later lessons ===
test("the lesson stays inside beginner error scope", () => {
  const forbiddenCode = /\btry\b|\bexcept\b|exception|traceback|debugger|input\(|\bif\b|\belse\b|\bfor\b|\bwhile\b|\bdef\b|\breturn\b|f"|f'/i;
  const forbiddenProse = /\b(variable|data type|operator|condition|loop|function|concatenat|f-string|input\(|docstring|TODO|FIXME|try\/except|exception|debugger|traceback)\b/i;
  for (const activity of understandingErrorsActivities) {
    if (activity.code) assert.doesNotMatch(activity.code, forbiddenCode, `${activity.id} code must stay at print-level`);
    if (activity.type === "connect") continue; // connect names the roadmap titles
    for (const paragraph of activity.content) {
      assert.doesNotMatch(paragraph, forbiddenProse, `${activity.id} must not teach later-lesson concepts`);
    }
  }
  for (const example of understandingErrorsLessonContent.codeExamples) {
    assert.doesNotMatch(example.code, forbiddenCode, "supplement examples stay at print-level");
  }
});

// === 3. Tone: errors are information, never failure ===
test("the lesson frames errors as hints and shows the fix cycle", () => {
  const why = understandingErrorsActivities.find((a) => a.id === "why");
  assert.match(why.content.join(" "), /not a verdict|bukan vonis|not a failure|bagian normal/i, "errors must not read as failure");
  const cycle = understandingErrorsActivities.filter((a) => /run →.*error|run lagi|run again|read the error/i.test(a.content.join(" ")));
  assert.ok(cycle.length >= 2, "the Run → Error → Read → Fix → Run again cycle must recur");
  // Light naming of the two error types.
  assert.match(understandingErrorsLessonContent.academicExplanation.join(" "), /SyntaxError/);
  assert.match(understandingErrorsLessonContent.academicExplanation.join(" "), /IndentationError/);
  // The three message parts are taught.
  assert.match(understandingErrorsActivities.find((a) => a.id === "error-anatomy").content.join(" "), /location|lokasi/i);
});

// === 4. Deterministic grading ===
test("predict activities have well-formed options, answers, and misconceptions", () => {
  const predicts = understandingErrorsActivities.filter((a) => a.type === "predict");
  assert.ok(predicts.length >= 3, "needs Runs-or-Error twice plus Spot the Bug");
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

test("the TRY fix checker accepts the repaired line and rejects broken shapes", () => {
  const practice = understandingErrorsActivities.find((a) => a.type === "practice");
  assert.ok(practice, "needs a fix-it practice activity");
  assert.match(practice.code, /prnt\(/, "the broken line must be shown to the learner");
  assert.equal(typeof practice.checkAnswer, "function");
  assert.equal(practice.checkAnswer('print("Halo, dunia!")'), true);
  assert.equal(practice.checkAnswer("print('Halo, dunia!')"), true);
  assert.equal(practice.checkAnswer('prnt("Halo, dunia!")'), false, "the original bug must still fail");
  assert.equal(practice.checkAnswer('Print("Halo, dunia!")'), false);
  assert.equal(practice.checkAnswer('print("Halo dunia!")'), false);
  assert.equal(practice.checkAnswer(""), false);
});

// === 5. Localization changes prose only; grading identity stays shared ===
test("ID and EN activities share ids, code, and answers while changing prose", () => {
  const id = localization.getUnderstandingErrorsActivities("id");
  const en = localization.getUnderstandingErrorsActivities("en");
  assert.equal(id.length, en.length);
  for (let index = 0; index < id.length; index++) {
    for (const key of ["id", "type", "concept", "code", "correctAnswer"]) assert.equal(id[index][key], en[index][key]);
    assert.deepEqual(id[index].options, en[index].options);
    assert.notEqual(id[index].title, en[index].title, "ID title must be localized");
  }
  const robinStep = id.find((a) => a.type === "robin_check");
  assert.deepEqual(Array.from(robinStep.content), [localization.understandingErrorsCopy.id.prompt]);
});

test("content localization preserves structure and grading fields", () => {
  const id = localization.localizeUnderstandingErrorsContent(understandingErrorsLessonContent, "id");
  assert.equal(id.slug, understandingErrorsLessonContent.slug);
  assert.equal(id.academicExplanation.length, understandingErrorsLessonContent.academicExplanation.length);
  assert.equal(id.keyTerms.length, understandingErrorsLessonContent.keyTerms.length);
  assert.equal(id.commonMistakes.length, understandingErrorsLessonContent.commonMistakes.length);
  assert.equal(id.quickChecks.length, understandingErrorsLessonContent.quickChecks.length);
  for (let index = 0; index < id.quickChecks.length; index++) {
    assert.deepEqual(id.quickChecks[index].options, understandingErrorsLessonContent.quickChecks[index].options);
    assert.equal(id.quickChecks[index].answer, understandingErrorsLessonContent.quickChecks[index].answer);
    assert.notEqual(id.quickChecks[index].question, understandingErrorsLessonContent.quickChecks[index].question);
  }
});

// === 6. Mastery (3 concepts) and relevance vocabulary ===
test("every mastery concept receives evidence and connect stays out", () => {
  assert.ok(config.understandingErrorsMasteryConfig.concepts.length >= 2 && config.understandingErrorsMasteryConfig.concepts.length <= 3, "mastery stays at 2-3 concepts");
  const evidence = new Set();
  for (const activity of understandingErrorsActivities) {
    const mapped = config.understandingErrorsMasteryConfig.activityConceptToMastery(activity.concept);
    if (mapped) evidence.add(mapped);
  }
  for (const concept of config.understandingErrorsMasteryConfig.robinCheckSignalToEvidence("strong").concepts) evidence.add(concept);
  for (const concept of config.understandingErrorsMasteryConfig.concepts) {
    assert.ok(evidence.has(concept), `${concept} has no evidence source`);
  }
  assert.equal(config.understandingErrorsMasteryConfig.activityConceptToMastery("connections"), null, "connect must not emit mastery evidence");
});

test("relevance outputs never escape the mastery vocabulary", () => {
  const allowed = new Set(config.understandingErrorsMasteryConfig.concepts);
  for (const concept of config.understandingErrorsRelevance.checkConcepts()) assert.ok(allowed.has(concept));
  for (const message of ["kenapa ada error", "SyntaxError itu apa", "cara perbaiki code", "cuaca hari ini"]) {
    for (const concept of config.understandingErrorsRelevance.chatConcepts(message)) {
      assert.ok(allowed.has(concept), `${concept} escapes mastery vocabulary`);
    }
  }
});

// === 7. Course and registry integration, roadmap order, progress safety ===
test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["understanding-errors",\s*understandingErrorsDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["understanding-errors",\s*\{/);
  const loader = read("lib/lessons/understanding-errors.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-fundamentals"/);
  assert.match(loader, /"understanding-errors"/);
  assert.equal(existsSync(new URL("content/lessons/programming/understanding-errors-instructions.ts", root)), true, "needs Robin Check rubrics");
});

test("the lesson closes the roadmap as position 06 with placeholders parked", () => {
  const courses = loadModule("data/courses.ts");
  const list = courses.implementedProgrammingLessonSlugs;
  assert.deepEqual(Array.from(list).slice(0, 6), [
    "what-is-programming", "hello-python", "print-output", "syntax-indentation", "comments", "understanding-errors",
  ]);
  assert.equal(list[6], "variables", "existing lesson order must survive");
  assert.equal(courses.defaultCurrentLesson.lessonSlug, "what-is-programming", "default entry point unchanged");
  // The manifest and baseline seed mirror the roadmap: 06 = understanding-errors,
  // placeholders parked at 7-8 (never deleted, positions only).
  const manifest = loadModule("data/curriculum-manifest.ts");
  const fundamentals = manifest.currentCurriculumManifest.semesters[0].courses
    .find((course) => course.slug === "programming").modules
    .find((module) => module.slug === "programming-fundamentals");
  const byslug = Object.fromEntries(fundamentals.lessons.map((lesson) => [lesson.slug, lesson.position]));
  assert.equal(byslug["understanding-errors"], 6);
  assert.equal(byslug["programming-languages"], 7);
  assert.equal(byslug["syntax-vs-semantics"], 8);
  const seed = read("database/phase4-seed.sql");
  assert.match(seed, /\('programming-fundamentals', 'understanding-errors', 'Understanding Errors', '[^']+', 12, 6\)/);
  const migration = read("database/phase20-1f-understanding-errors.sql");
  assert.match(migration, /'understanding-errors'/);
  assert.match(migration, /on conflict \(module_id, slug\) do update/);
  assert.doesNotMatch(migration, /delete from/i, "migration must never delete data");
});

test("connect points the finished module toward Variables", () => {
  const connect = understandingErrorsActivities.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Variables/, "connect must name the next module's entry lesson");
});

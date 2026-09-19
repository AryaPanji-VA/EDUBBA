import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.1B — beginner onboarding lesson "Kenalan dengan Python" (hello-python).
// Same architecture contract as what-is-programming: registered, displayable,
// deterministic grading, Indonesian-first, integrated after what-is-programming.

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
const { helloPythonActivities } = loadModule("content/lessons/programming/hello-python-activities.ts");
const { helloPythonLessonContent } = loadModule("content/lessons/programming/hello-python.ts");
const localization = loadModule("content/lessons/programming/hello-python-localization.ts", {
  helloPythonActivities,
  getSharedCopy: sharedCopyModule.getSharedCopy,
});
const config = loadModule("content/lessons/programming/hello-python-config.ts", { LessonMasteryConfig: {} });

// === 1. Learning flow: WHY → INTUITION → SEE → MENTAL MODEL → PREDICT → TRY → FORMALIZE → ROBIN CHECK → CONNECT ===
test("activities carry the full beginner flow with one idea per screen", () => {
  assert.ok(helloPythonActivities.length >= 8, "needs a complete learning flow");
  assert.equal(new Set(helloPythonActivities.map((a) => a.id)).size, helloPythonActivities.length);
  const types = new Set(helloPythonActivities.map((a) => a.type));
  for (const type of ["intro", "explain", "example", "predict", "practice", "formalize", "robin_check", "connect"]) {
    assert.ok(types.has(type), `flow needs a ${type} activity`);
  }
  assert.equal(helloPythonActivities[0].id, "why", "WHY opens the flow");
  assert.equal(helloPythonActivities.at(-1).type, "connect", "CONNECT closes the flow");
  for (const activity of helloPythonActivities) {
    assert.ok(activity.concept, `${activity.id} needs a concept`);
    assert.ok(activity.content.length <= 3, `${activity.id} must stay small (1 idea per screen)`);
  }
});

// === 2. Scope: no variables/types/operators/conditionals/loops/functions required ===
test("the lesson stays inside print-level scope and no later-lesson concepts", () => {
  const forbidden = /\b(variable|int|str\(|input\(|if |elif|else|for |while |def |return|\+ |- |\* )/;
  for (const activity of helloPythonActivities) {
    if (activity.code && activity.id !== "try") {
      assert.doesNotMatch(activity.code, forbidden, `${activity.id} code must stay at print-level`);
    }
    for (const paragraph of activity.content) {
      assert.doesNotMatch(paragraph, /\b(variable|data type|loop|function)\b/i, `${activity.id} must not teach later-lesson concepts`);
    }
  }
  // print() is introduced lightly — the connect must defer its details to the next lesson.
  const connect = helloPythonActivities.find((a) => a.type === "connect");
  assert.match(connect.content[0], /print\(\) & Output|print\(\) dan output/i, "connect must name the print/output lesson");
  assert.match(connect.content[1], /detail|bedah|next lesson/i, "connect must defer print details");
});

// === 3. Deterministic grading ===
test("predict activities have well-formed options, answers, and misconceptions", () => {
  const predicts = helloPythonActivities.filter((a) => a.type === "predict");
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

test("the TRY checker accepts both quote forms and rejects wrong lines", () => {
  const practice = helloPythonActivities.find((a) => a.type === "practice");
  assert.ok(practice, "needs a practice activity");
  assert.equal(typeof practice.checkAnswer, "function");
  assert.equal(practice.checkAnswer('print("Halo, dunia!")'), true);
  assert.equal(practice.checkAnswer("print('Halo, dunia!')"), true);
  assert.equal(practice.checkAnswer('  print( "Halo, dunia!" )  '), true);
  assert.equal(practice.checkAnswer('print("Halo, dunia!")  '), true);
  assert.equal(practice.checkAnswer('print("halo, dunia!")'), false, "text is case-sensitive");
  assert.equal(practice.checkAnswer('print("Halo dunia!")'), false);
  assert.equal(practice.checkAnswer('"Halo, dunia!"'), false, "missing print");
  assert.equal(practice.checkAnswer('print "Halo, dunia!"'), false, "parentheses required");
  assert.equal(practice.checkAnswer(""), false);
});

// === 4. Localization changes prose only; grading identity stays shared ===
test("ID and EN activities share ids, code, and answers while changing prose", () => {
  const id = localization.getHelloPythonActivities("id");
  const en = localization.getHelloPythonActivities("en");
  assert.equal(id.length, en.length);
  for (let index = 0; index < id.length; index++) {
    for (const key of ["id", "type", "concept", "code", "correctAnswer"]) assert.equal(id[index][key], en[index][key]);
    assert.deepEqual(id[index].options, en[index].options);
    assert.notEqual(id[index].title, en[index].title, "ID title must be localized");
  }
  const robinStep = id.find((a) => a.type === "robin_check");
  assert.deepEqual(Array.from(robinStep.content), [localization.helloPythonCopy.id.prompt]);
});

test("content localization preserves structure and grading fields", () => {
  const id = localization.localizeHelloPythonContent(helloPythonLessonContent, "id");
  assert.equal(id.slug, helloPythonLessonContent.slug);
  assert.equal(id.academicExplanation.length, helloPythonLessonContent.academicExplanation.length);
  assert.equal(id.keyTerms.length, helloPythonLessonContent.keyTerms.length);
  assert.equal(id.commonMistakes.length, helloPythonLessonContent.commonMistakes.length);
  assert.equal(id.quickChecks.length, helloPythonLessonContent.quickChecks.length);
  for (let index = 0; index < id.quickChecks.length; index++) {
    assert.deepEqual(id.quickChecks[index].options, helloPythonLessonContent.quickChecks[index].options);
    assert.equal(id.quickChecks[index].answer, helloPythonLessonContent.quickChecks[index].answer);
    assert.notEqual(id.quickChecks[index].question, helloPythonLessonContent.quickChecks[index].question);
  }
});

// === 5. Mastery (2–3 concepts) and relevance vocabulary ===
test("every mastery concept receives evidence and connect stays out", () => {
  assert.ok(config.helloPythonMasteryConfig.concepts.length >= 2 && config.helloPythonMasteryConfig.concepts.length <= 3, "mastery stays at 2-3 concepts");
  const evidence = new Set();
  for (const activity of helloPythonActivities) {
    const mapped = config.helloPythonMasteryConfig.activityConceptToMastery(activity.concept);
    if (mapped) evidence.add(mapped);
  }
  for (const concept of config.helloPythonMasteryConfig.robinCheckSignalToEvidence("strong").concepts) evidence.add(concept);
  for (const concept of config.helloPythonMasteryConfig.concepts) {
    assert.ok(evidence.has(concept), `${concept} has no evidence source`);
  }
  assert.equal(config.helloPythonMasteryConfig.activityConceptToMastery("connections"), null, "connect must not emit mastery evidence");
});

test("relevance outputs never escape the mastery vocabulary", () => {
  const allowed = new Set(config.helloPythonMasteryConfig.concepts);
  for (const concept of config.helloPythonRelevance.checkConcepts()) assert.ok(allowed.has(concept));
  for (const message of ["apa itu python", "print dan output", "urutan eksekusi code", "resep masak"]) {
    for (const concept of config.helloPythonRelevance.chatConcepts(message)) {
      assert.ok(allowed.has(concept), `${concept} escapes mastery vocabulary`);
    }
  }
});

// === 6. Course and registry integration, in order, without breaking progress ===
test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["hello-python",\s*helloPythonDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["hello-python",\s*\{/);
  const loader = read("lib/lessons/hello-python.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-fundamentals"/);
  assert.match(loader, /"hello-python"/);
  assert.equal(existsSync(new URL("content/lessons/programming/hello-python-instructions.ts", root)), true, "needs Robin Check rubrics");
});

test("the lesson sits right after what-is-programming in the beginner order", () => {
  const courses = loadModule("data/courses.ts");
  const list = courses.implementedProgrammingLessonSlugs;
  assert.equal(list[0], "what-is-programming");
  assert.equal(list[1], "hello-python");
  // Phase 20.1C-20.1F inserted print-output, syntax-indentation, comments,
  // and understanding-errors after hello-python; the rest survives.
  assert.equal(list[2], "print-output");
  assert.equal(list[3], "syntax-indentation");
  assert.equal(list[4], "comments");
  assert.equal(list[5], "understanding-errors");
  assert.equal(list[6], "variables", "existing lesson order must survive");
  assert.equal(courses.defaultCurrentLesson.lessonSlug, "what-is-programming", "default entry point unchanged");
  // The manifest and baseline seed mirror the same beginner position.
  const manifest = loadModule("data/curriculum-manifest.ts");
  const fundamentals = manifest.currentCurriculumManifest.semesters[0].courses
    .find((course) => course.slug === "programming").modules
    .find((module) => module.slug === "programming-fundamentals");
  assert.equal(fundamentals.lessons[1].slug, "hello-python");
  assert.equal(fundamentals.lessons[1].position, 2);
  const seed = read("database/phase4-seed.sql");
  assert.match(seed, /\('programming-fundamentals', 'hello-python', 'Kenalan dengan Python', '([^']+)', 12, 2\)/);
  const migration = read("database/phase20-1b-hello-python.sql");
  assert.match(migration, /'hello-python'/);
  assert.match(migration, /on conflict \(module_id, slug\) do update/);
});

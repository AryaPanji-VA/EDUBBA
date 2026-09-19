import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.1C — beginner onboarding lesson "Output with print()" (print-output).
// Same architecture contract as 20.1A/20.1B; scope stays at print-level only.

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
const { printOutputActivities } = loadModule("content/lessons/programming/print-output-activities.ts");
const { printOutputLessonContent } = loadModule("content/lessons/programming/print-output.ts");
const localization = loadModule("content/lessons/programming/print-output-localization.ts", {
  printOutputActivities,
  getSharedCopy: sharedCopyModule.getSharedCopy,
});
const config = loadModule("content/lessons/programming/print-output-config.ts", { LessonMasteryConfig: {} });

// === 1. Learning flow: WHY → INTUITION → SEE → MENTAL MODEL → PREDICT → TRY → FORMALIZE → ROBIN CHECK → CONNECT ===
test("activities carry the full beginner flow with one idea per screen", () => {
  assert.ok(printOutputActivities.length >= 8, "needs a complete learning flow");
  assert.equal(new Set(printOutputActivities.map((a) => a.id)).size, printOutputActivities.length);
  const types = new Set(printOutputActivities.map((a) => a.type));
  for (const type of ["intro", "explain", "example", "predict", "practice", "formalize", "robin_check", "connect"]) {
    assert.ok(types.has(type), `flow needs a ${type} activity`);
  }
  assert.equal(printOutputActivities[0].id, "why", "WHY opens the flow");
  assert.equal(printOutputActivities.at(-1).type, "connect", "CONNECT closes the flow");
  for (const activity of printOutputActivities) {
    assert.ok(activity.concept, `${activity.id} needs a concept`);
    assert.ok(activity.content.length <= 3, `${activity.id} must stay small (1 idea per screen)`);
  }
});

// === 2. Scope: print-level only — no variables, input, operators, comments, or advanced print ===
test("the lesson stays inside print-level scope", () => {
  const forbiddenCode = /#|f"|f'|input\(|\+|sep\s*=|end\s*=/;
  const forbiddenProse = /\b(variable|data type|operator|condition|loop|function|concatenat|f-string|escape|comment)\b/i;
  for (const activity of printOutputActivities) {
    if (activity.code) assert.doesNotMatch(activity.code, forbiddenCode, `${activity.id} code must stay at print-level`);
    for (const paragraph of activity.content) {
      assert.doesNotMatch(paragraph, forbiddenProse, `${activity.id} must not teach later-lesson concepts`);
    }
  }
  for (const example of printOutputLessonContent.codeExamples) {
    assert.doesNotMatch(example.code, forbiddenCode, "supplement examples stay at print-level");
  }
});

// === 3. CODE vs OUTPUT is visually separated by the output: convention ===
test("code blocks separate code from output with an explicit output: label", () => {
  const withOutput = printOutputActivities.filter((a) => a.code && /output:/i.test(a.code));
  assert.ok(withOutput.length >= 2, "the flow must show code and output as distinct sections");
  for (const example of printOutputLessonContent.codeExamples) {
    assert.match(example.code, /output:\n/i, `${example.title} must show its output`);
  }
  // The canonical example from the brief appears in the lesson.
  assert.ok(printOutputActivities.some((a) => a.code?.includes('print("Hello!")')), "print(\"Hello!\") is the core example");
  assert.ok(printOutputLessonContent.codeExamples.some((e) => e.code.includes('print("Welcome to Python")')), "two-print example is present");
});

// === 4. Deterministic grading ===
test("predict activities have well-formed options, answers, and misconceptions", () => {
  const predicts = printOutputActivities.filter((a) => a.type === "predict");
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

test("predict-order steps up from lesson 02 with three print instructions", () => {
  const order = printOutputActivities.find((a) => a.id === "predict-order");
  assert.ok(order, "predict-order must exist");
  assert.equal((order.code.match(/print\(/g) || []).length, 3, "three print() lines differentiate it from lesson 02");
  assert.match(order.correctAnswer, /each on its own line/);
  assert.ok(Object.keys(order.misconceptionsByAnswer ?? {}).every((key) => order.options.includes(key)));
});

test("the TRY checker accepts both quote forms and rejects wrong lines", () => {
  const practice = printOutputActivities.find((a) => a.type === "practice");
  assert.ok(practice, "needs a practice activity");
  assert.equal(typeof practice.checkAnswer, "function");
  assert.equal(practice.checkAnswer('print("Hello!")'), true);
  assert.equal(practice.checkAnswer("print('Hello!')"), true);
  assert.equal(practice.checkAnswer('  print( "Hello!" )  '), true);
  assert.equal(practice.checkAnswer('print("hello!")'), false, "text is case-sensitive");
  assert.equal(practice.checkAnswer('print("Hello")'), false);
  assert.equal(practice.checkAnswer('"Hello!"'), false, "missing print");
  assert.equal(practice.checkAnswer('print "Hello!"'), false, "parentheses required");
  assert.equal(practice.checkAnswer(""), false);
});

// === 5. Localization changes prose only; grading identity stays shared ===
test("ID and EN activities share ids, code, and answers while changing prose", () => {
  const id = localization.getPrintOutputActivities("id");
  const en = localization.getPrintOutputActivities("en");
  assert.equal(id.length, en.length);
  for (let index = 0; index < id.length; index++) {
    for (const key of ["id", "type", "concept", "code", "correctAnswer"]) assert.equal(id[index][key], en[index][key]);
    assert.deepEqual(id[index].options, en[index].options);
    assert.notEqual(id[index].title, en[index].title, "ID title must be localized");
  }
  const robinStep = id.find((a) => a.type === "robin_check");
  assert.deepEqual(Array.from(robinStep.content), [localization.printOutputCopy.id.prompt]);
});

test("content localization preserves structure and grading fields", () => {
  const id = localization.localizePrintOutputContent(printOutputLessonContent, "id");
  assert.equal(id.slug, printOutputLessonContent.slug);
  assert.equal(id.academicExplanation.length, printOutputLessonContent.academicExplanation.length);
  assert.equal(id.keyTerms.length, printOutputLessonContent.keyTerms.length);
  assert.equal(id.commonMistakes.length, printOutputLessonContent.commonMistakes.length);
  assert.equal(id.quickChecks.length, printOutputLessonContent.quickChecks.length);
  for (let index = 0; index < id.quickChecks.length; index++) {
    assert.deepEqual(id.quickChecks[index].options, printOutputLessonContent.quickChecks[index].options);
    assert.equal(id.quickChecks[index].answer, printOutputLessonContent.quickChecks[index].answer);
    assert.notEqual(id.quickChecks[index].question, printOutputLessonContent.quickChecks[index].question);
  }
});

// === 6. Mastery (3 concepts) and relevance vocabulary ===
test("every mastery concept receives evidence and connect stays out", () => {
  assert.ok(config.printOutputMasteryConfig.concepts.length >= 2 && config.printOutputMasteryConfig.concepts.length <= 3, "mastery stays at 2-3 concepts");
  const evidence = new Set();
  for (const activity of printOutputActivities) {
    const mapped = config.printOutputMasteryConfig.activityConceptToMastery(activity.concept);
    if (mapped) evidence.add(mapped);
  }
  for (const concept of config.printOutputMasteryConfig.robinCheckSignalToEvidence("strong").concepts) evidence.add(concept);
  for (const concept of config.printOutputMasteryConfig.concepts) {
    assert.ok(evidence.has(concept), `${concept} has no evidence source`);
  }
  assert.equal(config.printOutputMasteryConfig.activityConceptToMastery("connections"), null, "connect must not emit mastery evidence");
});

test("relevance outputs never escape the mastery vocabulary", () => {
  const allowed = new Set(config.printOutputMasteryConfig.concepts);
  for (const concept of config.printOutputRelevance.checkConcepts()) assert.ok(allowed.has(concept));
  for (const message of ["apa itu output", "cara pakai print", "kenapa urutannya begini", "cuaca hari ini"]) {
    for (const concept of config.printOutputRelevance.chatConcepts(message)) {
      assert.ok(allowed.has(concept), `${concept} escapes mastery vocabulary`);
    }
  }
});

// === 7. Course and registry integration, in order, without breaking progress ===
test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["print-output",\s*printOutputDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["print-output",\s*\{/);
  const loader = read("lib/lessons/print-output.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-fundamentals"/);
  assert.match(loader, /"print-output"/);
  assert.equal(existsSync(new URL("content/lessons/programming/print-output-instructions.ts", root)), true, "needs Robin Check rubrics");
});

test("the lesson sits right after hello-python in the beginner order", () => {
  const courses = loadModule("data/courses.ts");
  const list = courses.implementedProgrammingLessonSlugs;
  assert.deepEqual(Array.from(list).slice(0, 6), ["what-is-programming", "hello-python", "print-output", "syntax-indentation", "comments", "understanding-errors"]);
  assert.equal(list[6], "variables", "existing lesson order must survive");
  assert.equal(courses.defaultCurrentLesson.lessonSlug, "what-is-programming", "default entry point unchanged");
  // The manifest and baseline seed mirror the same beginner position.
  const manifest = loadModule("data/curriculum-manifest.ts");
  const fundamentals = manifest.currentCurriculumManifest.semesters[0].courses
    .find((course) => course.slug === "programming").modules
    .find((module) => module.slug === "programming-fundamentals");
  assert.equal(fundamentals.lessons[2].slug, "print-output");
  assert.equal(fundamentals.lessons[2].position, 3);
  const seed = read("database/phase4-seed.sql");
  assert.match(seed, /\('programming-fundamentals', 'print-output', 'Output with print\(\)', '([^']+)', 12, 3\)/);
  const migration = read("database/phase20-1c-print-output.sql");
  assert.match(migration, /'print-output'/);
  assert.match(migration, /on conflict \(module_id, slug\) do update/);
});

// === 8. Connect points to the next planned lesson ===
test("connect names the next lesson in the beginner path", () => {
  const connect = printOutputActivities.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Syntax & Indentation/, "connect must name the next lesson");
});

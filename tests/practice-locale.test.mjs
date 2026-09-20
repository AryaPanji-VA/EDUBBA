import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.8 follow-up — deterministic Practice content is locale-aware.
// Guided exercises (English-authored) gain Indonesian variants; Thinking
// activities (Indonesian-authored) gain English variants. Identity, grading
// data, and code tokens never change, and no AI is involved.

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

const exerciseSets = Object.fromEntries([
  ["variables", "variablesPracticeExercises"],
  ["data-types", "dataTypesPracticeExercises"],
  ["operators", "operatorsPracticeExercises"],
  ["conditionals", "conditionalsPracticeExercises"],
  ["loops", "loopsPracticeExercises"],
  ["functions", "functionsPracticeExercises"],
].map(([slug, exportName]) => [slug, loadModule(`content/practice/python/${slug}-exercises.ts`)[exportName]]));
const allExercises = Object.values(exerciseSets).flat();

const thinkingActivities = loadModule("content/practice/thinking/activities.ts").thinkingActivities;
const practiceLocalization = loadModule("content/practice/python/localization.ts");
const thinkingLocalization = loadModule("content/practice/thinking/localization.ts");
const checker = loadModule("lib/practice/check.ts");

// === 1. Full coverage: every deterministic item has both language variants ===
test("every guided exercise has an Indonesian override with prompt, hint, and explanation", () => {
  for (const exercise of allExercises) {
    const localized = practiceLocalization.localizePracticeExercises([exercise], "id")[0];
    assert.notEqual(localized.hint, exercise.hint, `${exercise.id} hint has an Indonesian variant`);
    assert.notEqual(localized.prompt, exercise.prompt, `${exercise.id} prompt has an Indonesian variant`);
    assert.notEqual(localized.explanation, exercise.explanation, `${exercise.id} explanation has an Indonesian variant`);
    assert.ok(localized.hint.trim() && localized.prompt.trim() && localized.explanation.trim());
  }
});

test("every thinking activity has an English override with hint, prompt, and explanation", () => {
  for (const activity of thinkingActivities) {
    const localized = thinkingLocalization.localizeThinkingActivities([activity], "en")[0];
    assert.notEqual(localized.hint, activity.hint, `${activity.id} hint has an English variant`);
    assert.notEqual(localized.prompt, activity.prompt, `${activity.id} prompt has an English variant`);
    assert.notEqual(localized.explanation, activity.explanation, `${activity.id} explanation has an English variant`);
  }
});

// === 2. Locale selection: native language returns the source unchanged ===
test("the authored language returns the same content reference", () => {
  for (const exercises of Object.values(exerciseSets)) {
    assert.equal(practiceLocalization.localizePracticeExercises(exercises, "en"), exercises);
  }
  assert.equal(thinkingLocalization.localizeThinkingActivities(thinkingActivities, "id"), thinkingActivities);
});

// === 3. Identity and grading data survive localization ===
test("localization never changes ids, code, outputs, patterns, or mastery keys", () => {
  for (const exercise of allExercises) {
    const localized = practiceLocalization.localizePracticeExercises([exercise], "id")[0];
    assert.equal(localized.id, exercise.id);
    assert.equal(localized.lessonSlug, exercise.lessonSlug);
    assert.equal(localized.type, exercise.type);
    assert.equal(localized.language, exercise.language);
    assert.deepEqual(localized.masteryConcepts, exercise.masteryConcepts);
    assert.equal(localized.code, exercise.code);
    assert.equal(localized.expectedOutput, exercise.expectedOutput);
    assert.equal(localized.starterCode, exercise.starterCode);
    assert.equal(localized.sampleSolution, exercise.sampleSolution);
    assert.deepEqual(localized.requiredPatterns?.map((p) => p.source), exercise.requiredPatterns?.map((p) => p.source));
    assert.deepEqual(localized.misconceptionPatterns?.map((p) => p.source), exercise.misconceptionPatterns?.map((p) => p.source));
    assert.equal(localized.misconceptionOutputs?.length, exercise.misconceptionOutputs?.length);
  }
  for (const activity of thinkingActivities) {
    const localized = thinkingLocalization.localizeThinkingActivities([activity], "en")[0];
    assert.equal(localized.id, activity.id);
    assert.equal(localized.type, activity.type);
    assert.deepEqual(localized.masteryEvidence, activity.masteryEvidence);
    assert.equal(localized.interaction.kind, activity.interaction.kind);
    if (activity.interaction.kind === "single-choice") {
      assert.equal(localized.interaction.correctOptionId, activity.interaction.correctOptionId);
      assert.deepEqual(localized.interaction.options.map((o) => o.id), activity.interaction.options.map((o) => o.id));
    }
    if (activity.interaction.kind === "ordering") {
      assert.deepEqual(localized.interaction.correctOrder, activity.interaction.correctOrder);
    }
  }
});

// === 4. Deterministic grading is identical in both locales ===
test("grading results match across locales; only prose changes", () => {
  const checks = [
    ["variables", "variables-predict-2", "5"],
    ["loops", "loops-predict-1", "0\n1\n2"],
  ];
  for (const [setName, id, answer] of checks) {
    const exercise = exerciseSets[setName].find((item) => item.id === id);
    const localized = practiceLocalization.localizePracticeExercises([exercise], "id")[0];
    const en = checker.checkPracticeExercise(exercise, answer);
    const idResult = checker.checkPracticeExercise(localized, answer, "id");
    assert.equal(idResult.status, en.status);
    assert.equal(idResult.misconception, en.misconception);
    assert.notEqual(idResult.explanation, en.explanation, "the explanation prose follows the locale");
  }
  // Partial credit: the templated string exists in both languages.
  const write = exerciseSets.loops.find((item) => item.id === "loops-write-1");
  const partialAnswer = "for i in range(1, 6):";
  const enPartial = checker.checkPracticeExercise(write, partialAnswer, "en");
  const idPartial = checker.checkPracticeExercise(write, partialAnswer, "id");
  assert.equal(enPartial.status, "partial");
  assert.match(enPartial.explanation, /Still missing/);
  assert.match(idPartial.explanation, /Yang masih kurang/);
});

// === 5. Track metadata is localized without moving topics ===
test("the practice track keeps its topics while titles follow the locale", () => {
  const track = loadModule("lib/practice/registry.ts", {
    variablesPracticeExercises: exerciseSets.variables,
    dataTypesPracticeExercises: exerciseSets["data-types"],
    operatorsPracticeExercises: exerciseSets.operators,
    conditionalsPracticeExercises: exerciseSets.conditionals,
    loopsPracticeExercises: exerciseSets.loops,
    functionsPracticeExercises: exerciseSets.functions,
  }).getPracticeTrack("python");
  const localized = practiceLocalization.localizePracticeTrack(track, "id");
  assert.ok(localized, "the localized track resolves");
  assert.deepEqual(localized.topics.map((topic) => topic.lessonSlug), track.topics.map((topic) => topic.lessonSlug));
  assert.deepEqual(localized.topics.map((topic) => topic.exercises.map((e) => e.id)), track.topics.map((topic) => topic.exercises.map((e) => e.id)));
  assert.notEqual(localized.title, track.title, "the track title is localized");
  assert.notEqual(localized.description, track.description, "the track description is localized");
  for (const topic of localized.topics) {
    assert.ok(topic.title.trim(), `${topic.lessonSlug} keeps a topic title`);
  }
});

// === 6. The deterministic hint needs no AI anywhere on its path ===
test("hint rendering is offline content selection, and clients send the locale per request", () => {
  const lab = read("components/practice-lab.tsx");
  assert.match(lab, /\{exercise\.hint\}/, "the hint renders straight from localized content");
  assert.match(lab, /localizePracticeTrack\(rawTrack, language\)/);
  assert.match(lab, /getActiveLessonLanguage\(\)/, "the locale comes from the canonical switcher source");
  assert.match(lab, /body: JSON\.stringify\(\{ exerciseId: exercise\.id, answer: submission, attemptId, language \}\)/);
  const thinking = read("components/thinking-lab.tsx");
  assert.match(thinking, /\{activity\.hint\}/);
  assert.match(thinking, /localizeThinkingActivities\(rawActivities, language\)/);
  assert.match(thinking, /attemptId, language \}/);
  // Server check paths localize before grading and keep the bounded fallback.
  const checkRoute = read("app/api/practice/check/route.ts");
  assert.match(checkRoute, /localizePracticeExercises\(\[exercise\], parseRobinLocale\(language\)\)/);
  const thinkingRoute = read("app/api/practice/thinking/check/route.ts");
  assert.match(thinkingRoute, /localizeThinkingActivities\(\[activity\], parseRobinLocale\(language\)\)/);
  // The Robin assistance context is localized by the request locale too.
  const assistRoute = read("app/api/practice/robin/route.ts");
  assert.match(assistRoute, /localizePracticeExercises\(\[exercise\], assist\.language\)/);
  assert.match(assistRoute, /localizeThinkingActivities\(\[activity\], assist\.language\)/);
});

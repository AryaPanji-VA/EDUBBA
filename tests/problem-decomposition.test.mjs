import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.7 — Module 07 lesson "Problem Decomposition"
// (problem-decomposition, programming course): input/process/output thinking,
// ordered steps mapped to known concepts, no new syntax.

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

const content = loadModule("content/lessons/programming/problem-decomposition.ts").problemDecompositionLessonContent;
const activities = loadModule("content/lessons/programming/problem-decomposition-activities.ts").problemDecompositionActivities;
const config = loadModule("content/lessons/programming/problem-decomposition-config.ts", {
  "@/lib/mastery/types": {},
});
const checkRubric = read("content/lessons/programming/problem-decomposition-instructions.ts");

// === 1. Content ownership: decompose a problem into ordered known steps ===
test("Problem Decomposition content is complete across every LessonContent field", () => {
  assert.equal(content.slug, "problem-decomposition");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  for (const term of ["Input", "Process", "Output"]) {
    assert.ok(content.keyTerms.some((item) => item.term === term), `${term} must be a key term`);
  }
  assert.ok(content.commonMistakes.length >= 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  const text = JSON.stringify(content);
  // The concrete two-scores task drives the lesson.
  assert.match(text, /70/);
  assert.match(text, /average|rata/i);
  assert.match(text, /Pass/);
  assert.match(text, /Try Again/);
  // Known concepts are mapped to steps — no new syntax dependency.
  assert.match(text, /int\(|input\(|print\(/);
  for (const banned of ["def ", "UML", "design pattern", "recursion", "complexity", "O\\(n\\)"]) {
    assert.ok(!new RegExp(banned, "i").test(text), `${banned} must not appear`);
  }
});

// === 2. TRY is a decomposition exercise: ordered comment steps, not final code ===
test("the TRY checker requires an ordered seven-step comment plan", () => {
  const tryActivity = activities.find((a) => a.id === "try");
  assert.ok(tryActivity, "TRY activity exists");
  const check = tryActivity.checkAnswer;
  assert.equal(check("# get the first score\n# get the second score\n# convert both scores to numbers\n# calculate the average\n# compare the average with 70\n# choose the result\n# print the result"), true, "seven ordered comment steps accepted");
  assert.equal(check("# ambil nilai pertama\n# ambil nilai kedua\n#\n# ubah jadi angka\n# hitung rata-rata\n# bandingin dengan 70\n# print hasil"), true, "any wording, shape only");
  assert.equal(check("# step one\n# step two\n# step three\n# step four\n# step five\n# step six"), false, "fewer than seven steps rejected");
  assert.equal(check("# one\n# two\n# three\n# four\n# five\n# six\n# seven\n# eight"), false, "more than seven steps rejected");
  assert.equal(check("first = input()\n# two\n# three\n# four\n# five\n# six\n# seven"), false, "a code line instead of a comment rejected");
  assert.equal(check("get the first score\n# get the second score\n# convert both scores to numbers\n# calculate the average\n# compare the average with 70\n# choose the result\n# print the result"), false, "uncommented step rejected");
});

// === 3. Mastery and relevance stay inside the lesson-owned vocabulary ===
test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const mastery = config.problemDecompositionMasteryConfig;
  const allowed = mastery.concepts;
  for (const concept of ["identify_input_output", "step_decomposition", "concept_mapping"]) {
    assert.ok(allowed.includes(concept), `${concept} must exist`);
  }
  for (const activity of activities) {
    if (activity.concept === "connections") continue;
    const mapped = mastery.activityConceptToMastery(activity.concept);
    assert.ok(mapped && allowed.includes(mapped), `activity concept ${activity.concept} must map to a lesson concept`);
  }
  for (const signal of ["strong", "developing", "shaky"]) {
    const evidence = mastery.robinCheckSignalToEvidence(signal);
    assert.ok(evidence.concepts.every((concept) => allowed.includes(concept)));
  }
});

test("relevance outputs never escape the mastery vocabulary", () => {
  const mastery = config.problemDecompositionMasteryConfig;
  const relevance = config.problemDecompositionRelevance;
  const allowed = mastery.concepts;
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["identify_input_output", "step_decomposition", "concept_mapping"]);
  for (const activity of activities) {
    for (const concept of relevance.activityConcepts(activity.concept)) {
      assert.ok(allowed.includes(concept), `${concept} must be a mastery concept`);
    }
  }
  assert.ok(relevance.chatConcepts("langkahnya harus diurutin gimana buat program rata-rata?").length > 0);
  assert.ok(relevance.chatConcepts("step mana yang masuk input, process, atau output?").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
});

// === 4. Robin Check and Smart Feedback rubrics carry the JSON contract ===
test("Problem Decomposition rubrics exist with the JSON evaluation contract", () => {
  assert.match(checkRubric, /problemDecompositionCheckInstructions/);
  assert.match(checkRubric, /step_order_confusion/);
  assert.match(checkRubric, /output_first_confusion/);
  assert.match(checkRubric, /new_syntax_needed/);
  assert.match(checkRubric, /monolithic_solution/);
  assert.match(checkRubric, /"signal":"strong\|developing\|shaky"/);
  assert.match(checkRubric, /recommendedAction/);
});

// === 5. Localization covers both languages without changing the flow ===
test("ID and EN activities share ids and answers while changing prose", () => {
  const localization = loadModule("content/lessons/programming/problem-decomposition-localization.ts", {
    "@/lib/robin/check": {},
    getSharedCopy: () => ({}),
    problemDecompositionActivities: activities,
  });
  for (const language of ["en", "id"]) {
    const localized = localization.getProblemDecompositionActivities(language);
    assert.equal(localized.length, activities.length);
    assert.deepEqual(localized.map((a) => a.id), activities.map((a) => a.id));
    for (let index = 0; index < activities.length; index++) {
      assert.equal(localized[index].code, activities[index].code, `activity ${activities[index].id} keeps its code`);
      if (activities[index].correctAnswer) {
        assert.equal(localized[index].correctAnswer, activities[index].correctAnswer);
      }
    }
  }
  const indonesian = localization.getProblemDecompositionActivities("id");
  const connect = indonesian.find((a) => a.type === "connect");
  assert.match(connect.content.join(" "), /Mini Project/, "connect must hand off to the Mini Project");
});

test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["problem-decomposition",\s*problemDecompositionDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["problem-decomposition", \{ getActivities: getProblemDecompositionActivities/);
  const loader = read("lib/lessons/problem-decomposition.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-putting-it-together"/);
  assert.match(loader, /"problem-decomposition"/);
  assert.match(loader, /server-only/);
  assert.equal(existsSync(new URL("content/lessons/programming/problem-decomposition-instructions.ts", root)), true, "needs Robin Check rubrics");
});

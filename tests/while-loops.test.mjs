import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.4 — Module 04 lesson "While Loops" (while-loops): standard Phase 20
// architecture, content ownership, TRY hardcode rejection, mastery/relevance
// vocabulary, Robin Check / Smart Feedback rubrics, and localization.

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

const content = loadModule("content/lessons/programming/while-loops.ts").whileLoopsLessonContent;
const activities = loadModule("content/lessons/programming/while-loops-activities.ts").whileLoopsActivities;
const config = loadModule("content/lessons/programming/while-loops-config.ts", {
  "@/lib/mastery/types": {},
});
const checkRubric = read("content/lessons/programming/while-loops-instructions.ts");

// === 1. Content ownership: condition-controlled repetition, three pieces ===
test("While Loops content is complete across every LessonContent field", () => {
  assert.equal(content.slug, "while-loops");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  for (const term of ["While loop", "Condition", "Update", "Starting state", "Infinite loop"]) {
    assert.ok(content.keyTerms.some((item) => item.term === term), `${term} must be a key term`);
  }
  assert.ok(content.commonMistakes.length >= 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  // Ownership: condition checked every pass, update moves toward False —
  // and range()/for-list mechanics are not taught here.
  const academic = content.academicExplanation.join(" ");
  assert.match(academic, /condition/i);
  assert.match(academic, /update/i);
  assert.match(academic, /True/);
  // The for/while contrast may name range(); teaching the range ladder may not.
  assert.doesNotMatch(academic, /range\(\d/);
  assert.ok(content.codeExamples.every((example) => !/range\(/.test(example.code)));
});

test("the three pieces are taught explicitly: starting state, condition, update", () => {
  const activitiesText = activities.map((a) => `${a.title} ${a.content?.join(" ") ?? ""}`).join(" ");
  assert.match(activitiesText, /[Ss]tarting state/);
  assert.match(activitiesText, /[Uu]pdate/);
  assert.match(activitiesText, /[Cc]ondition/);
  // The core trace example prints 1, 2, 3 and stops at the failing check.
  const intuition = activities.find((a) => a.id === "intuition");
  assert.match(intuition.code, /while count <= 3/);
  assert.match(intuition.code, /count = count \+ 1/);
});

// === 2. TRY requires a real while loop and rejects hardcoded prints ===
test("the TRY checker accepts the real while loop and rejects hardcoded prints", () => {
  const tryActivity = activities.find((a) => a.id === "try");
  assert.ok(tryActivity, "TRY activity exists");
  const check = tryActivity.checkAnswer;
  assert.equal(check("while count <= 3:\n    print(count)\n    count = count + 1"), true, "bare correct loop accepted");
  assert.equal(check("count = 1\nwhile count <= 3:\n    print(count)\n    count = count + 1"), true, "starter line accepted");
  assert.equal(check("count = 1\nwhile count <= 3:\n    print(count)\n    count += 1"), true, "count += 1 accepted");
  assert.equal(check("count = 1\nwhile count <= 3:\n    print(count)"), false, "missing update rejected");
  assert.equal(check("count = 1\nwhile count <= 3:\n    print(count)\nprint(count = count + 1)".replace("print(count = count + 1)", "count = count + 1")), false, "unindented update rejected");
  assert.equal(check("print(1)\nprint(2)\nprint(3)"), false, "hardcoded prints rejected");
  assert.equal(check("count = 1\nwhile count <= 5:\n    print(count)\n    count = count + 1"), false, "wrong condition rejected");
  assert.equal(check("count = 1\nwhile count <= 3\n    print(count)\n    count = count + 1"), false, "missing colon rejected");
});

// === 3. Mastery and relevance stay inside the lesson-owned vocabulary ===
test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const mastery = config.whileLoopsMasteryConfig;
  const allowed = mastery.concepts;
  for (const concept of ["while_condition", "while_update", "while_structure"]) {
    assert.ok(allowed.includes(concept), `${concept} must exist`);
  }
  for (const activity of activities) {
    if (activity.concept === "connections") continue; // connect steps map to null by design
    const mapped = mastery.activityConceptToMastery(activity.concept);
    assert.ok(mapped && allowed.includes(mapped), `activity concept ${activity.concept} must map to a lesson concept`);
  }
  for (const signal of ["strong", "developing", "shaky"]) {
    const evidence = mastery.robinCheckSignalToEvidence(signal);
    assert.ok(evidence.concepts.every((concept) => allowed.includes(concept)));
  }
});

test("relevance outputs never escape the mastery vocabulary", () => {
  const mastery = config.whileLoopsMasteryConfig;
  const relevance = config.whileLoopsRelevance;
  const allowed = mastery.concepts;
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["while_condition", "while_update", "while_structure"]);
  for (const activity of activities) {
    for (const concept of relevance.activityConcepts(activity.concept)) {
      assert.ok(allowed.includes(concept), `${concept} must be a mastery concept`);
    }
  }
  assert.ok(relevance.chatConcepts("while gue muter terus, nggak berhenti").length > 0);
  assert.ok(relevance.chatConcepts("kapan while-nya berhenti?").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
});

// === 4. Robin Check and Smart Feedback rubrics carry the JSON contract ===
test("While Loops rubrics exist with the JSON evaluation contract", () => {
  assert.match(checkRubric, /whileLoopsCheckInstructions/);
  assert.match(checkRubric, /missing_counter_update/);
  assert.match(checkRubric, /hardcoded_repetition/);
  assert.match(checkRubric, /"signal":"strong\|developing\|shaky"/);
  assert.match(checkRubric, /recommendedAction/);
  // Check-first semantics: a while loop can run zero times is a named misconception.
  assert.match(checkRubric, /body_runs_at_least_once/);
});

// === 5. Localization covers both languages without changing the flow ===
test("ID and EN activities share ids and answers while changing prose", () => {
  const localization = loadModule("content/lessons/programming/while-loops-localization.ts", {
    "@/lib/robin/check": {},
    getSharedCopy: () => ({}),
    whileLoopsActivities: activities,
  });
  for (const language of ["en", "id"]) {
    const localized = localization.getWhileLoopsActivities(language);
    assert.equal(localized.length, activities.length);
    assert.deepEqual(localized.map((a) => a.id), activities.map((a) => a.id));
    for (let index = 0; index < activities.length; index++) {
      assert.equal(localized[index].code, activities[index].code, `activity ${activities[index].id} keeps its code`);
      if (activities[index].correctAnswer) {
        assert.equal(localized[index].correctAnswer, activities[index].correctAnswer);
      }
    }
  }
  const indonesian = localization.getWhileLoopsActivities("id");
  const connect = indonesian.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Range & Loop Patterns/, "connect must hand off to the next roadmap lesson");
});

test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["while-loops",\s*whileLoopsDefinition\]/);
  assert.match(registry, /checkQuestion: "Jelasin pakai bahasa lu sendiri: apa yang bikin sebuah while loop berhenti/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["while-loops", \{ getActivities: getWhileLoopsActivities/);
  const loader = read("lib/lessons/while-loops.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-building-blocks"/);
  assert.match(loader, /"while-loops"/);
  assert.match(loader, /server-only/);
  assert.equal(existsSync(new URL("content/lessons/programming/while-loops-instructions.ts", root)), true, "needs Robin Check rubrics");
});

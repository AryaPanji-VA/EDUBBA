import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.4 — Module 04 lesson "Range & Loop Patterns" (range-loop-patterns):
// standard Phase 20 architecture, content ownership, TRY hardcode rejection,
// mastery/relevance vocabulary, rubrics, and localization.

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

const content = loadModule("content/lessons/programming/range-loop-patterns.ts").rangeLoopPatternsLessonContent;
const activities = loadModule("content/lessons/programming/range-loop-patterns-activities.ts").rangeLoopPatternsActivities;
const config = loadModule("content/lessons/programming/range-loop-patterns-config.ts", {
  "@/lib/mastery/types": {},
});
const checkRubric = read("content/lessons/programming/range-loop-patterns-instructions.ts");

// === 1. Content ownership: range(start, stop, step), stop excluded ===
test("Range & Loop Patterns content is complete across every LessonContent field", () => {
  assert.equal(content.slug, "range-loop-patterns");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  for (const term of ["range()", "Start", "Stop", "Step"]) {
    assert.ok(content.keyTerms.some((item) => item.term === term), `${term} must be a key term`);
  }
  assert.ok(content.commonMistakes.length >= 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  // Ownership: the progressive range ladder and the excluded stop.
  const academic = content.academicExplanation.join(" ");
  assert.match(academic, /range\(3\)/);
  assert.match(academic, /range\(1, 4\)/);
  assert.match(academic, /range\(2, 7, 2\)/);
  assert.match(academic, /exclud/i);
  // Scope guard: no while-controlled patterns are taught here.
  assert.doesNotMatch(academic, /while/i);
});

test("the progressive range ladder is taught with correct traces", () => {
  const ladder = activities.filter((a) => ["predict-range3", "predict-start", "predict-step"].includes(a.id));
  assert.equal(ladder.length, 3);
  const byId = Object.fromEntries(ladder.map((a) => [a.id, a]));
  assert.match(byId["predict-range3"].code, /for i in range\(3\)/);
  assert.equal(byId["predict-range3"].correctAnswer, "0, 1, 2");
  assert.match(byId["predict-start"].code, /for i in range\(1, 4\)/);
  assert.equal(byId["predict-start"].correctAnswer, "1, 2, 3");
  assert.match(byId["predict-step"].code, /for i in range\(2, 7, 2\)/);
  assert.equal(byId["predict-step"].correctAnswer, "2, 4, 6");
  // Every predict misconception mapping uses the owned vocabulary.
  for (const activity of ladder) {
    for (const code of Object.values(activity.misconceptionsByAnswer ?? {})) {
      assert.ok(
        ["range_one_based", "range_inclusive_end", "boundary_off_by_one", "step_confusion", "hardcoded_repetition", "prints_last_value"].includes(code),
        `${code} must be an owned misconception`,
      );
    }
  }
});

// === 2. TRY requires a real range loop and rejects hardcoded prints ===
test("the TRY checker accepts the range loop and rejects hardcoded prints and off-by-one", () => {
  const tryActivity = activities.find((a) => a.id === "try");
  assert.ok(tryActivity, "TRY activity exists");
  const check = tryActivity.checkAnswer;
  assert.equal(check("for i in range(1, 6):\n    print(i)"), true, "correct loop accepted");
  assert.equal(check("for number in range(1, 6):\n    print(number)"), true, "any loop variable accepted");
  assert.equal(check("for i in range(1, 6):\n\tprint(i)"), true, "tab-indented body accepted");
  assert.equal(check("print(1)\nprint(2)\nprint(3)\nprint(4)\nprint(5)"), false, "hardcoded prints rejected");
  assert.equal(check("for i in range(1, 5):\n    print(i)"), false, "range(1, 5) off-by-one rejected");
  assert.equal(check("for i in range(5):\n    print(i)"), false, "range(5) starts at 0, rejected");
  assert.equal(check("for i in range(1, 6):\n    print(\"hello\")"), false, "body must print the loop variable");
  assert.equal(check("for i in range(1, 6):\n    print(i)\nprint(\"done\")"), false, "extra unindented line rejected");
  assert.equal(check("for i in range(1, 6)\n    print(i)"), false, "missing colon rejected");
});

// === 3. Mastery and relevance stay inside the lesson-owned vocabulary ===
test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const mastery = config.rangeLoopPatternsMasteryConfig;
  const allowed = mastery.concepts;
  for (const concept of ["range_sequence", "range_boundaries", "range_step"]) {
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
  const mastery = config.rangeLoopPatternsMasteryConfig;
  const relevance = config.rangeLoopPatternsRelevance;
  const allowed = mastery.concepts;
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["range_sequence", "range_boundaries", "range_step"]);
  for (const activity of activities) {
    for (const concept of relevance.activityConcepts(activity.concept)) {
      assert.ok(allowed.includes(concept), `${concept} must be a mastery concept`);
    }
  }
  assert.ok(relevance.chatConcepts("range(1,5) kok cuma sampai 4 ya").length > 0);
  assert.ok(relevance.chatConcepts("gimana sih cara loop pakai range dari 1 sampai 5?").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
});

// === 4. Robin Check and Smart Feedback rubrics carry the JSON contract ===
test("Range & Loop Patterns rubrics exist with the JSON evaluation contract", () => {
  assert.match(checkRubric, /rangeLoopPatternsCheckInstructions/);
  assert.match(checkRubric, /range_one_based/);
  assert.match(checkRubric, /range_inclusive_end/);
  assert.match(checkRubric, /hardcoded_repetition/);
  assert.match(checkRubric, /"signal":"strong\|developing\|shaky"/);
  assert.match(checkRubric, /recommendedAction/);
});

// === 5. Localization covers both languages without changing the flow ===
test("ID and EN activities share ids and answers while changing prose", () => {
  const localization = loadModule("content/lessons/programming/range-loop-patterns-localization.ts", {
    "@/lib/robin/check": {},
    getSharedCopy: () => ({}),
    rangeLoopPatternsActivities: activities,
  });
  for (const language of ["en", "id"]) {
    const localized = localization.getRangeLoopPatternsActivities(language);
    assert.equal(localized.length, activities.length);
    assert.deepEqual(localized.map((a) => a.id), activities.map((a) => a.id));
    for (let index = 0; index < activities.length; index++) {
      assert.equal(localized[index].code, activities[index].code, `activity ${activities[index].id} keeps its code`);
      if (activities[index].correctAnswer) {
        assert.equal(localized[index].correctAnswer, activities[index].correctAnswer);
      }
    }
  }
  const indonesian = localization.getRangeLoopPatternsActivities("id");
  const connect = indonesian.find((a) => a.type === "connect");
  assert.match(connect.content.join(" "), /Module 05|Functions/, "connect must hand off to Module 05 · Functions");
});

test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["range-loop-patterns",\s*rangeLoopPatternsDefinition\]/);
  assert.match(registry, /checkQuestion: "Jelasin pakai bahasa lu sendiri: range\(1, 4\) menghasilkan angka apa saja/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["range-loop-patterns", \{ getActivities: getRangeLoopPatternsActivities/);
  const loader = read("lib/lessons/range-loop-patterns.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-building-blocks"/);
  assert.match(loader, /"range-loop-patterns"/);
  assert.match(loader, /server-only/);
  assert.equal(existsSync(new URL("content/lessons/programming/range-loop-patterns-instructions.ts", root)), true, "needs Robin Check rubrics");
});

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.5 — Module 05 lesson "Return Values" (return-values): standard
// Phase 20 architecture, print-vs-return ownership, TRY hardcode rejection,
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

const content = loadModule("content/lessons/programming/return-values.ts").returnValuesLessonContent;
const activities = loadModule("content/lessons/programming/return-values-activities.ts").returnValuesActivities;
const config = loadModule("content/lessons/programming/return-values-config.ts", {
  "@/lib/mastery/types": {},
});
const checkRubric = read("content/lessons/programming/return-values-instructions.ts");

// === 1. Content ownership: print != return; returned value flows to caller ===
test("Return Values content is complete across every LessonContent field", () => {
  assert.equal(content.slug, "return-values");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  assert.ok(content.keyTerms.some((item) => /return/i.test(item.term)), "return must be a key term");
  assert.ok(content.commonMistakes.length >= 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  // Ownership: the double(5) pipeline, the print-vs-return contrast pair,
  // and stop-at-return are taught.
  const text = JSON.stringify(content);
  assert.match(text, /def double\(number\)/);
  assert.match(text, /result = double\(5\)/);
  assert.match(text, /get_greeting/);
  assert.match(text, /stops at return|stop at return/i);
  // Scope is not taught here (next lesson).
  assert.doesNotMatch(text, /local variable|global|scope/i);
});

// === 2. TRY requires a real return with the value stored or used ===
test("the TRY checker requires return and rejects print-instead-of-return", () => {
  const tryActivity = activities.find((a) => a.id === "try");
  assert.ok(tryActivity, "TRY activity exists");
  const check = tryActivity.checkAnswer;
  assert.equal(check("def triple(number):\n    return number * 3\n\nresult = triple(4)\nprint(result)"), true, "store + print accepted");
  assert.equal(check("def triple(number):\n    return number * 3\n\nresult = triple(4)"), true, "store without print accepted");
  assert.equal(check("def triple(number):\n    return number * 3\n\nprint(triple(4))"), true, "direct use accepted");
  assert.equal(check("def triple(number):\n    print(number * 3)\n\nresult = triple(4)\nprint(result)"), false, "print instead of return rejected");
  assert.equal(check("result = 12\nprint(result)"), false, "hardcoded result rejected");
  assert.equal(check("def triple(number):\n    return number * 3"), false, "definition without a call rejected");
});

// === 3. Mastery and relevance stay inside the lesson-owned vocabulary ===
test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const mastery = config.returnValuesMasteryConfig;
  const allowed = mastery.concepts;
  for (const concept of ["return_values", "return_vs_print", "return_flow"]) {
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
  const mastery = config.returnValuesMasteryConfig;
  const relevance = config.returnValuesRelevance;
  const allowed = mastery.concepts;
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["return_values", "return_vs_print", "return_flow"]);
  for (const activity of activities) {
    for (const concept of relevance.activityConcepts(activity.concept)) {
      assert.ok(allowed.includes(concept), `${concept} must be a mastery concept`);
    }
  }
  assert.ok(relevance.chatConcepts("return itu ngembaliin apa sih?").length > 0);
  assert.ok(relevance.chatConcepts("mau simpan hasil return-nya dulu").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
});

// === 4. Robin Check and Smart Feedback rubrics carry the JSON contract ===
test("Return Values rubrics exist with the JSON evaluation contract", () => {
  assert.match(checkRubric, /returnValuesCheckInstructions/);
  assert.match(checkRubric, /print_not_return/);
  assert.match(checkRubric, /result_unused/);
  assert.match(checkRubric, /"signal":"strong\|developing\|shaky"/);
  assert.match(checkRubric, /recommendedAction/);
});

// === 5. Localization covers both languages without changing the flow ===
test("ID and EN activities share ids and answers while changing prose", () => {
  const localization = loadModule("content/lessons/programming/return-values-localization.ts", {
    "@/lib/robin/check": {},
    getSharedCopy: () => ({}),
    returnValuesActivities: activities,
  });
  for (const language of ["en", "id"]) {
    const localized = localization.getReturnValuesActivities(language);
    assert.equal(localized.length, activities.length);
    assert.deepEqual(localized.map((a) => a.id), activities.map((a) => a.id));
    for (let index = 0; index < activities.length; index++) {
      assert.equal(localized[index].code, activities[index].code, `activity ${activities[index].id} keeps its code`);
      if (activities[index].correctAnswer) {
        assert.equal(localized[index].correctAnswer, activities[index].correctAnswer);
      }
    }
  }
  const indonesian = localization.getReturnValuesActivities("id");
  const connect = indonesian.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Scope Basics/, "connect must hand off to the next roadmap lesson");
});

test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["return-values",\s*returnValuesDefinition\]/);
  assert.match(registry, /checkQuestion: "Jelasin pakai bahasa lu sendiri: apa bedanya print dan return/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["return-values", \{ getActivities: getReturnValuesActivities/);
  const loader = read("lib/lessons/return-values.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-building-blocks"/);
  assert.match(loader, /"return-values"/);
  assert.match(loader, /server-only/);
  assert.equal(existsSync(new URL("content/lessons/programming/return-values-instructions.ts", root)), true, "needs Robin Check rubrics");
});

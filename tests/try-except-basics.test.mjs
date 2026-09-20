import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.7 — Module 07 lesson "Errors / Try Except Basics"
// (try-except-basics, programming course): standard Phase 20 architecture,
// handling ONE expected runtime failure, ValueError-only scope, no advanced
// exception handling.

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

const content = loadModule("content/lessons/programming/try-except-basics.ts").tryExceptBasicsLessonContent;
const activities = loadModule("content/lessons/programming/try-except-basics-activities.ts").tryExceptBasicsActivities;
const config = loadModule("content/lessons/programming/try-except-basics-config.ts", {
  "@/lib/mastery/types": {},
});
const checkRubric = read("content/lessons/programming/try-except-basics-instructions.ts");

// === 1. Content ownership: handling an expected failure, not reading errors ===
test("Try Except Basics content is complete across every LessonContent field", () => {
  assert.equal(content.slug, "try-except-basics");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  for (const term of ["Try", "Except", "ValueError"]) {
    assert.ok(content.keyTerms.some((item) => item.term === term), `${term} must be a key term`);
  }
  assert.ok(content.commonMistakes.length >= 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  const text = JSON.stringify(content);
  assert.match(text, /try/);
  assert.match(text, /except ValueError/);
  assert.match(text, /int\(\\"hello\\"\)|int\(text\)|int\(\\"7\\"\)/);
  assert.match(text, /fallback|cadangan/i, "the fallback is named");
  // Scope guard: no advanced exception handling.
  for (const banned of ["finally", "raise", "BaseException", "traceback", "custom exception", "hierarchy"]) {
    assert.ok(!new RegExp(banned, "i").test(text), `${banned} must not appear`);
  }
});

// === 2. TRY requires a real try, a specific except ValueError, and a fallback ===
test("the TRY checker requires try + ValueError + guarded conversion + fallback", () => {
  const tryActivity = activities.find((a) => a.id === "try");
  assert.ok(tryActivity, "TRY activity exists");
  const check = tryActivity.checkAnswer;
  assert.equal(check("text = input(\"Enter a number: \")\ntry:\n    number = int(text)\n    print(number)\nexcept ValueError:\n    print(\"Please enter a number\")"), true, "input + guarded conversion + fallback accepted");
  assert.equal(check("try:\n    number = int(\"hello\")\nexcept ValueError:\n    print(\"That is not a number\")"), true, "literal-arg variant accepted");
  assert.equal(check("try:\n    number = int(text)\nexcept:\n    print(\"Please enter a number\")"), false, "bare except rejected");
  assert.equal(check("number = int(text)\ntry:\n    print(number)\nexcept ValueError:\n    print(\"no\")"), false, "conversion outside try rejected");
  assert.equal(check("try:\n    number = int(text)\nexcept ValueError:\n    pass"), false, "missing fallback print rejected");
  assert.equal(check("try:\n    number = int(text)\nexcept Exception:\n    print(\"no\")"), false, "broad Exception rejected");
});

// === 3. Mastery and relevance stay inside the lesson-owned vocabulary ===
test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const mastery = config.tryExceptBasicsMasteryConfig;
  const allowed = mastery.concepts;
  for (const concept of ["error_as_signal", "try_except_flow", "valueerror_handling"]) {
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
  const mastery = config.tryExceptBasicsMasteryConfig;
  const relevance = config.tryExceptBasicsRelevance;
  const allowed = mastery.concepts;
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["error_as_signal", "try_except_flow", "valueerror_handling"]);
  for (const activity of activities) {
    for (const concept of relevance.activityConcepts(activity.concept)) {
      assert.ok(allowed.includes(concept), `${concept} must be a mastery concept`);
    }
  }
  assert.ok(relevance.chatConcepts("kok program-nya berhenti pas int-nya error?").length > 0);
  assert.ok(relevance.chatConcepts("cara nangkep ValueError biar nggak crash?").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
});

// === 4. Robin Check and Smart Feedback rubrics carry the JSON contract ===
test("Try Except Basics rubrics exist with the JSON evaluation contract", () => {
  assert.match(checkRubric, /tryExceptBasicsCheckInstructions/);
  assert.match(checkRubric, /bare_except_confusion/);
  assert.match(checkRubric, /fallback_without_try/);
  assert.match(checkRubric, /wrong_error_type/);
  assert.match(checkRubric, /conversion_always_fails/);
  assert.match(checkRubric, /"signal":"strong\|developing\|shaky"/);
  assert.match(checkRubric, /recommendedAction/);
});

// === 5. Localization covers both languages without changing the flow ===
test("ID and EN activities share ids and answers while changing prose", () => {
  const localization = loadModule("content/lessons/programming/try-except-basics-localization.ts", {
    "@/lib/robin/check": {},
    getSharedCopy: () => ({}),
    tryExceptBasicsActivities: activities,
  });
  for (const language of ["en", "id"]) {
    const localized = localization.getTryExceptBasicsActivities(language);
    assert.equal(localized.length, activities.length);
    assert.deepEqual(localized.map((a) => a.id), activities.map((a) => a.id));
    for (let index = 0; index < activities.length; index++) {
      assert.equal(localized[index].code, activities[index].code, `activity ${activities[index].id} keeps its code`);
      if (activities[index].correctAnswer) {
        assert.equal(localized[index].correctAnswer, activities[index].correctAnswer);
      }
    }
  }
  const indonesian = localization.getTryExceptBasicsActivities("id");
  const connect = indonesian.find((a) => a.type === "connect");
  assert.match(connect.content.join(" "), /Problem Decomposition/, "connect must hand off to Problem Decomposition");
});

test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["try-except-basics",\s*tryExceptBasicsDefinition\]/);
  assert.match(registry, /checkQuestion: ['"]Jelasin pakai bahasa lu sendiri: kenapa int\("hello"\)/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["try-except-basics", \{ getActivities: getTryExceptBasicsActivities/);
  const loader = read("lib/lessons/try-except-basics.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-putting-it-together"/);
  assert.match(loader, /"try-except-basics"/);
  assert.match(loader, /server-only/);
  assert.equal(existsSync(new URL("content/lessons/programming/try-except-basics-instructions.ts", root)), true, "needs Robin Check rubrics");
});

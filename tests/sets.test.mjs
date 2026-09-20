import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.6 — Module 06 lesson "Sets" (sets, programming course): standard
// Phase 20 architecture, unique-values ownership, no positional indexing,
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

const content = loadModule("content/lessons/programming/sets.ts").setsLessonContent;
const activities = loadModule("content/lessons/programming/sets-activities.ts").setsActivities;
const config = loadModule("content/lessons/programming/sets-config.ts", {
  "@/lib/mastery/types": {},
});
const checkRubric = read("content/lessons/programming/sets-instructions.ts");

// === 1. Content ownership: unique values, membership, no positions ===
test("Sets content is complete across every LessonContent field", () => {
  assert.equal(content.slug, "sets");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  for (const term of ["Set", "Unique"]) {
    assert.ok(content.keyTerms.some((item) => item.term === term), `${term} must be a key term`);
  }
  assert.ok(content.commonMistakes.length >= 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  // Ownership: the core tags literal, duplicate collapse, membership with in,
  // and the invalid positional access are taught.
  const text = JSON.stringify(content);
  assert.match(text, /\{\\"python\\", \\"coding\\", \\"python\\"\}/);
  assert.match(text, /in tags/);
  assert.match(text, /tags\[0\]/);
  assert.match(text, /len\(tags\)|collapse|unik|unique/i);
  // No order promise: the lesson explicitly warns against display order.
  assert.match(text, /order/i);
  // Scope guard: no set algebra or internals.
  for (const banned of ["union", "intersection", "frozenset", "comprehension", "hash"]) {
    assert.ok(!new RegExp(banned, "i").test(text), `${banned} must not appear`);
  }
});

// === 2. TRY requires actual set usage and membership reasoning ===
test("the TRY checker requires a set with a membership check and rejects lists", () => {
  const tryActivity = activities.find((a) => a.id === "try");
  assert.ok(tryActivity, "TRY activity exists");
  const check = tryActivity.checkAnswer;
  assert.equal(check("tags = {\"python\", \"coding\", \"python\"}\nprint(\"python\" in tags)"), true, "set + membership accepted");
  assert.equal(check("hobi = {\"mancing\", \"ngoding\"}\nprint(\"mancing\" in hobi)"), true, "other names accepted");
  assert.equal(check("tags = [\"python\", \"coding\"]\nprint(\"python\" in tags)"), false, "square-bracket list rejected");
  assert.equal(check("tags = {\"python\", \"coding\"}\nprint(tags[0])"), false, "positional access rejected");
  assert.equal(check("tags = {\"python\", \"coding\", \"python\"}"), false, "set without a membership check rejected");
  assert.equal(check("print(\"python\" in {\"python\", \"coding\"})"), false, "membership without a named set rejected");
});

// === 3. Mastery and relevance stay inside the lesson-owned vocabulary ===
test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const mastery = config.setsMasteryConfig;
  const allowed = mastery.concepts;
  for (const concept of ["set_uniqueness", "set_membership", "set_unordered"]) {
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
  const mastery = config.setsMasteryConfig;
  const relevance = config.setsRelevance;
  const allowed = mastery.concepts;
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["set_uniqueness", "set_membership", "set_unordered"]);
  for (const activity of activities) {
    for (const concept of relevance.activityConcepts(activity.concept)) {
      assert.ok(allowed.includes(concept), `${concept} must be a mastery concept`);
    }
  }
  assert.ok(relevance.chatConcepts("kok set-nya cuma 2 value padahal nulis 3?").length > 0);
  assert.ok(relevance.chatConcepts("cara cek ada nggak suatu value di set?").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
});

// === 4. Robin Check and Smart Feedback rubrics carry the JSON contract ===
test("Sets rubrics exist with the JSON evaluation contract", () => {
  assert.match(checkRubric, /setsCheckInstructions/);
  assert.match(checkRubric, /set_indexing_confusion/);
  assert.match(checkRubric, /duplicates_counted_confusion/);
  assert.match(checkRubric, /"signal":"strong\|developing\|shaky"/);
  assert.match(checkRubric, /recommendedAction/);
});

// === 5. Localization covers both languages without changing the flow ===
test("ID and EN activities share ids and answers while changing prose", () => {
  const localization = loadModule("content/lessons/programming/sets-localization.ts", {
    "@/lib/robin/check": {},
    getSharedCopy: () => ({}),
    setsActivities: activities,
  });
  for (const language of ["en", "id"]) {
    const localized = localization.getSetsActivities(language);
    assert.equal(localized.length, activities.length);
    assert.deepEqual(localized.map((a) => a.id), activities.map((a) => a.id));
    for (let index = 0; index < activities.length; index++) {
      assert.equal(localized[index].code, activities[index].code, `activity ${activities[index].id} keeps its code`);
      if (activities[index].correctAnswer) {
        assert.equal(localized[index].correctAnswer, activities[index].correctAnswer);
      }
    }
  }
  const indonesian = localization.getSetsActivities("id");
  const connect = indonesian.find((a) => a.type === "connect");
  assert.match(connect.content.join(" "), /Module 07|Errors/i, "connect must hand off to Module 07");
});

test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["sets",\s*setsDefinition\]/);
  assert.match(registry, /checkQuestion: ['"]Jelasin pakai bahasa lu sendiri: kenapa set dengan isi/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["sets", \{ getActivities: getSetsActivities/);
  const loader = read("lib/lessons/sets.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-building-blocks"/);
  assert.match(loader, /"sets"/);
  assert.match(loader, /server-only/);
  assert.equal(existsSync(new URL("content/lessons/programming/sets-instructions.ts", root)), true, "needs Robin Check rubrics");
});

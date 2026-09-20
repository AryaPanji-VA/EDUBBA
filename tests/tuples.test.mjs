import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.6 — Module 06 lesson "Tuples" (tuples): standard Phase 20
// architecture, fixed-items ownership, TRY hardcode rejection,
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

const content = loadModule("content/lessons/programming/tuples.ts").tuplesLessonContent;
const activities = loadModule("content/lessons/programming/tuples-activities.ts").tuplesActivities;
const config = loadModule("content/lessons/programming/tuples-config.ts", {
  "@/lib/mastery/types": {},
});
const checkRubric = read("content/lessons/programming/tuples-instructions.ts");

// === 1. Content ownership: ordered + indexed, items fixed ===
test("Tuples content is complete across every LessonContent field", () => {
  assert.equal(content.slug, "tuples");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  for (const term of ["Tuple"]) {
    assert.ok(content.keyTerms.some((item) => item.term === term), `${term} must be a key term`);
  }
  assert.ok(content.commonMistakes.length >= 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  // Ownership: the core point tuple, the required colors-vs-point contrast,
  // and the refused item assignment are taught.
  const text = JSON.stringify(content);
  assert.match(text, /point = \(10, 20\)/);
  assert.match(text, /point\[0\]/);
  assert.match(text, /colors = \[\\"red\\", \\"blue\\"\]/);
  assert.match(text, /point\[0\] = 99/);
  assert.match(text, /refus|fixed|not valid|error/i);
  // Scope guard: no unpacking or advanced tuple content.
  for (const banned of ["unpack", "namedtuple", "hash"]) {
    assert.ok(!new RegExp(banned, "i").test(text), `${banned} must not appear`);
  }
});

// === 2. TRY requires creating and reading a tuple ===
test("the TRY checker requires a tuple read and rejects lists and assignment", () => {
  const tryActivity = activities.find((a) => a.id === "try");
  assert.ok(tryActivity, "TRY activity exists");
  const check = tryActivity.checkAnswer;
  assert.equal(check("point = (10, 20)\nprint(point[0])"), true, "tuple + index read accepted");
  assert.equal(check("titik = (3.5, -2)\nprint(titik[1])"), true, "decimals/negatives accepted");
  assert.equal(check("point = [10, 20]\nprint(point[0])"), false, "square-bracket list rejected");
  assert.equal(check("point = (10, 20)"), false, "tuple without a read rejected");
  assert.equal(check("print(10)"), false, "hardcoded print rejected");
  assert.equal(check("point = (10, 20)\npoint[0] = 99\nprint(point[0])"), false, "item assignment rejected");
});

// === 3. Mastery and relevance stay inside the lesson-owned vocabulary ===
test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const mastery = config.tuplesMasteryConfig;
  const allowed = mastery.concepts;
  for (const concept of ["tuple_literal", "tuple_indexing", "tuple_immutable"]) {
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
  const mastery = config.tuplesMasteryConfig;
  const relevance = config.tuplesRelevance;
  const allowed = mastery.concepts;
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["tuple_literal", "tuple_indexing", "tuple_immutable"]);
  for (const activity of activities) {
    for (const concept of relevance.activityConcepts(activity.concept)) {
      assert.ok(allowed.includes(concept), `${concept} must be a mastery concept`);
    }
  }
  assert.ok(relevance.chatConcepts("kenapa point[0] = 99 nggak bisa?").length > 0);
  assert.ok(relevance.chatConcepts("tuple itu beda sama list gimana?").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
});

// === 4. Robin Check and Smart Feedback rubrics carry the JSON contract ===
test("Tuples rubrics exist with the JSON evaluation contract", () => {
  assert.match(checkRubric, /tuplesCheckInstructions/);
  assert.match(checkRubric, /tuple_item_assignment/);
  assert.match(checkRubric, /tuple_list_syntax_confusion/);
  assert.match(checkRubric, /"signal":"strong\|developing\|shaky"/);
  assert.match(checkRubric, /recommendedAction/);
});

// === 5. Localization covers both languages without changing the flow ===
test("ID and EN activities share ids and answers while changing prose", () => {
  const localization = loadModule("content/lessons/programming/tuples-localization.ts", {
    "@/lib/robin/check": {},
    getSharedCopy: () => ({}),
    tuplesActivities: activities,
  });
  for (const language of ["en", "id"]) {
    const localized = localization.getTuplesActivities(language);
    assert.equal(localized.length, activities.length);
    assert.deepEqual(localized.map((a) => a.id), activities.map((a) => a.id));
    for (let index = 0; index < activities.length; index++) {
      assert.equal(localized[index].code, activities[index].code, `activity ${activities[index].id} keeps its code`);
      if (activities[index].correctAnswer) {
        assert.equal(localized[index].correctAnswer, activities[index].correctAnswer);
      }
    }
  }
  const indonesian = localization.getTuplesActivities("id");
  const connect = indonesian.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Sets/, "connect must hand off to the next roadmap lesson");
});

test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["tuples",\s*tuplesDefinition\]/);
  assert.match(registry, /checkQuestion: "Jelasin pakai bahasa lu sendiri: apa beda tuple dan list/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["tuples", \{ getActivities: getTuplesActivities/);
  const loader = read("lib/lessons/tuples.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-building-blocks"/);
  assert.match(loader, /"tuples"/);
  assert.match(loader, /server-only/);
  assert.equal(existsSync(new URL("content/lessons/programming/tuples-instructions.ts", root)), true, "needs Robin Check rubrics");
});

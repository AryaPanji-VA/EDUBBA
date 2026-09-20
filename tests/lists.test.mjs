import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.6 — Module 06 lesson "Lists" (lists): standard Phase 20
// architecture, one-ordered-collection ownership, TRY hardcode rejection,
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

const content = loadModule("content/lessons/programming/lists.ts").listsLessonContent;
const activities = loadModule("content/lessons/programming/lists-activities.ts").listsActivities;
const config = loadModule("content/lessons/programming/lists-config.ts", {
  "@/lib/mastery/types": {},
});
const checkRubric = read("content/lessons/programming/lists-instructions.ts");

// === 1. Content ownership: one ordered collection, zero-based, mutable ===
test("Lists content is complete across every LessonContent field", () => {
  assert.equal(content.slug, "lists");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  for (const term of ["List", "Index", "Zero-based", "Mutable"]) {
    assert.ok(content.keyTerms.some((item) => item.term === term), `${term} must be a key term`);
  }
  assert.ok(content.commonMistakes.length >= 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  // Ownership: the core literal, zero-based reads, and mutation are taught.
  const text = JSON.stringify(content);
  assert.match(text, /\[\\"Arya\\", \\"Bima\\", \\"Citra\\"\]/);
  assert.match(text, /names\[0\]/);
  assert.match(text, /names\[1\] = \\"Dina\\"/);
  assert.match(text, /len\(names\)/);
  // Scope guard: no advanced list mechanics.
  for (const banned of ["slice", "\\[-1\\]", "append", "comprehension", "nested"]) {
    assert.ok(!new RegExp(banned, "i").test(text), `${banned} must not appear`);
  }
});

// === 2. TRY requires a real list and rejects separate variables ===
test("the TRY checker requires a real list and rejects hardcoded variables", () => {
  const tryActivity = activities.find((a) => a.id === "try");
  assert.ok(tryActivity, "TRY activity exists");
  const check = tryActivity.checkAnswer;
  assert.equal(check("names = [\"Arya\", \"Bima\", \"Citra\"]\nprint(names[0])"), true, "list + index read accepted");
  assert.equal(check("buah = [\"mangga\", \"jeruk\"]\nprint(buah[1])"), true, "other names accepted");
  assert.equal(check("a = \"Arya\"\nb = \"Bima\"\nc = \"Citra\"\nprint(a)"), false, "three separate variables rejected");
  assert.equal(check("print(\"Arya\")"), false, "hardcoded print rejected");
  assert.equal(check("names = [\"Arya\", \"Bima\", \"Citra\"]"), false, "list without any index read rejected");
  assert.equal(check("names = [\"Arya\"]\nprint(names[0])"), false, "single-item list rejected");
});

// === 3. Mastery and relevance stay inside the lesson-owned vocabulary ===
test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const mastery = config.listsMasteryConfig;
  const allowed = mastery.concepts;
  for (const concept of ["list_literal", "zero_based_index", "list_mutation"]) {
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
  const mastery = config.listsMasteryConfig;
  const relevance = config.listsRelevance;
  const allowed = mastery.concepts;
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["list_literal", "zero_based_index", "list_mutation"]);
  for (const activity of activities) {
    for (const concept of relevance.activityConcepts(activity.concept)) {
      assert.ok(allowed.includes(concept), `${concept} must be a mastery concept`);
    }
  }
  assert.ok(relevance.chatConcepts("kok names[1] isinya Bima, bukan Arya?").length > 0);
  assert.ok(relevance.chatConcepts("cara ganti item di list gimana?").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
});

// === 4. Robin Check and Smart Feedback rubrics carry the JSON contract ===
test("Lists rubrics exist with the JSON evaluation contract", () => {
  assert.match(checkRubric, /listsCheckInstructions/);
  assert.match(checkRubric, /one_based_index/);
  assert.match(checkRubric, /list_mutation|immutable_list_confusion/);
  assert.match(checkRubric, /"signal":"strong\|developing\|shaky"/);
  assert.match(checkRubric, /recommendedAction/);
});

// === 5. Localization covers both languages without changing the flow ===
test("ID and EN activities share ids and answers while changing prose", () => {
  const localization = loadModule("content/lessons/programming/lists-localization.ts", {
    "@/lib/robin/check": {},
    getSharedCopy: () => ({}),
    listsActivities: activities,
  });
  for (const language of ["en", "id"]) {
    const localized = localization.getListsActivities(language);
    assert.equal(localized.length, activities.length);
    assert.deepEqual(localized.map((a) => a.id), activities.map((a) => a.id));
    for (let index = 0; index < activities.length; index++) {
      assert.equal(localized[index].code, activities[index].code, `activity ${activities[index].id} keeps its code`);
      if (activities[index].correctAnswer) {
        assert.equal(localized[index].correctAnswer, activities[index].correctAnswer);
      }
    }
  }
  const indonesian = localization.getListsActivities("id");
  const connect = indonesian.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Dictionaries/, "connect must hand off to the next roadmap lesson");
});

test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["lists",\s*listsDefinition\]/);
  assert.match(registry, /checkQuestion: ['"]Jelasin pakai bahasa lu sendiri: apa artinya list punya index mulai dari 0/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["lists", \{ getActivities: getListsActivities/);
  const loader = read("lib/lessons/lists.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-building-blocks"/);
  assert.match(loader, /"lists"/);
  assert.match(loader, /server-only/);
  assert.equal(existsSync(new URL("content/lessons/programming/lists-instructions.ts", root)), true, "needs Robin Check rubrics");
});

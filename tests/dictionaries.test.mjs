import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.6 — Module 06 lesson "Dictionaries" (dictionaries): standard
// Phase 20 architecture, key → value ownership, TRY hardcode rejection,
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

const content = loadModule("content/lessons/programming/dictionaries.ts").dictionariesLessonContent;
const activities = loadModule("content/lessons/programming/dictionaries-activities.ts").dictionariesActivities;
const config = loadModule("content/lessons/programming/dictionaries-config.ts", {
  "@/lib/mastery/types": {},
});
const checkRubric = read("content/lessons/programming/dictionaries-instructions.ts");

// === 1. Content ownership: key → value, with the list contrast ===
test("Dictionaries content is complete across every LessonContent field", () => {
  assert.equal(content.slug, "dictionaries");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  for (const term of ["Dictionary", "Key", "Value"]) {
    assert.ok(content.keyTerms.some((item) => item.term === term), `${term} must be a key term`);
  }
  assert.ok(content.commonMistakes.length >= 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  // Ownership: the core student dictionary, key retrieval, the update, and
  // the list-vs-dictionary contrast are taught.
  const text = JSON.stringify(content);
  assert.match(text, /\\"name\\": \\"Arya\\"/);
  assert.match(text, /student\[\\"name\\"\]/);
  assert.match(text, /student\[\\"score\\"\] = 95/);
  assert.match(text, /position/i);
  // Scope guard: no method catalogs, no get(), no JSON.
  for (const banned of ["\\.keys\\(", "\\.items\\(", "\\.values\\(", "\\.get\\(", "JSON"]) {
    assert.ok(!new RegExp(banned).test(text), `${banned} must not appear`);
  }
});

// === 2. TRY requires a real dictionary with key retrieval ===
test("the TRY checker requires a dictionary and rejects separate variables", () => {
  const tryActivity = activities.find((a) => a.id === "try");
  assert.ok(tryActivity, "TRY activity exists");
  const check = tryActivity.checkAnswer;
  assert.equal(check("student = {\"name\": \"Arya\", \"score\": 90}\nprint(student[\"name\"])"), true, "dictionary + key read accepted");
  assert.equal(check("buku = {\"judul\": \"Catatan\", \"halaman\": 12}\nprint(buku[\"judul\"])"), true, "other names/keys accepted");
  assert.equal(check("name = \"Arya\"\nscore = 90\nprint(name)"), false, "separate variables rejected");
  assert.equal(check("print(\"Arya\")"), false, "hardcoded print rejected");
  assert.equal(check("student = {\"name\": \"Arya\"}"), false, "dictionary without key retrieval rejected");
  assert.equal(check("student = {\"name\": \"Arya\", \"score\": 90}\nprint(student[0])"), false, "positional access rejected");
});

// === 3. Mastery and relevance stay inside the lesson-owned vocabulary ===
test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const mastery = config.dictionariesMasteryConfig;
  const allowed = mastery.concepts;
  for (const concept of ["key_value_model", "key_retrieval", "dict_update"]) {
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
  const mastery = config.dictionariesMasteryConfig;
  const relevance = config.dictionariesRelevance;
  const allowed = mastery.concepts;
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["key_value_model", "key_retrieval", "dict_update"]);
  for (const activity of activities) {
    for (const concept of relevance.activityConcepts(activity.concept)) {
      assert.ok(allowed.includes(concept), `${concept} must be a mastery concept`);
    }
  }
  assert.ok(relevance.chatConcepts("cara ambil nilai dari student namanya gimana?").length > 0);
  assert.ok(relevance.chatConcepts("bedanya dictionary sama list apa sih?").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
});

// === 4. Robin Check and Smart Feedback rubrics carry the JSON contract ===
test("Dictionaries rubrics exist with the JSON evaluation contract", () => {
  assert.match(checkRubric, /dictionariesCheckInstructions/);
  assert.match(checkRubric, /position_on_dict_confusion/);
  assert.match(checkRubric, /unquoted_key_confusion/);
  assert.match(checkRubric, /"signal":"strong\|developing\|shaky"/);
  assert.match(checkRubric, /recommendedAction/);
});

// === 5. Localization covers both languages without changing the flow ===
test("ID and EN activities share ids and answers while changing prose", () => {
  const localization = loadModule("content/lessons/programming/dictionaries-localization.ts", {
    "@/lib/robin/check": {},
    getSharedCopy: () => ({}),
    dictionariesActivities: activities,
  });
  for (const language of ["en", "id"]) {
    const localized = localization.getDictionariesActivities(language);
    assert.equal(localized.length, activities.length);
    assert.deepEqual(localized.map((a) => a.id), activities.map((a) => a.id));
    for (let index = 0; index < activities.length; index++) {
      assert.equal(localized[index].code, activities[index].code, `activity ${activities[index].id} keeps its code`);
      if (activities[index].correctAnswer) {
        assert.equal(localized[index].correctAnswer, activities[index].correctAnswer);
      }
    }
  }
  const indonesian = localization.getDictionariesActivities("id");
  const connect = indonesian.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Tuples/, "connect must hand off to the next roadmap lesson");
});

test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["dictionaries",\s*dictionariesDefinition\]/);
  assert.match(registry, /checkQuestion: ['"]Jelasin pakai bahasa lu sendiri: apa beda cara list dan dictionary menyimpan value/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["dictionaries", \{ getActivities: getDictionariesActivities/);
  const loader = read("lib/lessons/dictionaries.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-building-blocks"/);
  assert.match(loader, /"dictionaries"/);
  assert.match(loader, /server-only/);
  assert.equal(existsSync(new URL("content/lessons/programming/dictionaries-instructions.ts", root)), true, "needs Robin Check rubrics");
});

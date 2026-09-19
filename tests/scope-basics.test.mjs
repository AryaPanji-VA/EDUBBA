import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.5 — Module 05 lesson "Scope Basics" (scope-basics): standard
// Phase 20 architecture, local-vs-outside ownership, TRY hardcode rejection,
// mastery/relevance vocabulary, rubrics, and localization. The scope guard is
// strict: no `global` statement, nonlocal, closures, or LEGB.

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

const content = loadModule("content/lessons/programming/scope-basics.ts").scopeBasicsLessonContent;
const activities = loadModule("content/lessons/programming/scope-basics-activities.ts").scopeBasicsActivities;
const config = loadModule("content/lessons/programming/scope-basics-config.ts", {
  "@/lib/mastery/types": {},
});
const checkRubric = read("content/lessons/programming/scope-basics-instructions.ts");

// === 1. Content ownership: local working area vs outside names ===
test("Scope Basics content is complete across every LessonContent field", () => {
  assert.equal(content.slug, "scope-basics");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  for (const term of ["Local variable", "Scope"]) {
    assert.ok(content.keyTerms.some((item) => item.term === term), `${term} must be a key term`);
  }
  assert.ok(content.commonMistakes.length >= 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  // Ownership: the core greet example, the required local-unavailable-outside
  // example, and parameter-as-local-name are taught.
  const text = JSON.stringify(content);
  assert.match(text, /def greet\(\)/);
  assert.match(text, /def make_message\(\)/);
  assert.match(text, /message/);
  // Scope guard: advanced scope mechanics are never mentioned.
  for (const banned of ["nonlocal", "LEGB", "closure", "namespace"]) {
    assert.ok(!new RegExp(banned, "i").test(text), `${banned} must not appear`);
  }
  assert.ok(!/\bglobal\s+\w+\s*=/.test(text) && !/global statement|global keyword/i.test(text), "the global statement is not taught");
});

// === 2. TRY tests local-variable reasoning through a small function ===
test("the TRY checker requires a local variable used inside and rejects outside use", () => {
  const tryActivity = activities.find((a) => a.id === "try");
  assert.ok(tryActivity, "TRY activity exists");
  const check = tryActivity.checkAnswer;
  assert.equal(check("def show():\n    message = \"Halo\"\n    print(message)\n\nshow()"), true, "correct shape accepted");
  assert.equal(check("def show():\n    pesan = \"Hai\"\n    print(pesan)\n\nshow()"), true, "other local names accepted");
  assert.equal(check("def show():\n    message = \"Halo\"\n    print(message)\n\nshow()\nprint(message)"), false, "using the local outside rejected");
  assert.equal(check("def show():\n    print(message)\n\nshow()"), false, "printing an undefined name rejected");
  assert.equal(check("message = \"Halo\"\nprint(message)"), false, "no function rejected");
  assert.equal(check("def show():\n    message = \"Halo\"\n    print(message)"), false, "definition without a call rejected");
});

// === 3. Mastery and relevance stay inside the lesson-owned vocabulary ===
test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const mastery = config.scopeBasicsMasteryConfig;
  const allowed = mastery.concepts;
  for (const concept of ["local_scope", "global_scope", "parameter_local"]) {
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
  const mastery = config.scopeBasicsMasteryConfig;
  const relevance = config.scopeBasicsRelevance;
  const allowed = mastery.concepts;
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["local_scope", "global_scope", "parameter_local"]);
  for (const activity of activities) {
    for (const concept of relevance.activityConcepts(activity.concept)) {
      assert.ok(allowed.includes(concept), `${concept} must be a mastery concept`);
    }
  }
  assert.ok(relevance.chatConcepts("kok message nggak bisa dipakai di luar function?").length > 0);
  assert.ok(relevance.chatConcepts("variable di dalam function hilang setelah dipanggil ya?").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
});

// === 4. Robin Check and Smart Feedback rubrics carry the JSON contract ===
test("Scope Basics rubrics exist with the JSON evaluation contract", () => {
  assert.match(checkRubric, /scopeBasicsCheckInstructions/);
  assert.match(checkRubric, /local_available_outside/);
  assert.match(checkRubric, /assignment_is_global/);
  assert.match(checkRubric, /parameter_is_global/);
  assert.match(checkRubric, /"signal":"strong\|developing\|shaky"/);
  assert.match(checkRubric, /recommendedAction/);
});

// === 5. Localization covers both languages without changing the flow ===
test("ID and EN activities share ids and answers while changing prose", () => {
  const localization = loadModule("content/lessons/programming/scope-basics-localization.ts", {
    "@/lib/robin/check": {},
    getSharedCopy: () => ({}),
    scopeBasicsActivities: activities,
  });
  for (const language of ["en", "id"]) {
    const localized = localization.getScopeBasicsActivities(language);
    assert.equal(localized.length, activities.length);
    assert.deepEqual(localized.map((a) => a.id), activities.map((a) => a.id));
    for (let index = 0; index < activities.length; index++) {
      assert.equal(localized[index].code, activities[index].code, `activity ${activities[index].id} keeps its code`);
      if (activities[index].correctAnswer) {
        assert.equal(localized[index].correctAnswer, activities[index].correctAnswer);
      }
    }
  }
  const indonesian = localization.getScopeBasicsActivities("id");
  const connect = indonesian.find((a) => a.type === "connect");
  assert.match(connect.content.join(" "), /Module 06|Lists/, "connect must hand off to Module 06 · Lists");
});

test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["scope-basics",\s*scopeBasicsDefinition\]/);
  assert.match(registry, /checkQuestion: "Jelasin pakai bahasa lu sendiri: kenapa variable yang dibuat di dalam function nggak bisa dipakai di luar/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["scope-basics", \{ getActivities: getScopeBasicsActivities/);
  const loader = read("lib/lessons/scope-basics.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-building-blocks"/);
  assert.match(loader, /"scope-basics"/);
  assert.match(loader, /server-only/);
  assert.equal(existsSync(new URL("content/lessons/programming/scope-basics-instructions.ts", root)), true, "needs Robin Check rubrics");
});

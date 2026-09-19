import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.5 — Module 05 lesson "Parameters & Arguments" (parameters-arguments):
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

const content = loadModule("content/lessons/programming/parameters-arguments.ts").parametersArgumentsLessonContent;
const activities = loadModule("content/lessons/programming/parameters-arguments-activities.ts").parametersArgumentsActivities;
const config = loadModule("content/lessons/programming/parameters-arguments-config.ts", {
  "@/lib/mastery/types": {},
});
const checkRubric = read("content/lessons/programming/parameters-arguments-instructions.ts");

// === 1. Content ownership: argument → parameter → body uses the value ===
test("Parameters & Arguments content is complete across every LessonContent field", () => {
  assert.equal(content.slug, "parameters-arguments");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  for (const term of ["Parameter", "Argument"]) {
    assert.ok(content.keyTerms.some((item) => item.term === term), `${term} must be a key term`);
  }
  assert.ok(content.commonMistakes.length >= 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  // Ownership: the core greet example and the distinction are taught; return
  // is not (it gets its own lesson).
  const text = JSON.stringify(content);
  assert.match(text, /def greet\(name\)/);
  assert.match(text, /greet\(\\"Arya\\"\)/);
  assert.match(text, /def introduce\(name, age\)/);
  assert.doesNotMatch(text, /return /i);
});

// === 2. TRY requires definition + parameter used + argument supplied ===
test("the TRY checker requires the parameter to be used and rejects hardcoded output", () => {
  const tryActivity = activities.find((a) => a.id === "try");
  assert.ok(tryActivity, "TRY activity exists");
  const check = tryActivity.checkAnswer;
  assert.equal(check("def greet(name):\n    print(\"Hello\", name)\n\ngreet(\"Arya\")"), true, "correct shape accepted");
  assert.equal(check("def sapa(nama):\n    print(nama)\n\nsapa(\"Bima\")"), true, "other names accepted");
  assert.equal(check("def greet(name):\n    print(\"Hello\")\n\ngreet(\"Arya\")"), false, "hardcoded body ignoring the parameter rejected");
  assert.equal(check("print(\"Hello\")"), false, "print without a definition rejected");
  assert.equal(check("def greet(name):\n    print(\"Hello\", name)"), false, "definition without a call rejected");
  assert.equal(check("greet(\"Arya\")"), false, "call without a definition rejected");
});

// === 3. Mastery and relevance stay inside the lesson-owned vocabulary ===
test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const mastery = config.parametersArgumentsMasteryConfig;
  const allowed = mastery.concepts;
  for (const concept of ["parameters_arguments", "argument_flow", "multiple_parameters"]) {
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
  const mastery = config.parametersArgumentsMasteryConfig;
  const relevance = config.parametersArgumentsRelevance;
  const allowed = mastery.concepts;
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["parameters_arguments", "argument_flow", "multiple_parameters"]);
  for (const activity of activities) {
    for (const concept of relevance.activityConcepts(activity.concept)) {
      assert.ok(allowed.includes(concept), `${concept} must be a mastery concept`);
    }
  }
  assert.ok(relevance.chatConcepts("apa beda parameter sama argument?").length > 0);
  assert.ok(relevance.chatConcepts("argument-nya keisi ke parameter yang mana sih?").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
});

// === 4. Robin Check and Smart Feedback rubrics carry the JSON contract ===
test("Parameters & Arguments rubrics exist with the JSON evaluation contract", () => {
  assert.match(checkRubric, /parametersArgumentsCheckInstructions/);
  assert.match(checkRubric, /parameter_argument_confusion/);
  assert.match(checkRubric, /hardcoded_output_confusion/);
  assert.match(checkRubric, /argument_count_mismatch/);
  assert.match(checkRubric, /"signal":"strong\|developing\|shaky"/);
  assert.match(checkRubric, /recommendedAction/);
});

// === 5. Localization covers both languages without changing the flow ===
test("ID and EN activities share ids and answers while changing prose", () => {
  const localization = loadModule("content/lessons/programming/parameters-arguments-localization.ts", {
    "@/lib/robin/check": {},
    getSharedCopy: () => ({}),
    parametersArgumentsActivities: activities,
  });
  for (const language of ["en", "id"]) {
    const localized = localization.getParametersArgumentsActivities(language);
    assert.equal(localized.length, activities.length);
    assert.deepEqual(localized.map((a) => a.id), activities.map((a) => a.id));
    for (let index = 0; index < activities.length; index++) {
      assert.equal(localized[index].code, activities[index].code, `activity ${activities[index].id} keeps its code`);
      if (activities[index].correctAnswer) {
        assert.equal(localized[index].correctAnswer, activities[index].correctAnswer);
      }
    }
  }
  const indonesian = localization.getParametersArgumentsActivities("id");
  const connect = indonesian.find((a) => a.type === "connect");
  assert.match(connect.content[0], /Return Values/, "connect must hand off to the next roadmap lesson");
});

test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["parameters-arguments",\s*parametersArgumentsDefinition\]/);
  assert.match(registry, /checkQuestion: "Jelasin pakai bahasa lu sendiri: apa beda parameter dan argument/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["parameters-arguments", \{ getActivities: getParametersArgumentsActivities/);
  const loader = read("lib/lessons/parameters-arguments.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-building-blocks"/);
  assert.match(loader, /"parameters-arguments"/);
  assert.match(loader, /server-only/);
  assert.equal(existsSync(new URL("content/lessons/programming/parameters-arguments-instructions.ts", root)), true, "needs Robin Check rubrics");
});

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.7 — Module 07 lesson "Mini Project" (mini-project, programming
// course): the Student Score Checker built through five checkpoints, with
// semantic (structural) validation — hardcoded solutions are rejected.

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

const content = loadModule("content/lessons/programming/mini-project.ts").miniProjectLessonContent;
const activities = loadModule("content/lessons/programming/mini-project-activities.ts").miniProjectActivities;
const config = loadModule("content/lessons/programming/mini-project-config.ts", {
  "@/lib/mastery/types": {},
});
const checkRubric = read("content/lessons/programming/mini-project-instructions.ts");

const checkpoint = (id) => activities.find((a) => a.id === id).checkAnswer;

// === 1. Content ownership: a project, assembled from known concepts ===
test("Mini Project content is complete across every LessonContent field", () => {
  assert.equal(content.slug, "mini-project");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  for (const term of ["Checkpoint", "Student Score Checker"]) {
    assert.ok(content.keyTerms.some((item) => item.term === term), `${term} must be a key term`);
  }
  assert.ok(content.commonMistakes.length >= 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  const text = JSON.stringify(content);
  // Required behavior: name + score inputs, safe conversion, threshold, named output.
  assert.match(text, /input\(\\"Student name: \\"\)/);
  assert.match(text, /int\(score_text\)/);
  assert.match(text, /score >= 70/);
  assert.match(text, /\\"Pass\\"/);
  assert.match(text, /\\"Try Again\\"/);
  assert.match(text, /print\(name, result\)/);
  assert.match(text, /except ValueError/);
  // Scope guard: no functions, no collections, single-file CLI only.
  for (const banned of ["def ", "class ", "import ", "list\\(", "dict\\(", "tuple\\("]) {
    assert.ok(!new RegExp(banned, "i").test(text), `${banned} must not appear`);
  }
});

// === 2. Every checkpoint is semantic — hardcoded outputs are rejected ===
test("checkpoint 1 requires two distinct inputs", () => {
  const check = checkpoint("checkpoint-1");
  assert.equal(check("name = input(\"Student name: \")\nscore_text = input(\"Score: \")"), true);
  assert.equal(check("score_text = input(\"Score: \")\nname = input(\"Student name: \")"), true, "either order works");
  assert.equal(check("name = input(\"Student name: \")"), false, "a single input rejected");
  assert.equal(check("name = input(\"Student name: \")\nname = input(\"Score: \")"), false, "same variable twice rejected");
  assert.equal(check("print(\"Student name: \")\nprint(\"Score: \")"), false, "print instead of input rejected");
});

test("checkpoint 2 requires the conversion inside try", () => {
  const check = checkpoint("checkpoint-2");
  assert.equal(check("try:\n    score = int(score_text)"), true);
  assert.equal(check("score = int(score_text)"), false, "unguarded conversion rejected");
  assert.equal(check("try:\n    print(score_text)"), false, "try without the conversion rejected");
});

test("checkpoint 3 requires the >= 70 decision with both results", () => {
  const check = checkpoint("checkpoint-3");
  assert.equal(check("if score >= 70:\n    result = \"Pass\"\nelse:\n    result = \"Try Again\""), true);
  assert.equal(check("if score >= 70:\n        result = \"Pass\"\nelse:\n        result = \"Try Again\""), true, "indent style tolerated");
  assert.equal(check("if score > 70:\n    result = \"Pass\"\nelse:\n    result = \"Try Again\""), false, "wrong threshold rejected");
  assert.equal(check("if score >= 70:\n    print(\"Pass\")\nelse:\n    print(\"Try Again\")"), false, "printing instead of storing rejected");
  assert.equal(check("if score >= 70:\n    result = \"Pass\""), false, "missing else rejected");
});

test("checkpoint 4 requires printing the name with the result", () => {
  const check = checkpoint("checkpoint-4");
  assert.equal(check("print(name, result)"), true);
  assert.equal(check("print(\"Bima Pass\")"), false, "hardcoded output rejected");
  assert.equal(check("print(result)"), false, "name lost rejected");
  assert.equal(check("print()"), false, "empty print rejected");
});

test("checkpoint 5 requires the specific ValueError fallback", () => {
  const check = checkpoint("checkpoint-5");
  assert.equal(check("except ValueError:\n    print(\"Score must be a number\")"), true);
  assert.equal(check("except:\n    print(\"Score must be a number\")"), false, "bare except rejected");
  assert.equal(check("except Exception:\n    print(\"Score must be a number\")"), false, "broad Exception rejected");
  assert.equal(check("except ValueError:\n    pass"), false, "missing fallback print rejected");
});

// === 3. Mastery and relevance stay inside the lesson-owned vocabulary ===
test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const mastery = config.miniProjectMasteryConfig;
  const allowed = mastery.concepts;
  for (const concept of ["project_inputs", "safe_conversion", "decision_output"]) {
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
  const mastery = config.miniProjectMasteryConfig;
  const relevance = config.miniProjectRelevance;
  const allowed = mastery.concepts;
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["project_inputs", "safe_conversion", "decision_output"]);
  for (const activity of activities) {
    for (const concept of relevance.activityConcepts(activity.concept)) {
      assert.ok(allowed.includes(concept), `${concept} must be a mastery concept`);
    }
  }
  assert.ok(relevance.chatConcepts("kalau nilainya 70, dia pass atau try again?").length > 0);
  assert.ok(relevance.chatConcepts("kenapa int-nya harus di dalam try?").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
});

// === 4. Robin Check and Smart Feedback rubrics carry the JSON contract ===
test("Mini Project rubrics exist with the JSON evaluation contract", () => {
  assert.match(checkRubric, /miniProjectCheckInstructions/);
  assert.match(checkRubric, /hardcoded_output/);
  assert.match(checkRubric, /conversion_skipped/);
  assert.match(checkRubric, /missing_result_line/);
  assert.match(checkRubric, /bare_except_confusion/);
  assert.match(checkRubric, /"signal":"strong\|developing\|shaky"/);
  assert.match(checkRubric, /recommendedAction/);
});

// === 5. Localization covers both languages without changing the flow ===
test("ID and EN activities share ids and answers while changing prose", () => {
  const localization = loadModule("content/lessons/programming/mini-project-localization.ts", {
    "@/lib/robin/check": {},
    getSharedCopy: () => ({}),
    miniProjectActivities: activities,
  });
  for (const language of ["en", "id"]) {
    const localized = localization.getMiniProjectActivities(language);
    assert.equal(localized.length, activities.length);
    assert.deepEqual(localized.map((a) => a.id), activities.map((a) => a.id));
    for (let index = 0; index < activities.length; index++) {
      assert.equal(localized[index].code, activities[index].code, `activity ${activities[index].id} keeps its code`);
      if (activities[index].correctAnswer) {
        assert.equal(localized[index].correctAnswer, activities[index].correctAnswer);
      }
    }
  }
  const indonesian = localization.getMiniProjectActivities("id");
  const connect = indonesian.find((a) => a.type === "connect");
  assert.match(connect.content.join(" "), /Course Review/, "connect must hand off to Course Review");
});

test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["mini-project",\s*miniProjectDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["mini-project", \{ getActivities: getMiniProjectActivities/);
  const loader = read("lib/lessons/mini-project.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-putting-it-together"/);
  assert.match(loader, /"mini-project"/);
  assert.match(loader, /server-only/);
  assert.equal(existsSync(new URL("content/lessons/programming/mini-project-instructions.ts", root)), true, "needs Robin Check rubrics");
});

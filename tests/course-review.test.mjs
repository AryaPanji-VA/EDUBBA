import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.7 — Module 07 lesson "Course Review / Final Practice"
// (course-review, programming course): capstone retrieval over six concept
// families, a combined final challenge, and a clean course-complete close.

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

const content = loadModule("content/lessons/programming/course-review.ts").courseReviewLessonContent;
const activities = loadModule("content/lessons/programming/course-review-activities.ts").courseReviewActivities;
const config = loadModule("content/lessons/programming/course-review-config.ts", {
  "@/lib/mastery/types": {},
});
const checkRubric = read("content/lessons/programming/course-review-instructions.ts");

// === 1. Content ownership: retrieval over all six families, no trivia dump ===
test("Course Review content is complete across every LessonContent field", () => {
  assert.equal(content.slug, "course-review");
  assert.ok(content.intuitiveExplanation.length >= 3);
  assert.ok(content.academicExplanation.length >= 3);
  assert.equal(content.codeExamples.length, 4);
  for (const example of content.codeExamples) {
    assert.ok(example.code.trim() && example.title.trim() && example.explanation.trim());
  }
  assert.ok(content.keyTerms.length >= 6);
  for (const term of ["Concept family", "Final challenge"]) {
    assert.ok(content.keyTerms.some((item) => item.term === term), `${term} must be a key term`);
  }
  assert.ok(content.commonMistakes.length >= 5);
  assert.ok(content.quickChecks.length >= 3);
  for (const check of content.quickChecks) {
    assert.ok(check.options.includes(check.answer), "quick check answer must be one of its options");
  }
  const text = JSON.stringify(content);
  // The six concept families are named.
  for (const family of ["variables", "conditionals", "for", "functions", "list", "dictionary", "tuple", "set", "errors", "decomposition"]) {
    assert.ok(new RegExp(family, "i").test(text), `${family} must be reviewed`);
  }
  // Honest closing: foundations, not mastery.
  assert.match(text, /foundations/i);
  // No new syntax, no Module 08.
  for (const banned of ["lambda", "class ", "def ", "Module 08"]) {
    assert.ok(!new RegExp(banned, "i").test(text), `${banned} must not appear`);
  }
});

// === 2. The final practice mixes styles across families ===
test("final practice predicts across values, loops, and collections", () => {
  const predicts = activities.filter((a) => a.type === "predict");
  assert.ok(predicts.length >= 4, "multiple predict styles exist");
  const concepts = new Set(predicts.map((a) => a.concept));
  for (const concept of ["values_and_logic_recall", "repetition_and_reuse_recall", "collections_and_integration"]) {
    assert.ok(concepts.has(concept), `${concept} must be exercised`);
  }
  for (const predict of predicts) {
    assert.ok(predict.options.includes(predict.correctAnswer));
    assert.ok(predict.explanation);
  }
});

// === 3. TRY is the combined final challenge — semantic, no hardcoding ===
test("the TRY final challenge requires list + for + if + print", () => {
  const tryActivity = activities.find((a) => a.id === "try");
  assert.ok(tryActivity, "TRY activity exists");
  const check = tryActivity.checkAnswer;
  assert.equal(check("scores = [55, 72, 68, 90, 70]\nfor score in scores:\n    if score >= 70:\n        print(score)"), true, "list + for + if + print accepted");
  assert.equal(check("nilai = [55, 72, 68, 90, 70]\nfor n in nilai:\n    if n >= 70:\n        print(n)"), true, "other names accepted");
  assert.equal(check("scores = [55, 72, 68, 90, 70]\nprint(72)\nprint(90)\nprint(70)"), false, "hardcoded prints rejected");
  assert.equal(check("scores = [55, 72, 68, 90, 70]\nfor score in scores:\n    print(score)"), false, "missing if rejected");
  assert.equal(check("scores = [55, 72, 68, 90, 70]\nfor score in scores:\n    if score > 70:\n        print(score)"), false, "wrong threshold rejected");
  assert.equal(check("scores = [55, 72, 68, 90, 70]\nprint([score for score in scores if score >= 70])"), false, "comprehension rejected");
  assert.equal(check("scores = [55, 72, 68, 90, 70]\ni = 0\nwhile i < len(scores):\n    if scores[i] >= 70:\n        print(scores[i])\n    i = i + 1"), false, "while variant rejected");
});

// === 4. Mastery and relevance stay inside the lesson-owned vocabulary ===
test("mastery mapping stays inside the lesson-owned concept vocabulary", () => {
  const mastery = config.courseReviewMasteryConfig;
  const allowed = mastery.concepts;
  for (const concept of ["values_and_logic_recall", "repetition_and_reuse_recall", "collections_and_integration"]) {
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
  const mastery = config.courseReviewMasteryConfig;
  const relevance = config.courseReviewRelevance;
  const allowed = mastery.concepts;
  assert.deepEqual(Array.from(relevance.checkConcepts()), ["values_and_logic_recall", "repetition_and_reuse_recall", "collections_and_integration"]);
  for (const activity of activities) {
    for (const concept of relevance.activityConcepts(activity.concept)) {
      assert.ok(allowed.includes(concept), `${concept} must be a mastery concept`);
    }
  }
  assert.ok(relevance.chatConcepts("kok totalnya 12 padahal loop-nya pendek?").length > 0);
  assert.ok(relevance.chatConcepts("kapan pilih set dibanding list?").length > 0);
  assert.equal(relevance.chatConcepts("halo apa kabar").length, 0);
});

// === 5. Robin Check and Smart Feedback rubrics carry the JSON contract ===
test("Course Review rubrics exist with the JSON evaluation contract", () => {
  assert.match(checkRubric, /courseReviewCheckInstructions/);
  assert.match(checkRubric, /logic_trace_confusion/);
  assert.match(checkRubric, /loop_confusion/);
  assert.match(checkRubric, /collection_mismatch/);
  assert.match(checkRubric, /new_syntax_assumption/);
  assert.match(checkRubric, /"signal":"strong\|developing\|shaky"/);
  assert.match(checkRubric, /recommendedAction/);
});

// === 6. Localization covers both languages without changing the flow ===
test("ID and EN activities share ids and answers while changing prose", () => {
  const localization = loadModule("content/lessons/programming/course-review-localization.ts", {
    "@/lib/robin/check": {},
    getSharedCopy: () => ({}),
    courseReviewActivities: activities,
  });
  for (const language of ["en", "id"]) {
    const localized = localization.getCourseReviewActivities(language);
    assert.equal(localized.length, activities.length);
    assert.deepEqual(localized.map((a) => a.id), activities.map((a) => a.id));
    for (let index = 0; index < activities.length; index++) {
      assert.equal(localized[index].code, activities[index].code, `activity ${activities[index].id} keeps its code`);
      if (activities[index].correctAnswer) {
        assert.equal(localized[index].correctAnswer, activities[index].correctAnswer);
      }
    }
  }
  const indonesian = localization.getCourseReviewActivities("id");
  const connect = indonesian.find((a) => a.type === "connect");
  assert.match(connect.content.join(" "), /Course Complete/, "the final connect closes the course");
  assert.doesNotMatch(connect.content.join(" "), /Module 08/, "no Module 08 teaser");
});

test("the lesson is registered with ownership, display, loader, and rubrics", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["course-review",\s*courseReviewDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["course-review", \{ getActivities: getCourseReviewActivities/);
  const loader = read("lib/lessons/course-review.ts");
  assert.match(loader, /"programming"/);
  assert.match(loader, /"programming-putting-it-together"/);
  assert.match(loader, /"course-review"/);
  assert.match(loader, /server-only/);
  assert.equal(existsSync(new URL("content/lessons/programming/course-review-instructions.ts", root)), true, "needs Robin Check rubrics");
});

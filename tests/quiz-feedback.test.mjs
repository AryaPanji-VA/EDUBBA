import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Load the module under test by stripping TypeScript types and running it in a VM
// with stubbed dependencies, mirroring the robin-check.test.mjs pattern.
const moduleSource = stripTypeScriptTypes(readFileSync(new URL("../lib/robin/quiz-feedback.ts", import.meta.url), "utf8"), { mode: "transform" })
  .replace(/import \{[^}]+\} from "[^"]+";/g, "")
  .replace(/export /g, "") +
  "\nexports.validateQuizFeedbackRequest = validateQuizFeedbackRequest;" +
  "\nexports.gradeActivity = gradeActivity;" +
  "\nexports.parseQuizFeedbackResult = parseQuizFeedbackResult;" +
  "\nexports.quizMisconceptions = quizMisconceptions;";
const exports = {};
vm.runInNewContext(moduleSource, {
  exports,
  isListenersAnswerCorrect: (answer) => /^listeners\s*=\s*(150|listeners\s*\+\s*30)$/.test(answer.trim()),
});
const { validateQuizFeedbackRequest, gradeActivity, parseQuizFeedbackResult, quizMisconceptions } = exports;

// --- Test data: minimal activity shapes matching the real content model ---
const predictActivity = {
  id: "reassignment", type: "predict", concept: "reassignment",
  options: ["92", "110", "92 and 110", "Error"], correctAnswer: "110",
  learningPurpose: "Detect reassignment understanding.",
  misconceptionsByAnswer: { "92": "first_assignment_persists", "92 and 110": "assignment_history", "Error": "reassignment_invalid" },
};
const practiceActivity = {
  id: "try", type: "practice", concept: "reassignment",
  learningPurpose: "Detect reassignment line writing.",
};
const nonObjectiveActivity = { id: "intro", type: "intro", concept: "named_values" };

const validRequest = { activityId: "reassignment", lessonSlug: "variables", language: "en", learnerAnswer: "92", attemptId: "test-attempt-1" };
const validResult = { feedback: "You got it.", followUp: null, diagnosedMisconception: null };
const request = (body) => new Request("http://localhost/api/robin/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

function route({ configured = true, recordEvidence = async () => {}, provider = async () => ({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(validResult) } }] }) } = {}) {
  const dependencies = {
    "@/lib/ai/server": { getAIConfig: () => ({ configured, model: "test-model" }), createServerAIClient: () => ({ chat: { completions: { create: provider } } }) },
    "@/content/lessons/programming/variables-activities": { variablesActivities: [predictActivity, practiceActivity, nonObjectiveActivity] },
    "@/lib/robin/quiz-feedback-instructions": { quizFeedbackInstructions: "server-controlled rubric" },
    "@/lib/robin/quiz-feedback": { validateQuizFeedbackRequest, gradeActivity, parseQuizFeedbackResult },
    "@/lib/mastery/types": { activityConceptToMastery: (concept) => ({ reassignment: "reassignment", reading_a_name: "variable" })[concept] ?? null },
    "@/lib/mastery/server": { recordEvidence },
    "@/lib/adaptation/server": { loadAdaptationContext: async () => "" },
    "@/lib/adaptation/relevance": { relevantActivityConcepts: () => ["reassignment", "variable", "name_binding"] },
  };
  const code = stripTypeScriptTypes(readFileSync(new URL("../app/api/robin/feedback/route.ts", import.meta.url), "utf8"), { mode: "transform" })
    .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");')
    .replace(/export /g, "") + "\nexports.POST = POST;";
  const routeExports = {};
  vm.runInNewContext(code, { exports: routeExports, Response, TextDecoder, console: { warn: (message) => assert.equal(message, "[ROBIN MASTERY] Evidence recording unavailable; continuing feedback.") }, require: (name) => {
    assert.ok(name in dependencies, `Unexpected dependency (including memory): ${name}`);
    return dependencies[name];
  } });
  return routeExports.POST;
}

// === 1. Request validation ===
test("request validation accepts valid and rejects malformed input", () => {
  assert.ok(validateQuizFeedbackRequest(validRequest));
  for (const input of [
    null, [], { ...validRequest, activityId: "" }, { ...validRequest, activityId: 123 },
    { ...validRequest, lessonSlug: "functions" }, { ...validRequest, language: "fr" },
    { ...validRequest, learnerAnswer: "" }, { ...validRequest, learnerAnswer: "x".repeat(2001) },
    { ...validRequest, attemptId: "" }, { ...validRequest, extra: "field" }, { ...validRequest, isCorrect: true },
  ]) assert.equal(validateQuizFeedbackRequest(input), null);
});

test("grading records evidence before inference, and inference failure preserves evidence", async () => {
  const events = [];
  const post = route({
    recordEvidence: async (...args) => { events.push("mastery"); assert.deepEqual(args, ["variables", "reassignment", "incorrect_prediction", validRequest.attemptId]); },
    provider: async () => { events.push("ai"); throw new Error("private error"); },
  });
  assert.equal((await post(request(validRequest))).status, 502);
  assert.deepEqual(events, ["mastery", "ai"]);
});

test("mastery failure logs safely and still returns parsed AI feedback", async () => {
  const response = await route({ recordEvidence: async () => { throw new Error("private database credential"); } })(request(validRequest));
  assert.equal(response.status, 200);
  checkResult((await response.json()).result, validResult);
});

test("missing or malformed attempt IDs stop before evidence and inference", async () => {
  const unexpected = () => assert.fail("must not execute");
  const post = route({ recordEvidence: unexpected, provider: unexpected });
  for (const attemptId of [undefined, null, 123, {}, "", " ", "x".repeat(101)]) {
    assert.equal((await post(request({ ...validRequest, attemptId }))).status, 400);
  }
});

// === 2. Deterministic grading stays deterministic ===
test("predict grading compares against the stored correct answer", () => {
  assert.equal(gradeActivity(predictActivity, "110").isCorrect, true);
  assert.equal(gradeActivity(predictActivity, "92").isCorrect, false);
  assert.equal(gradeActivity(predictActivity, "92 and 110").isCorrect, false);
});
test("practice grading reuses isListenersAnswerCorrect for both accepted forms", () => {
  assert.equal(gradeActivity(practiceActivity, "listeners = 150").isCorrect, true);
  assert.equal(gradeActivity(practiceActivity, "listeners = listeners + 30").isCorrect, true);
  assert.equal(gradeActivity(practiceActivity, "listeners = 120").isCorrect, false);
});
test("non-objective activities return null grading", () => {
  assert.equal(gradeActivity(nonObjectiveActivity, "anything"), null);
});

// === 3. Misconception lookup from wrong answer ===
test("misconception lookup maps wrong predict answers and nulls correct ones", () => {
  assert.equal(gradeActivity(predictActivity, "110").likelyMisconception, null);
  assert.equal(gradeActivity(predictActivity, "92").likelyMisconception, "first_assignment_persists");
  assert.equal(gradeActivity(predictActivity, "92 and 110").likelyMisconception, "assignment_history");
  assert.equal(gradeActivity(predictActivity, "Error").likelyMisconception, "reassignment_invalid");
});
test("practice activities have no misconception mapping", () => {
  assert.equal(gradeActivity(practiceActivity, "listeners = 120").likelyMisconception, null);
});

// === 4. Result parser ===
function checkResult(actual, expected) {
  assert.equal(actual.feedback, expected.feedback);
  assert.equal(actual.diagnosedMisconception, expected.diagnosedMisconception);
  if (expected.followUp === null) assert.equal(actual.followUp, null);
  else { assert.equal(actual.followUp.prompt, expected.followUp.prompt); assert.equal(actual.followUp.code, expected.followUp.code); assert.deepEqual(actual.followUp.options, expected.followUp.options); }
}
test("result parser accepts valid results and rejects malformed output", () => {
  checkResult(parseQuizFeedbackResult(JSON.stringify(validResult), false), validResult);
  for (const value of [
    "not JSON", "null", "[]",
    JSON.stringify({ ...validResult, extra: "x" }),
    JSON.stringify({ feedback: "", followUp: null, diagnosedMisconception: null }),
    JSON.stringify({ ...validResult, feedback: "x".repeat(1201) }),
    JSON.stringify({ ...validResult, feedback: "http://evil.com" }),
    JSON.stringify({ ...validResult, feedback: "50% correct" }),
    JSON.stringify({ ...validResult, diagnosedMisconception: "unknown_code" }),
    JSON.stringify({ ...validResult, followUp: { prompt: "", code: "", options: [] } }),
    JSON.stringify({ ...validResult, followUp: { prompt: "p", code: "c", options: ["a"] } }),
    JSON.stringify({ ...validResult, followUp: { prompt: "p", code: "c", options: ["a", "a"] } }),
    JSON.stringify({ ...validResult, followUp: { prompt: "p", code: "c", options: ["a", "b", "c", "d", "e"] } }),
    JSON.stringify({ ...validResult, followUp: { prompt: "p".repeat(301), code: "c", options: ["a", "b"] } }),
  ]) assert.throws(() => parseQuizFeedbackResult(value, false));
});
test("correct answer with followUp is rejected", () => {
  const withFollowUp = { feedback: "yep", followUp: { prompt: "q", code: "x=1", options: ["1", "2"] }, diagnosedMisconception: null };
  assert.throws(() => parseQuizFeedbackResult(JSON.stringify(withFollowUp), true));
  assert.doesNotThrow(() => parseQuizFeedbackResult(JSON.stringify(withFollowUp), false));
});
test("correct answer with null followUp passes", () => {
  checkResult(parseQuizFeedbackResult(JSON.stringify(validResult), true), validResult);
});

// === 5. Route behavior with provider doubles ===
test("route rejects unknown activity IDs and non-objective types", async () => {
  const post = route();
  assert.equal((await post(request({ ...validRequest, activityId: "nonexistent" }))).status, 400);
  assert.equal((await post(request({ ...validRequest, activityId: "intro" }))).status, 400);
});
test("route validates before provider use and bounds the streamed body", async () => {
  let calls = 0;
  const post = route({ provider: () => { calls++; throw new Error("unexpected"); } });
  assert.equal((await post(request({ ...validRequest, learnerAnswer: "" }))).status, 400);
  assert.equal((await post(request({ ...validRequest, learnerAnswer: "x".repeat(13000) }))).status, 413);
  assert.equal((await post(new Request("http://localhost/api/robin/feedback", { method: "POST", body: "plain" }))).status, 415);
  assert.equal(calls, 0);
});
test("provider errors, missing configuration and malformed output fail without secret disclosure", async () => {
  for (const post of [
    route({ configured: false }),
    route({ provider: () => { throw new Error("private-test-credential Authorization cookie"); } }),
    route({ provider: async () => ({ choices: [{ finish_reason: "stop", message: { content: "bad JSON" } }] }) }),
  ]) {
    const response = await post(request(validRequest));
    assert.ok(response.status >= 500);
    assert.equal(await response.text(), '{"error":"QUIZ_FEEDBACK_UNAVAILABLE"}');
  }
});
test("success uses model + messages only, server rubric, and no memory dependency", async () => {
  let payload;
  const response = await route({ provider: async (body) => { payload = body; return { choices: [{ finish_reason: "stop", message: { content: JSON.stringify(validResult) } }] }; } })(request(validRequest));
  assert.equal(response.status, 200);
  assert.equal(Object.keys(payload).sort().join(","), "messages,model");
  assert.equal(payload.messages[0].content, "server-controlled rubric");
  checkResult((await response.json()).result, validResult);
});
test("server reconstructs correctness from activity data, not client claims", async () => {
  let quizContext;
  const post = route({ provider: async (body) => {
    quizContext = JSON.parse(body.messages[1].content.split(":\n")[1]);
    return { choices: [{ finish_reason: "stop", message: { content: JSON.stringify(validResult) } }] };
  } });
  // Client sends learnerAnswer "110" (correct) — server must determine isCorrect=true
  await post(request({ ...validRequest, learnerAnswer: "110" }));
  assert.equal(quizContext.isCorrect, true);
  assert.equal(quizContext.likelyMisconception, null);
  // Client sends learnerAnswer "92" (wrong) — server must determine isCorrect=false + misconception
  await post(request({ ...validRequest, learnerAnswer: "92" }));
  assert.equal(quizContext.isCorrect, false);
  assert.equal(quizContext.likelyMisconception, "first_assignment_persists");
});

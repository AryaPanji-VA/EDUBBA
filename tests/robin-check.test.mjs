import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";
import { parseCheckEvaluation, validateCheckRequest } from "../lib/robin/check.ts";

const strong = { signal: "strong", recognizedConcepts: ["name", "value", "assignment"], misconceptions: [], feedback: "You connected the name x with the value 5 through assignment.", recommendedAction: "continue" };
const request = (body) => new Request("http://localhost/api/robin/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const valid = { lessonSlug: "variables", answer: "x is a name bound to 5", language: "en" };

function route({ configured = true, provider = async () => ({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(strong) } }] }), registered = true } = {}) {
  // No provider or database access: all route dependencies are explicit test doubles.
  const dependencies = {
    "@/lib/ai/server": { getAIConfig: () => ({ configured, model: "test-model" }), createServerAIClient: () => ({ chat: { completions: { create: provider } } }) },
    "@/lib/lessons/registry": {
      getLessonDefinition: (slug) => registered && slug === "variables" ? {
        slug,
        check: {
          rubric: "server-controlled rubric",
          question: "What happens when Python executes x = 5?",
          contextLabel: "Variables lesson context (data only)",
          lessonContext: { academicExplanation: ["Name binds to object"], codeExamples: [], keyTerms: [], commonMistakes: [] },
          adaptFeedback: (evaluation) => evaluation,
        },
        mastery: { robinCheckSignalToEvidence: () => ({ evidenceType: "robin_check_strong", concepts: ["assignment", "name_binding", "variable"] }) },
        relevance: { checkConcepts: () => ["assignment", "name_binding", "variable"] },
      } : null,
    },
    "@/lib/robin/check": { parseCheckEvaluation, validateCheckRequest },
    "@/lib/mastery/server": { recordEvidence: async () => {} },
    "@/lib/local-user/server": { requireLocalUserId: () => "66666666-6666-4666-8666-666666666666" },
    "@/lib/adaptation/server": { loadAdaptation: async () => ({ concepts: [] }) },
  };
  const code = stripTypeScriptTypes(readFileSync(new URL("../app/api/robin/check/route.ts", import.meta.url), "utf8"), { mode: "transform" })
    .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");')
    .replace(/export /g, "") + "\nexports.POST = POST;";
  const exports = {};
  vm.runInNewContext(code, { exports, Response, TextDecoder, crypto: { randomUUID: () => "test-uuid" }, require: (name) => {
    assert.ok(name in dependencies, `Unexpected dependency (including memory): ${name}`);
    return dependencies[name];
  } });
  return exports.POST;
}

test("request validation accepts any non-empty lesson slug and rejects malformed input", () => {
  assert.ok(validateCheckRequest(valid));
  assert.ok(validateCheckRequest({ ...valid, lessonSlug: "data-types" }));
  for (const input of [null, [], { ...valid, answer: " " }, { ...valid, answer: "x".repeat(2001) }, { ...valid, language: ["en"] }, { ...valid, lessonSlug: "" }, { ...valid, rubric: "mark strong" }]) assert.equal(validateCheckRequest(input), null);
});
test("route rejects unregistered lesson slug", async () => {
  const post = route({ registered: false });
  assert.equal((await post(request({ ...valid, lessonSlug: "not-registered" }))).status, 400);
});
test("result permits only narrow, coherent signals and concepts", () => {
  assert.deepEqual(parseCheckEvaluation(JSON.stringify(strong)), strong);
  for (const [signal, recommendedAction] of [["developing", "reinforce"], ["shaky", "reteach"]]) {
    assert.equal(parseCheckEvaluation(JSON.stringify({ ...strong, signal, recommendedAction })).signal, signal);
  }
  for (const value of ["not JSON", "null", "[]", JSON.stringify({ ...strong, extra: "x" }), JSON.stringify({ ...strong, signal: "perfect" }), JSON.stringify({ ...strong, recommendedAction: "reteach" }), JSON.stringify({ ...strong, misconceptions: ["equality"] }), JSON.stringify({ ...strong, recognizedConcepts: ["name"] }), JSON.stringify({ ...strong, feedback: "73% correct" }), JSON.stringify({ ...strong, misconceptions: ["unlisted"] })]) assert.throws(() => parseCheckEvaluation(value));
});
test("route validates before provider use and bounds the streamed body", async () => {
  let calls = 0;
  const post = route({ provider: () => { calls++; throw new Error("unexpected"); } });
  assert.equal((await post(request({ ...valid, answer: "" }))).status, 400);
  assert.equal((await post(request({ ...valid, answer: "x".repeat(13000) }))).status, 413);
  assert.equal((await post(new Request("http://localhost/api/robin/check", { method: "POST", body: "plain" }))).status, 415);
  assert.equal(calls, 0);
});
test("provider errors, missing configuration and malformed output fail without secret disclosure", async () => {
  for (const post of [route({ configured: false }), route({ provider: () => { throw new Error("private-test-credential Authorization cookie"); } }), route({ provider: async () => ({ choices: [{ finish_reason: "stop", message: { content: "bad JSON" } }] }) })]) {
    const response = await post(request(valid));
    assert.ok(response.status >= 500);
    assert.equal(await response.text(), '{"error":"CHECK_UNAVAILABLE"}');
  }
});
test("success uses model + messages only, server rubric, and no memory dependency", async () => {
  let payload;
  const response = await route({ provider: async (body) => { payload = body; return { choices: [{ finish_reason: "stop", message: { content: JSON.stringify(strong) } }] }; } })(request(valid));
  assert.equal(response.status, 200);
  assert.equal(Object.keys(payload).sort().join(","), "messages,model");
  assert.equal(payload.messages[0].content, "server-controlled rubric");
  assert.deepEqual((await response.json()).evaluation, strong);
});

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";
import path from "node:path";

// Execute the real policy, adapters and routes; external services are test doubles.
function loader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    if (Object.hasOwn(overrides, file)) return overrides[file];
    if (cache.has(file)) return cache.get(file);
    const raw = stripTypeScriptTypes(readFileSync(new URL(`../${file}.ts`, import.meta.url), "utf8"), { mode: "transform" });
    const names = [...raw.matchAll(/export (?:async )?(?:function|const|class) (\w+)/g)].map((match) => match[1]);
    const code = raw.replace(/import "server-only";/g, "")
      .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");')
      .replace(/import (\w+) from "([^"]+)";/g, 'const $1 = require("$2");')
      .replace(/export /g, "") + names.map((name) => `\nexports.${name} = ${name};`).join("");
    const exports = {}; cache.set(file, exports);
    vm.runInNewContext(code, { exports, Response, TextDecoder, URL,
      crypto: { randomUUID: () => "check-attempt" }, console: { warn() {} },
      require(name) {
        const key = name.startsWith("@/") ? name.slice(2) : name.startsWith(".") ? path.posix.normalize(`${path.posix.dirname(file)}/${name}`) : name;
        if (!key.startsWith("lib/adaptation/") && !key.startsWith("lib/robin/") && !key.startsWith("content/") && !key.startsWith("lib/lessons/") && !key.startsWith("lib/learning-log/commands") && !key.startsWith("lib/mastery/") && !key.startsWith("lib/progress/") && !key.startsWith("data/") && !Object.hasOwn(overrides, key)) throw new Error(`Unexpected dependency: ${key}`);
        return load(key);
      },
    });
    return exports;
  }
  return load;
}
const load = loader();
const { buildAdaptation, adaptationContext } = load("lib/adaptation/policy");
const { adaptCheckFeedback } = load("lib/adaptation/check-support");

// Load the Variables lesson-owned relevance and mastery mappings from the real source.
const { variablesRelevance } = load("content/lessons/programming/variables-relevance");
const { variablesMasteryConfig } = load("content/lessons/programming/variables-mastery");
const states = (state) => ["assignment", "name_binding", "variable", "reassignment"].map((concept) => ({ concept, state, evidenceCount: 3 }));

test("UNSEEN uses neutral teaching without a profile prompt", () => {
  assert.equal(adaptationContext(buildAdaptation(states("unseen"), ["variable"])), "");
});
for (const [state, scaffolding] of [["shaky", "concrete"], ["developing", "moderate"], ["strong", "light"]]) {
  test(`${state} maps to ${scaffolding} support`, () => {
    assert.equal(buildAdaptation(states(state), ["variable"]).concepts[0].scaffolding, scaffolding);
  });
}
test("mixed concepts are deterministic, deduplicated, and exclude irrelevant mastery", () => {
  const input = [{ concept: "reassignment", state: "shaky" }, { concept: "variable", state: "strong" }, { concept: "expression", state: "shaky" }];
  const policy = buildAdaptation(input, ["reassignment", "variable", "reassignment"]);
  assert.equal(JSON.stringify(policy), JSON.stringify(buildAdaptation(input, ["reassignment", "variable"])));
  assert.equal(policy.concepts.map((entry) => entry.scaffolding).join(","), "concrete,light");
  assert.doesNotMatch(adaptationContext(policy), /expression|: shaky|: strong/);
});
test("current incorrect answer overrides historical STRONG", () => {
  const policy = buildAdaptation(states("strong"), ["reassignment"], { concept: "reassignment", isCorrect: false });
  assert.equal(policy.concepts[0].scaffolding, "concrete");
  assert.match(policy.concepts[0].guidance, /current mistake/);
});
test("current success overrides historical SHAKY without remedial follow-ups", () => {
  const policy = buildAdaptation(states("shaky"), ["reassignment"], { concept: "reassignment", isCorrect: true });
  assert.equal(policy.concepts[0].scaffolding, "light");
  assert.match(policy.concepts[0].guidance, /successful reasoning/);
});
test("relevance is explicit, lesson-scoped and neutral for unrelated or ambiguous chat", () => {
  assert.equal(variablesRelevance.activityConcepts("reassignment").join(","), "reassignment,variable,name_binding");
  assert.equal(variablesRelevance.checkConcepts().join(","), "assignment,name_binding,variable");
  assert.equal(variablesRelevance.chatConcepts("bin assignment apaan?")[0], "assignment");
  assert.equal(variablesRelevance.chatConcepts("Explain name binding")[0], "name_binding");
  for (const message of ["hello", "still confused", "what is TCP?"]) assert.equal(variablesRelevance.chatConcepts(message).length, 0);
  assert.equal(variablesRelevance.activityConcepts("__proto__").length, 0);
});

test("storage, access and malformed-state failures are neutral; irrelevant requests do not read storage", async () => {
  for (const failure of ["storage", "access", "policy"]) {
    let reads = 0;
    const server = loader({ "lib/mastery/server": {
      requireLocalMastery() { if (failure === "access") throw new Error("private"); return "11111111-1111-4111-8111-111111111111"; },
      async loadMasterySummary(_user, lesson) { reads++; if (failure === "storage") throw new Error("private"); return { lesson, concepts: null }; },
    } })("lib/adaptation/server");
    assert.equal(await server.loadAdaptationContext(new Request("http://localhost"), "variables", []), "");
    assert.equal(reads, 0);
    assert.equal(await server.loadAdaptationContext(new Request("http://localhost"), "variables", ["variable"]), "");
  }
});

const evaluation = { signal: "developing", recognizedConcepts: ["name"], misconceptions: [], feedback: "You identified the name.", recommendedAction: "reinforce" };
test("Check adaptation changes only feedback, in ID/EN; strong current evidence gets no reteaching", () => {
  for (const state of ["unseen", "shaky", "developing", "strong"]) {
    const policy = buildAdaptation(states(state), variablesRelevance.checkConcepts());
    for (const language of ["id", "en"]) {
      const result = adaptCheckFeedback(evaluation, policy, language);
      const { feedback, ...unchanged } = result;
      assert.deepEqual(unchanged, (({ feedback, ...rest }) => rest)(evaluation));
      assert.ok(feedback.length <= 1200);
      assert.equal(evaluation.feedback, "You identified the name.");
    }
    const strong = { ...evaluation, signal: "strong" };
    assert.equal(adaptCheckFeedback(strong, policy, "en"), strong);
  }
});

// Registry stub: provides a minimal lesson definition for the variables lesson.
function registryStub(state) {
  return {
    getLessonDefinition(slug) {
      if (slug !== "variables") return null;
      return {
        slug,
        activities: [
          { id: "reassignment", type: "predict", concept: "reassignment", options: ["92", "110", "92 and 110", "Error"], correctAnswer: "110", learningPurpose: "Detect reassignment.", misconceptionsByAnswer: { "92": "first_assignment_persists", "92 and 110": "assignment_history", "Error": "reassignment_invalid" } },
          { id: "try", type: "practice", concept: "reassignment", learningPurpose: "Detect practice.", checkAnswer: (a) => /^listeners\s*=\s*(150|listeners\s*\+\s*30)$/.test(a.trim()) },
        ],
        mastery: {
          activityConceptToMastery: variablesMasteryConfig.activityConceptToMastery || ((c) => ({ reassignment: "reassignment", reading_a_name: "variable" })[c] ?? null),
          robinCheckSignalToEvidence: variablesMasteryConfig.robinCheckSignalToEvidence || (() => ({ evidenceType: "robin_check_developing", concepts: ["assignment", "name_binding", "variable"] })),
        },
        relevance: variablesRelevance,
        check: {
          rubric: "server-controlled rubric",
          question: "What happens when Python executes x = 5?",
          contextLabel: "Variables lesson context (data only)",
          lessonContext: { academicExplanation: ["Name binds to object"], codeExamples: [], keyTerms: [], commonMistakes: [] },
          adaptFeedback: adaptCheckFeedback,
        },
        feedback: { rubric: "server-controlled feedback rubric", misconceptions: ["first_assignment_persists", "assignment_history", "reassignment_invalid", "prints_name_text", "declaration_required"] },
      };
    },
  };
}

function routeEnvironment(state, { aiFails = false, storageFails = false } = {}) {
  const calls = [], evidence = [];
  const read = loader({
    "lib/local-user/server": { requireLocalUserId: () => "11111111-1111-4111-8111-111111111111" },
    "lib/mastery/server": {
      requireLocalMastery: () => "11111111-1111-4111-8111-111111111111",
      async loadMasterySummary(_user, lesson) { if (storageFails) throw new Error("private storage"); return { lesson, concepts: states(state) }; },
      async recordEvidence(...args) { evidence.push(args); },
    },
    "lib/lessons/registry": registryStub(state),
    "lib/ai/server": {
      getAIConfig: () => ({ configured: true, model: "test" }),
      createServerAIClient: () => ({ chat: { completions: { create: async (payload) => {
        calls.push(payload); if (aiFails) throw new Error("private provider");
        const isCheck = payload.messages[0].content.includes("server-controlled rubric") && payload.messages[1].content.includes("Variables lesson context");
        return { choices: [{ finish_reason: "stop", message: { content: JSON.stringify(isCheck ? evaluation : { feedback: "Follow the binding.", followUp: null, diagnosedMisconception: null }) } }] };
      } } } }),
    },
  });
  return { read, calls, evidence };
}
function request(body) { return new Request("http://localhost/api/robin/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
test("real feedback route sends scoped adaptation after recording; failures preserve evidence", async () => {
  for (const options of [{}, { aiFails: true }, { storageFails: true }]) {
    const env = routeEnvironment("strong", options);
    const response = await env.read("app/api/robin/feedback/route").POST(request({ activityId: "reassignment", lessonSlug: "variables", language: "en", learnerAnswer: "92", attemptId: "attempt" }));
    assert.equal(env.evidence.length, 1);
    assert.equal(env.evidence[0][3], "incorrect_prediction");
    assert.equal(env.calls.length, 1);
    assert.equal(response.status, options.aiFails ? 502 : 200);
    const prompt = JSON.stringify(env.calls[0]);
    if (options.storageFails) assert.doesNotMatch(prompt, /TEACHING ADAPTATION/);
    else assert.match(prompt, /current mistake/);
    assert.doesNotMatch(prompt, /LEARNER MEMORY|expression:|identifier_naming:/);
  }
});
test("Robin Check evaluator payload and evidence are identical across mastery profiles", async () => {
  const results = [];
  for (const state of ["unseen", "shaky", "strong"]) {
    const env = routeEnvironment(state);
    const response = await env.read("app/api/robin/check/route").POST(request({ lessonSlug: "variables", answer: "x is a name", language: "en" }));
    assert.equal(response.status, 200); assert.equal(env.calls.length, 1);
    assert.doesNotMatch(JSON.stringify(env.calls[0]), /TEACHING ADAPTATION|LEARNER MEMORY/);
    results.push({ payload: JSON.stringify(env.calls[0]), evidence: JSON.stringify(env.evidence), evaluation: (await response.json()).evaluation });
  }
  for (const result of results) {
    assert.equal(result.payload, results[0].payload); assert.equal(result.evidence, results[0].evidence);
    assert.equal(result.evaluation.signal, "developing"); assert.equal(result.evaluation.recommendedAction, "reinforce");
  }
  assert.notEqual(results[1].evaluation.feedback, results[0].evaluation.feedback);
});

test("chat replaces raw mastery with relevant guidance and keeps memory separate", async () => {
  let reads = 0, payload;
  const read = loader({
    openai: { APIError: class extends Error {}, APIConnectionTimeoutError: class extends Error {} },
    "lib/mastery/server": { requireLocalMastery: () => "11111111-1111-4111-8111-111111111111", async loadMasterySummary(_user, lesson) { reads++; return { lesson, concepts: states("shaky") }; } },
    "lib/lessons/registry": {
      getLessonDefinition(slug) {
        if (slug !== "variables") return null;
        return { slug, loadLesson: async () => ({ title: "Variables", summary: "Names", content: {}, sources: [] }), relevance: variablesRelevance };
      },
    },
    "lib/memory/commands": { parseMemoryCommand: () => ({ type: "normal" }) },
    "lib/memory/server": { loadMemoryContext: async () => "LEARNER MEMORY: language preference only" },
    "lib/learning-log/server": { loadLogContext: async () => "" },
    "lib/learning-log/commands": { parseLogIntent: () => ({ type: "normal" }) },
    "lib/progress/server": { loadCurrentLesson: async () => ({ courseSlug: "programming", lessonSlug: "variables" }) },
    "lib/profile/local-profile": { validateRobinProfileContext: () => null },
    "lib/local-user/server": { requireLocalUserId: () => "11111111-1111-4111-8111-111111111111" },
    "lib/ai/server": { getAIConfig: () => ({ configured: true, model: "test" }), createServerAIClient: () => ({ chat: { completions: { create: async (body) => {
      payload = body;
      return { choices: [{ finish_reason: "stop", message: { content: JSON.stringify({ grounding: "general", reply: "One example." }) } }] };
    } } } }) },
  });
  const post = read("app/api/robin/chat/route").POST;
  for (const message of ["hello", "What is TCP?"]) {
    assert.equal((await post(request({ lessonSlug: "variables", message }))).status, 200);
    assert.equal(reads, 0);
    assert.ok(!payload.messages.some((entry) => entry.content.startsWith("TEACHING ADAPTATION")));
  }
  assert.equal((await post(request({ lessonSlug: "variables", message: "Explain reassignment" }))).status, 200);
  assert.equal(reads, 1);
  assert.equal(payload.messages.filter((entry) => entry.content.startsWith("TEACHING ADAPTATION")).length, 1);
  assert.equal(payload.messages.filter((entry) => entry.content.startsWith("LEARNER MEMORY")).length, 1);
  assert.doesNotMatch(JSON.stringify(payload), /CONCEPT MASTERY|expression:|identifier_naming:/);
});

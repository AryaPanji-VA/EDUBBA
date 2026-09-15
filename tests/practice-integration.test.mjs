import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Practice Lab integration (Phase 11B): deterministic check route with mastery
// evidence, AI independence, Learning Log handoff, and shell/route wiring.
function strip(path) {
  return stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), "utf8"), { mode: "transform" })
    .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");')
    .replace(/export /g, "");
}

function loadExerciseSet(path, exportName) {
  const exports = {};
  vm.runInNewContext(strip(path) + `\nexports.${exportName}=${exportName};`, { exports });
  return exports[exportName];
}

const variablesExercises = loadExerciseSet("../content/practice/python/variables-exercises.ts", "variablesPracticeExercises");
const dataTypesExercises = loadExerciseSet("../content/practice/python/data-types-exercises.ts", "dataTypesPracticeExercises");
const registry = {};
vm.runInNewContext(strip("../lib/practice/registry.ts") + "\nexports.getPracticeExercise=getPracticeExercise; exports.getPracticeTrack=getPracticeTrack;", {
  exports: registry,
  require: (name) => name.includes("variables-exercises") ? { variablesPracticeExercises: variablesExercises }
    : name.includes("data-types-exercises") ? { dataTypesPracticeExercises: dataTypesExercises }
    : (() => { throw new Error(name); })(),
});
const checker = {};
vm.runInNewContext(strip("../lib/practice/check.ts") + "\nexports.checkPracticeExercise=checkPracticeExercise;", { exports: checker });

const request = (body) => new Request("http://localhost/api/practice/check", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

function route({ recordEvidence = async () => {} } = {}) {
  const dependencies = {
    "@/lib/practice/registry": { getPracticeExercise: registry.getPracticeExercise },
    "@/lib/practice/check": { checkPracticeExercise: checker.checkPracticeExercise },
    "@/lib/mastery/server": { recordEvidence },
  };
  const code = stripTypeScriptTypes(readFileSync(new URL("../app/api/practice/check/route.ts", import.meta.url), "utf8"), { mode: "transform" })
    .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");')
    .replace(/export /g, "") + "\nexports.POST = POST;";
  const exports = {};
  vm.runInNewContext(code, { exports, Response, TextDecoder, console, require: (name) => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  } });
  return exports.POST;
}

test("check route grades deterministically and records correct_practice evidence with the stable attempt id", async () => {
  const evidence = [];
  const post = route({ recordEvidence: async (...args) => { evidence.push(args); } });
  const response = await post(request({ exerciseId: "variables-write-1", answer: "tempo = 92\nprint(tempo)", attemptId: "practice-attempt-1" }));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.result.status, "correct");
  assert.deepEqual(evidence, [["variables", "assignment", "correct_practice", "practice-attempt-1"]]);
});

test("incorrect submissions record incorrect_practice evidence for every mastery concept", async () => {
  const evidence = [];
  const post = route({ recordEvidence: async (...args) => { evidence.push(args); } });
  // variables-write-2 carries two mastery concepts (reassignment, expression).
  await post(request({ exerciseId: "variables-write-2", answer: "score = 7\nscore = 12\nprint(score)", attemptId: "practice-attempt-2" }));
  assert.deepEqual(evidence, [
    ["variables", "reassignment", "incorrect_practice", "practice-attempt-2"],
    ["variables", "expression", "incorrect_practice", "practice-attempt-2"],
  ]);
});

test("mastery failure never blocks the deterministic result", async () => {
  const post = route({ recordEvidence: async () => { throw new Error("private database credential"); } });
  const response = await post(request({ exerciseId: "variables-predict-1", answer: "60", attemptId: "practice-attempt-3" }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).result.status, "correct");
});

test("malformed attempts and unregistered exercises stop before evidence", async () => {
  let called = 0;
  const post = route({ recordEvidence: async () => { called++; } });
  for (const body of [
    { exerciseId: "variables-predict-1", answer: "60", attemptId: "" },
    { exerciseId: "variables-predict-1", answer: "60", attemptId: 42 },
    { exerciseId: "variables-predict-1", answer: "", attemptId: "a" },
    { exerciseId: "not-registered", answer: "60", attemptId: "a" },
    { exerciseId: "variables-predict-1", answer: "x".repeat(2001), attemptId: "a" },
  ]) {
    assert.equal((await post(request(body))).status, 400);
  }
  assert.equal(called, 0);
});

test("practice checking is AI-independent by construction", () => {
  const routeSource = readFileSync(new URL("../app/api/practice/check/route.ts", import.meta.url), "utf8");
  assert.doesNotMatch(routeSource, /openai|createServerAIClient|9inference/i, "The deterministic check must not touch the AI runtime");
  const hook = readFileSync(new URL("../lib/progress/use-practice.ts", import.meta.url), "utf8");
  assert.doesNotMatch(hook, /\/api\/robin\//, "Practice progress must not depend on Robin endpoints");
  for (const exercise of [...variablesExercises, ...dataTypesExercises]) {
    assert.ok(exercise.hint.trim(), `${exercise.id} carries an offline hint`);
  }
});

test("practice sessions resume from persisted progress and reuse the Learning Log system", () => {
  const lab = readFileSync(new URL("../components/practice-lab.tsx", import.meta.url), "utf8");
  const hook = readFileSync(new URL("../lib/progress/use-practice.ts", import.meta.url), "utf8");
  assert.match(lab, /usePractice\("python"\)/);
  assert.match(lab, /LearningLogOffer/, "Practice reuses the existing Save/Edit/Skip offer component");
  assert.match(lab, /lessonSlug=\{topicSlug\}/, "The offer is grounded in the practiced lesson");
  assert.match(lab, /practice\.markLog\(topicSlug, decision\)/, "Save/Skip records the decision through the practice hook");
  assert.match(hook, /fetch\("\/api\/practice\/progress"/);
  // Skip is a decision only — the existing /api/learning/logs endpoint stays the single writer.
  const offer = readFileSync(new URL("../components/learning-log-offer.tsx", import.meta.url), "utf8");
  assert.match(offer, /fetch\("\/api\/learning\/logs"/);
  assert.doesNotMatch(hook, /fetch\("\/api\/learning\/logs"/);
});

test("adaptive ordering uses only the existing mastery summary endpoint", () => {
  const lab = readFileSync(new URL("../components/practice-lab.tsx", import.meta.url), "utf8");
  assert.match(lab, /\/api\/learning\/mastery\?lesson=/);
  assert.match(lab, /"shaky"/);
  assert.doesNotMatch(lab, /recommendation-engine|scoreModel/i);
});

test("practice routes and the nav entry fit the existing shell", () => {
  const shell = readFileSync(new URL("../components/app-shell.tsx", import.meta.url), "utf8");
  assert.match(shell, /href="\/practice"/);
  assert.match(shell, /active === "practice"/);
  assert.match(shell, /PracticeIcon/);
  assert.ok(readFileSync(new URL("../app/practice/page.tsx", import.meta.url), "utf8"));
  assert.ok(readFileSync(new URL("../app/practice/python/page.tsx", import.meta.url), "utf8"));
  // The shell keeps its existing nav architecture: no extra state, plain links.
  assert.doesNotMatch(shell, /useState|useEffect/);
});

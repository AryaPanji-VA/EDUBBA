import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

function transformed(path) {
  return stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), "utf8"), { mode: "transform" })
    .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");')
    .replace(/export /g, "");
}

function loadStarters() {
  const exports = {};
  vm.runInNewContext(transformed("../content/sandbox/python-starters.ts") +
    "\nexports.pythonStarters=pythonStarters; exports.getPythonStarter=getPythonStarter;", { exports });
  return exports;
}

function loadDraft() {
  const starters = loadStarters();
  const exports = {};
  vm.runInNewContext(transformed("../lib/sandbox/draft.ts") +
    "\nexports.createSandboxDraft=createSandboxDraft; exports.validateSandboxDraft=validateSandboxDraft; exports.serializeSandboxDraft=serializeSandboxDraft; exports.deserializeSandboxDraft=deserializeSandboxDraft; exports.updateSandboxDraft=updateSandboxDraft; exports.resetSandboxDraft=resetSandboxDraft; exports.MAX_SANDBOX_CODE_LENGTH=MAX_SANDBOX_CODE_LENGTH;", {
    exports, Date, JSON,
    require: (name) => name.includes("python-starters") ? starters : (() => { throw new Error(name); })(),
  });
  return exports;
}

function loadHandoff() {
  const draft = loadDraft();
  const exports = {};
  vm.runInNewContext(transformed("../lib/sandbox/handoff.ts") +
    "\nexports.createSandboxHandoff=createSandboxHandoff; exports.validateSandboxHandoff=validateSandboxHandoff; exports.serializeSandboxHandoff=serializeSandboxHandoff; exports.deserializeSandboxHandoff=deserializeSandboxHandoff;", {
    exports, Date, JSON,
    require: (name) => name === "./draft" ? draft : (() => { throw new Error(name); })(),
  });
  return exports;
}

test("starter registry contains the small beginner templates", () => {
  const { pythonStarters, getPythonStarter } = loadStarters();
  assert.deepEqual(Array.from(pythonStarters.map((starter) => starter.id)), ["blank", "variables", "data-types", "operators-arithmetic", "operators-comparison", "if-else", "conditionals", "loop", "while", "function", "function-return"]);
  assert.match(getPythonStarter("variables").code, /name\s*=/);
  assert.match(getPythonStarter("data-types").code, /type\(number\)/);
  assert.match(getPythonStarter("operators-arithmetic").code, /x % y/);
  assert.match(getPythonStarter("operators-comparison").code, /age == 18/);
  assert.match(getPythonStarter("loop").code, /for i in range\(1,\s*6\)/);
  assert.equal(getPythonStarter("missing"), null);
});

test("sandbox drafts validate and survive serialization without transient runtime state", () => {
  const draft = loadDraft();
  const original = draft.createSandboxDraft("function", "2026-09-16T00:00:00.000Z");
  const restored = draft.deserializeSandboxDraft(draft.serializeSandboxDraft(original));
  assert.deepEqual({ ...restored }, { ...original });
  assert.equal(draft.validateSandboxDraft({ ...original, running: true }), null);
  assert.equal(draft.validateSandboxDraft({ ...original, updatedAt: "not-a-date" }), null);
  assert.equal(draft.validateSandboxDraft({ ...original, starterId: "unknown" }), null);
  assert.equal(draft.validateSandboxDraft({ ...original, code: "x".repeat(draft.MAX_SANDBOX_CODE_LENGTH + 1) }), null);
  assert.equal(draft.deserializeSandboxDraft("not json"), null);
});

test("reset is deterministic and returns the selected starter instead of stale edits", () => {
  const draft = loadDraft();
  let current = draft.createSandboxDraft("loop", "2026-09-16T00:00:00.000Z");
  current = draft.updateSandboxDraft(current, "while True:\n    pass", "2026-09-16T00:01:00.000Z");
  const reset = draft.resetSandboxDraft(current, "2026-09-16T00:02:00.000Z");
  assert.match(reset.code, /for i in range\(1,\s*6\)/);
  assert.equal(reset.starterId, "loop");
  assert.equal(reset.updatedAt, "2026-09-16T00:02:00.000Z");
});

test("Guided Practice handoff accepts only bounded exercise-derived code", () => {
  const handoff = loadHandoff();
  const created = handoff.createSandboxHandoff({ id: "variables-fix-1", starterCode: "print(total)\ntotal = 10" }, "2026-09-16T00:00:00.000Z");
  assert.equal(created.sourceExerciseId, "variables-fix-1");
  assert.match(created.code, /print\(total\)/);
  assert.deepEqual({ ...handoff.deserializeSandboxHandoff(handoff.serializeSandboxHandoff(created)) }, { ...created });
  assert.equal(handoff.createSandboxHandoff({ id: "variables-write-1" }), null);
  assert.equal(handoff.validateSandboxHandoff({ ...created, extra: true }), null);
  assert.equal(handoff.validateSandboxHandoff({ ...created, code: "" }), null);
});

test("runtime protocol validates results and exposes readable lifecycle labels", () => {
  const exports = {};
  vm.runInNewContext(transformed("../lib/sandbox/runtime.ts") +
    "\nexports.isSandboxRunResult=isSandboxRunResult; exports.isSandboxStdinRequest=isSandboxStdinRequest; exports.isSandboxStdinResponse=isSandboxStdinResponse; exports.acceptSandboxStdinRequest=acceptSandboxStdinRequest; exports.createSandboxStdinResponse=createSandboxStdinResponse; exports.sandboxRuntimeLabel=sandboxRuntimeLabel;", { exports });
  assert.equal(exports.isSandboxRunResult({ type: "result", id: "1", stdout: "ok", stderr: "", error: null }), true);
  assert.equal(exports.isSandboxRunResult({ type: "result", id: "1", stdout: "ok" }), false);
  assert.equal(exports.sandboxRuntimeLabel("loading"), "loading Python…");
  assert.equal(exports.sandboxRuntimeLabel("waiting-input"), "waiting for input…");
  assert.equal(exports.sandboxRuntimeLabel("error"), "runtime unavailable");
});

test("stdin protocol supports sequential and empty inputs while rejecting stale sessions", () => {
  const exports = {};
  vm.runInNewContext(transformed("../lib/sandbox/runtime.ts") +
    "\nexports.isSandboxStdinRequest=isSandboxStdinRequest; exports.isSandboxStdinResponse=isSandboxStdinResponse; exports.acceptSandboxStdinRequest=acceptSandboxStdinRequest; exports.createSandboxStdinResponse=createSandboxStdinResponse;", { exports });
  const first = { type: "stdin-request", runId: "run-1", requestId: "input-1", prompt: "Nama: " };
  const second = { type: "stdin-request", runId: "run-1", requestId: "input-2", prompt: "Umur: " };
  assert.equal(exports.isSandboxStdinRequest(first), true);
  assert.equal(exports.acceptSandboxStdinRequest(null, first, "run-1").requestId, "input-1");
  assert.equal(exports.acceptSandboxStdinRequest(first, second, "run-1"), null, "a second prompt waits until the first is submitted");
  assert.equal(exports.acceptSandboxStdinRequest(null, second, "run-1").requestId, "input-2");
  assert.equal(exports.acceptSandboxStdinRequest(null, second, "stale-run"), null);
  const empty = exports.createSandboxStdinResponse(first, "");
  assert.equal(empty.value, "");
  assert.equal(exports.isSandboxStdinResponse(empty), true);
  assert.equal(exports.isSandboxStdinResponse({ ...empty, value: 18 }), false);
});

test("Sandbox execution is browser-worker only and cannot create mastery evidence", () => {
  const component = readFileSync(new URL("../components/python-sandbox.tsx", import.meta.url), "utf8");
  const worker = readFileSync(new URL("../public/workers/python-sandbox.mjs", import.meta.url), "utf8");
  assert.match(component, /new Worker\("\/workers\/python-sandbox\.mjs"/);
  assert.match(worker, /pyodide\/v314\.0\.7\/full\/pyodide\.mjs/);
  assert.match(worker, /runPythonAsync/);
  assert.match(worker, /Imports are disabled in this beginner sandbox/);
  assert.match(worker, /formatPythonError/);
  assert.match(worker, /File \"main\.py\"/, "errors keep the learner's main.py frame instead of Pyodide internals");
  assert.match(worker, /run_sync\(request_stdin\(str\(prompt\)\)\)/, "Python input blocks on the controlled worker bridge");
  assert.match(worker, /message\.runId !== pendingStdin\.runId/, "stale stdin responses are ignored");
  assert.doesNotMatch(component, /api\/practice\/check|recordEvidence|api\/learning\/mastery/);
  assert.doesNotMatch(worker, /child_process|spawn\(|system Python/i);
});

test("Sandbox route, lazy loading, persistence, timeout, and Guided handoff are wired", () => {
  const component = readFileSync(new URL("../components/python-sandbox.tsx", import.meta.url), "utf8");
  const guided = readFileSync(new URL("../components/practice-lab.tsx", import.meta.url), "utf8");
  const landing = readFileSync(new URL("../app/practice/page.tsx", import.meta.url), "utf8");
  assert.ok(readFileSync(new URL("../app/practice/python/sandbox/page.tsx", import.meta.url), "utf8"));
  assert.match(component, /ensureWorker\(\)/, "runtime starts from an intentional Run, not module load");
  assert.match(component, /localStorage\.setItem\(SANDBOX_DRAFT_STORAGE_KEY/);
  assert.match(component, /draftInitializationRef\.current/, "one-time handoffs survive React Strict Mode's development effect replay");
  assert.match(component, /EXECUTION_LIMIT_MS = 5_000/);
  assert.match(component, /pending\.timeoutId = null/, "the compute timeout pauses while the learner types");
  assert.match(component, /cancelActiveExecution\(\)/, "reset settles the active run and clears pending input");
  assert.doesNotMatch(component, /localStorage\.setItem\([^\n]+stdin|sessionStorage\.setItem\([^\n]+stdin/i);
  assert.match(guided, /copy\["guided\.openSandbox"\]/, "the Guided → Sandbox handoff label follows the product language");
  assert.match(guided, /href="\/practice\/python\/sandbox"/, "the handoff route is uniform across languages");
  assert.match(guided, /sessionStorage\.setItem\(SANDBOX_HANDOFF_STORAGE_KEY/);
  assert.match(landing, /href="\/practice\/python\/sandbox"/);
});

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Practice progress persistence (Phase 11B) — mirrors lesson-progress tests.
function transformed(path) {
  return stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), "utf8"), { mode: "transform" })
    .replace(/import "server-only";/g, "")
    .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");')
    .replace(/export /g, "");
}

function loadTypes() {
  const exports = {};
  vm.runInNewContext(transformed("../lib/practice/types.ts") + "\nexports.validatePracticeProgressInput=validatePracticeProgressInput;", { exports });
  return exports;
}

function loadState() {
  const types = loadTypes();
  const exports = {};
  vm.runInNewContext(transformed("../lib/practice/state.ts") + ["freshPracticeState", "hydratePracticeState", "recordPracticeAttempt", "movePracticeExercise", "offerPracticeLog", "decidePracticeLog", "completePracticeSession"].map((name) => `\nexports.${name}=${name};`).join(""), {
    exports,
    require: (name) => name === "./types" ? types : (() => { throw new Error(name); })(),
  });
  return exports;
}

const validInput = {
  courseSlug: "python",
  currentExerciseId: "variables-write-1",
  completedExerciseIds: ["variables-predict-1"],
  progressState: {
    attempts: { "variables-predict-1": { attemptId: "attempt-1", status: "correct", misconception: null, answer: "60" } },
    logStatus: {},
  },
  completedAt: null,
};

test("practice progress validation accepts the bounded resume state and rejects malformed fields", () => {
  const { validatePracticeProgressInput } = loadTypes();
  const valid = validatePracticeProgressInput(validInput);
  assert.equal(valid.progressState.attempts["variables-predict-1"].attemptId, "attempt-1");
  assert.equal(valid.progressState.attempts["variables-predict-1"].answer, "60");
  for (const input of [
    null, [], { ...validInput, extra: true },
    { ...validInput, courseSlug: "" },
    { ...validInput, currentExerciseId: "x".repeat(81) },
    { ...validInput, completedExerciseIds: Array.from({ length: 61 }, () => "e") },
    { ...validInput, progressState: { attempts: { e: { attemptId: "a", status: "perfect", misconception: null } } } },
    { ...validInput, progressState: { attempts: { e: { attemptId: "a", status: "correct", misconception: null, answer: "x".repeat(2001) } } } },
    { ...validInput, progressState: { logStatus: { variables: "maybe" } } },
    { ...validInput, progressState: { attempts: { e: { ...validInput.progressState.attempts["variables-predict-1"], extra: true } } } },
    { ...validInput, completedAt: "not-a-date" },
  ]) assert.equal(validatePracticeProgressInput(input), null);
});

test("saved current exercise, attempts, and log decisions hydrate after refresh", () => {
  const { hydratePracticeState } = loadState();
  const resumed = hydratePracticeState({
    current_exercise_id: "variables-write-1",
    completed_exercise_ids: ["variables-predict-1", "variables-predict-2"],
    progress_state: {
      attempts: { "variables-predict-1": { attemptId: "attempt-1", status: "correct", misconception: null, answer: "60" } },
      logStatus: { variables: "pending" },
    },
    completed_at: null,
  });
  assert.equal(resumed.currentExerciseId, "variables-write-1");
  assert.deepEqual([...resumed.completedExerciseIds], ["variables-predict-1", "variables-predict-2"]);
  assert.equal(resumed.attempts["variables-predict-1"].status, "correct");
  assert.equal(resumed.attempts["variables-predict-1"].answer, "60");
  assert.equal(resumed.logStatus.variables, "pending");
  assert.equal(resumed.isLoaded, true);
});

test("only a correct attempt completes an exercise; every attempt is recorded for the resume trail", () => {
  const { freshPracticeState, recordPracticeAttempt } = loadState();
  let state = freshPracticeState(true);
  state = recordPracticeAttempt(state, "variables-write-1", { attemptId: "a1", status: "incorrect", misconception: "quote_confusion" });
  assert.deepEqual([...state.completedExerciseIds], []);
  assert.equal(state.attempts["variables-write-1"].status, "incorrect");
  state = recordPracticeAttempt(state, "variables-write-1", { attemptId: "a2", status: "correct", misconception: null });
  assert.deepEqual([...state.completedExerciseIds], ["variables-write-1"]);
  assert.equal(state.attempts["variables-write-1"].attemptId, "a2");
});

test("a completed topic offers the Learning Log once; Save/Skip records the decision", () => {
  const { freshPracticeState, recordPracticeAttempt, offerPracticeLog, decidePracticeLog } = loadState();
  let state = freshPracticeState(true);
  state = recordPracticeAttempt(state, "variables-predict-1", { attemptId: "a1", status: "correct", misconception: null });
  state = offerPracticeLog(state, "variables", false);
  assert.equal(state.logStatus.variables, undefined);
  state = offerPracticeLog(state, "variables", true);
  assert.equal(state.logStatus.variables, "pending");
  // An existing decision is never regressed to pending by later checks.
  state = decidePracticeLog(state, "variables", "skipped");
  state = offerPracticeLog(state, "variables", true);
  assert.equal(state.logStatus.variables, "skipped");
});

test("track completion stamps completed_at exactly once", () => {
  const { freshPracticeState, completePracticeSession } = loadState();
  let state = freshPracticeState(true);
  state = completePracticeSession(state, "2026-09-15T00:00:00.000Z");
  state = completePracticeSession(state, "2026-09-16T00:00:00.000Z");
  assert.equal(state.completedAt, "2026-09-15T00:00:00.000Z");
});

test("server merge never regresses completed exercises, attempts, or log decisions", async () => {
  const types = loadTypes();
  const existing = {
    id: "practice-1", user_id: null, course_slug: "python",
    current_exercise_id: "variables-predict-2",
    completed_exercise_ids: ["variables-predict-1"],
    progress_state: {
      attempts: { "variables-predict-1": { attemptId: "attempt-1", status: "correct", misconception: null } },
      logStatus: { variables: "pending" },
    },
    completed_at: null, created_at: "now", updated_at: "now",
  };
  let written, conflict;
  const query = {
    select() { return this; }, eq() { return this; },
    async maybeSingle() { return { data: existing, error: null }; },
    upsert(payload, options) {
      written = payload; conflict = options.onConflict;
      return { select: () => ({ single: async () => ({ data: { ...existing, ...payload }, error: null }) }) };
    },
  };
  const exports = {};
  vm.runInNewContext(transformed("../lib/practice/server.ts") + "\nexports.savePracticeProgress=savePracticeProgress;", {
    exports, URL, Response, Date, Set, process: { env: { NODE_ENV: "development" } },
    require(name) {
      if (name.includes("memory-server")) return { createMemorySupabaseClient: () => ({ from: () => query }) };
      if (name === "./types") return types;
      throw new Error(name);
    },
  });
  const result = await exports.savePracticeProgress({
    courseSlug: "python",
    currentExerciseId: "variables-fix-1",
    completedExerciseIds: ["variables-predict-2"],
    progressState: {
      attempts: { "variables-predict-2": { attemptId: "attempt-2", status: "correct", misconception: null } },
      logStatus: { variables: "saved" },
    },
    completedAt: null,
  });
  assert.equal(conflict, "course_slug");
  assert.deepEqual([...written.completed_exercise_ids], ["variables-predict-1", "variables-predict-2"]);
  assert.equal(written.progress_state.attempts["variables-predict-1"].attemptId, "attempt-1");
  assert.equal(written.progress_state.attempts["variables-predict-2"].attemptId, "attempt-2");
  assert.equal(written.progress_state.logStatus.variables, "saved");
  assert.equal(written.current_exercise_id, "variables-fix-1");
  assert.equal(result.newlyCompleted, false);
});

test("migration is RLS-on, server-only, single-row per track, and has no public policies", () => {
  const sql = readFileSync(new URL("../database/phase11b-practice-progress.sql", import.meta.url), "utf8");
  const server = readFileSync(new URL("../lib/practice/server.ts", import.meta.url), "utf8");
  assert.match(sql, /progress_state jsonb/);
  assert.match(sql, /unique \(course_slug\)/);
  assert.match(sql, /user_id uuid/);
  assert.match(sql, /enable row level security/);
  assert.match(sql, /revoke all.*from public, anon, authenticated/);
  assert.match(sql, /grant select, insert, update, delete.*service_role/);
  assert.match(sql, /must have no public policies/);
  assert.match(server, /import "server-only"/);
  assert.match(server, /onConflict: "course_slug"/);
  assert.match(server, /createMemorySupabaseClient/);
});

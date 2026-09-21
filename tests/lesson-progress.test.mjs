import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

function transformed(path) {
  return stripTypeScriptTypes(readFileSync(new URL(path, import.meta.url), "utf8"), { mode: "transform" })
    .replace(/import "server-only";/g, "")
    .replace(/import \{([^}]+)\} from "([^"]+)";/g, 'const {$1} = require("$2");')
    .replace(/export /g, "");
}

function loadTypes() {
  const exports = {};
  vm.runInNewContext(transformed("../lib/progress/types.ts") + "\nexports.validateProgressInput=validateProgressInput; exports.emptyPersistedProgressState=emptyPersistedProgressState;", { exports });
  return exports;
}

function loadState() {
  const types = loadTypes();
  const exports = {};
  vm.runInNewContext(transformed("../lib/progress/state.ts") + ["freshProgressState", "hydrateProgressState", "advanceProgress", "submitProgressAnswer", "completeLessonProgress"].map((name) => `\nexports.${name}=${name};`).join(""), {
    exports,
    require: (name) => name === "./types" ? types : (() => { throw new Error(name); })(),
  });
  return exports;
}

test("progress validation accepts the bounded resume state and rejects unknown or malformed fields", () => {
  const { validateProgressInput } = loadTypes();
  const valid = validateProgressInput({
    courseSlug: "programming", lessonSlug: "variables", currentActivityId: "predict",
    completedActivityIds: ["why", "intuition", "predict"], completedAt: null,
    progressState: { answers: { predict: { value: "92", attemptId: "attempt-1" } }, robinCheckComplete: false, learningLogStatus: "none" },
  });
  assert.equal(valid.progressState.answers.predict.attemptId, "attempt-1");
  assert.equal(validateProgressInput({ ...valid, extra: true }), null);
  assert.equal(validateProgressInput({ ...valid, progressState: { ...valid.progressState, answers: { predict: { value: "", attemptId: "x" } } } }), null);
});

test("saved step, submitted answer and completion hydrate after refresh", () => {
  const { hydrateProgressState } = loadState();
  const resumed = hydrateProgressState({
    current_activity_id: "predict", completed_activity_ids: ["why", "intuition", "predict"],
    progress_state: { answers: { predict: { value: "92", attemptId: "attempt-1" } }, robinCheckComplete: false, learningLogStatus: "none" },
    completed_at: null,
  }, ["why", "intuition", "predict", "connect"]);
  assert.equal(resumed.step, 2);
  assert.equal(resumed.answers.predict.value, "92");
  assert.equal(resumed.complete, false);

  const completed = hydrateProgressState({ ...{
    current_activity_id: "connect", completed_activity_ids: ["why", "intuition", "predict", "connect"],
    progress_state: { answers: {}, robinCheckComplete: true, learningLogStatus: "pending" },
  }, completed_at: "2026-09-15T00:00:00.000Z" }, ["why", "intuition", "predict", "connect"]);
  assert.equal(completed.step, 3);
  assert.equal(completed.complete, true);
  assert.equal(completed.learningLogStatus, "pending");
});

test("forward navigation and answer submission preserve meaningful completed activities", () => {
  const { freshProgressState, advanceProgress, submitProgressAnswer } = loadState();
  const afterStep = advanceProgress(freshProgressState(true), 1, ["why", "predict"]);
  assert.deepEqual([...afterStep.completedActivityIds], ["why"]);
  const afterAnswer = submitProgressAnswer(afterStep, "predict", { value: "92", attemptId: "attempt-1" });
  assert.deepEqual([...afterAnswer.completedActivityIds], ["why", "predict"]);
  assert.equal(afterAnswer.answers.predict.attemptId, "attempt-1");
});

test("real completion creates one pending Learning Log decision state", () => {
  const { freshProgressState, completeLessonProgress } = loadState();
  const completed = completeLessonProgress(freshProgressState(true), "connect", "2026-09-15T00:00:00.000Z");
  assert.equal(completed.complete, true);
  assert.equal(completed.learningLogStatus, "pending");
  assert.deepEqual([...completed.completedActivityIds], ["connect"]);
});

test("server merge never regresses completion, completed activities, or submitted attempts", async () => {
  const types = loadTypes();
  const existing = {
    id: "progress-1", user_id: null, course_slug: "programming", lesson_slug: "variables",
    current_activity_id: "connect", completed_activity_ids: ["why", "predict"],
    progress_state: { answers: { predict: { value: "92", attemptId: "attempt-1" } }, robinCheckComplete: true, learningLogStatus: "pending" },
    completed_at: "2026-09-15T00:00:00.000Z", created_at: "now", updated_at: "now",
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
  vm.runInNewContext(transformed("../lib/progress/server.ts") + "\nexports.saveProgress=saveProgress;", {
    exports, URL, Response, Date, Set, process: { env: { NODE_ENV: "development" } },
    require(name) {
      if (name.includes("memory-server")) return { createMemorySupabaseClient: () => ({ from: () => query }) };
      if (name === "./types") return types;
      if (name.includes("data/courses")) return { programmingLessonStateBySlug: { variables: "current" } };
      if (name.includes("lessons/registry")) return { getLessonDefinition: () => ({ activities: [{ id: "why" }] }) };
      if (name.includes("local-user/server")) return { requireLocalUserId: () => "00000000-0000-4000-8000-000000000001" };
      throw new Error(name);
    },
  });
  const result = await exports.saveProgress("11111111-1111-4111-8111-111111111111", {
    courseSlug: "programming", lessonSlug: "variables", currentActivityId: "connect", completedActivityIds: ["connect"], completedAt: null,
    progressState: { answers: {}, robinCheckComplete: false, learningLogStatus: "saved" },
  });
  assert.equal(conflict, "local_user_id,course_slug,lesson_slug");
  assert.equal(written.local_user_id, "11111111-1111-4111-8111-111111111111");
  assert.equal(written.completed_at, existing.completed_at);
  assert.deepEqual([...written.completed_activity_ids], ["why", "predict", "connect"]);
  assert.equal(written.progress_state.answers.predict.attemptId, "attempt-1");
  assert.equal(written.progress_state.learningLogStatus, "saved");
  assert.equal(result.newlyCompleted, false);
});

test("restored attempts do not re-request Smart Feedback or duplicate mastery evidence", () => {
  const renderer = readFileSync(new URL("../components/lesson-activity-renderer.tsx", import.meta.url), "utf8");
  const feedback = readFileSync(new URL("../components/smart-feedback.tsx", import.meta.url), "utf8");
  assert.match(renderer, /restoredAttemptIds/);
  assert.match(renderer, /requestEnabled={!restoredAttemptIds\.current\.has/);
  assert.match(feedback, /!submitted \|\| !requestEnabled/);
});

test("completion reuses the existing Learning Log endpoint and Skip only records a decision", () => {
  const source = readFileSync(new URL("../components/learning-log-offer.tsx", import.meta.url), "utf8");
  assert.match(source, /Save this session to Learning Log\?/);
  assert.match(source, /fetch\("\/api\/robin\/chat"/);
  assert.match(source, /fetch\("\/api\/learning\/logs"/);
  const skipBody = source.match(/async function skip\(\) \{([\s\S]*?)\n  \}/)?.[1] ?? "";
  assert.match(skipBody, /onDecision\("skipped"\)/);
  assert.doesNotMatch(skipBody, /fetch\(/);
});

test("local-user migration keeps RLS and uses a per-user PostgREST conflict constraint", () => {
  const sql = readFileSync(new URL("../database/phase17-1-local-user-isolation.sql", import.meta.url), "utf8");
  const server = readFileSync(new URL("../lib/progress/server.ts", import.meta.url), "utf8");
  assert.match(sql, /unique \(local_user_id, course_slug, lesson_slug\)/);
  assert.match(sql, /enable row level security/);
  assert.match(server, /import "server-only"/);
  assert.match(server, /onConflict: "local_user_id,course_slug,lesson_slug"/);
  assert.match(server, /\.eq\("local_user_id", localUserId\)/);
});

test("progress API removes localhost-only restriction, accepts any origin with valid local-user cookie", () => {
  const server = readFileSync(new URL("../lib/progress/server.ts", import.meta.url), "utf8");
  assert.doesNotMatch(server, /localhost.*127\.0\.0\.1/);
  assert.match(server, /requireLocalUserId\(request\)/);
});
test("Dashboard, navigation, and Robin resolve persisted current lesson instead of a fixed lesson route", () => {
  const dashboard = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const shell = readFileSync(new URL("../components/app-shell.tsx", import.meta.url), "utf8");
  const chat = readFileSync(new URL("../app/api/robin/chat/route.ts", import.meta.url), "utf8");
  assert.match(dashboard, /useCurrentLesson\(\)/);
  assert.match(dashboard, /currentLesson\.lessonSlug/);
  assert.match(shell, /CurrentLessonLink/);
  assert.match(chat, /loadCurrentLesson\(localUserId\)/);
  assert.doesNotMatch(chat, /\/courses\/programming\/\$\{currentSlug\}/);
});

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Load the intent parser via VM (mirrors existing test pattern).
const commandsSource = stripTypeScriptTypes(readFileSync(new URL("../lib/learning-log/commands.ts", import.meta.url), "utf8"), { mode: "transform" })
  .replace(/import \{[^}]+\} from "[^"]+";/g, "")
  .replace(/export /g, "");
const commandsExports = {};
vm.runInNewContext(commandsSource + "\nexports.parseLogIntent = parseLogIntent;", { exports: commandsExports });
const { parseLogIntent } = commandsExports;

// Load the types/validator.
const typesSource = stripTypeScriptTypes(readFileSync(new URL("../lib/learning-log/types.ts", import.meta.url), "utf8"), { mode: "transform" })
  .replace(/import \{[^}]+\} from "[^"]+";/g, "")
  .replace(/export /g, "");
const typesExports = {};
vm.runInNewContext(typesSource + "\nexports.validateLearningLog = validateLearningLog;", { exports: typesExports });
const { validateLearningLog } = typesExports;

// === 1. Intent parser: save_log ===
test("save_log intent detected for 'catat apa yang gue pelajarin'", () => {
  assert.equal(parseLogIntent("catat apa yang gue pelajarin hari ini").type, "save_log");
  assert.equal(parseLogIntent("catatin sesi belajar gue").type, "save_log");
  assert.equal(parseLogIntent("ringkas belajar hari ini").type, "save_log");
  assert.equal(parseLogIntent("save what I learned today").type, "save_log");
});

// === 2. Intent parser: recall_log ===
test("recall_log intent detected for 'terakhir gue belajar apa'", () => {
  assert.equal(parseLogIntent("terakhir gue belajar apa?").type, "recall_log");
  assert.equal(parseLogIntent("kemarin gue belajar apa").type, "recall_log");
  assert.equal(parseLogIntent("what did i learn last time").type, "recall_log");
  assert.equal(parseLogIntent("apa yang belum gue paham").type, "recall_log");
});

// === 3. Intent parser: continue_learning ===
test("continue_learning intent detected for 'lanjut dari mana'", () => {
  assert.equal(parseLogIntent("lanjut dari mana").type, "continue_learning");
  assert.equal(parseLogIntent("lanjutin dari terakhir").type, "continue_learning");
  assert.equal(parseLogIntent("where do i continue").type, "continue_learning");
});

// === 4. Intent parser: normal (not intercepted) ===
test("normal intent for regular questions", () => {
  assert.equal(parseLogIntent("bin, apa itu variable?").type, "normal");
  assert.equal(parseLogIntent("jelasin assignment dong").type, "normal");
  assert.equal(parseLogIntent("how does reassignment work?").type, "normal");
  assert.equal(parseLogIntent("hello").type, "normal");
  assert.equal(parseLogIntent("quiz gue").type, "normal");
});

// === 5. Intent separation from memory commands ===
test("learning-log intent does not collide with memory commands", () => {
  // "bin inget ya gue lebih gampang ngerti kalau lu kasih analogi dulu" → memory save
  assert.equal(parseLogIntent("inget ya gue lebih gampang ngerti kalau lu kasih analogi dulu").type, "normal");
  // "bin lupain preference analogi gue" → memory forget
  assert.equal(parseLogIntent("lupain preference analogi gue").type, "normal");
  // "simpan" alone → memory save, not log save (log needs "catat/ringkas/learned" context)
  assert.equal(parseLogIntent("simpan").type, "normal");
});

// === 6. Validation: accepts valid input ===
test("validateLearningLog accepts valid input", () => {
  const valid = validateLearningLog({
    courseSlug: "programming",
    lessonSlug: "variables",
    summary: "Learned about assignment and reassignment. Still shaky on identifier naming.",
    conceptsLearned: ["assignment", "reassignment"],
    weakConcepts: ["identifier_naming"],
    nextStep: "Data Types",
  });
  assert.ok(valid);
  assert.equal(valid?.lessonSlug, "variables");
  assert.equal(valid?.conceptsLearned?.length, 2);
});

// === 7. Validation: rejects invalid input ===
test("validateLearningLog rejects invalid input", () => {
  assert.equal(validateLearningLog(null), null);
  assert.equal(validateLearningLog([]), null);
  assert.equal(validateLearningLog({}), null);
  assert.equal(validateLearningLog({ courseSlug: "programming", lessonSlug: "variables" }), null); // missing summary
  assert.equal(validateLearningLog({ courseSlug: "", lessonSlug: "variables", summary: "test" }), null);
  assert.equal(validateLearningLog({ courseSlug: "x".repeat(100), lessonSlug: "variables", summary: "test" }), null);
  assert.equal(validateLearningLog({ courseSlug: "programming", lessonSlug: "variables", summary: "" }), null);
  assert.equal(validateLearningLog({ courseSlug: "programming", lessonSlug: "variables", summary: "x".repeat(2001) }), null);
  assert.equal(validateLearningLog({ courseSlug: "programming", lessonSlug: "variables", summary: "test", conceptsLearned: "not array" }), null);
  assert.equal(validateLearningLog({ courseSlug: "programming", lessonSlug: "variables", summary: "test", extraField: "x" }), null);
});

// === 8. No save on skip (structural assertion) ===
test("chat route separates intent detection from persistence", () => {
  // The chat route source should import parseLogIntent and loadLogContext, not createLog
  const chatSource = readFileSync(new URL("../app/api/robin/chat/route.ts", import.meta.url), "utf8");
  assert.match(chatSource, /parseLogIntent/, "Must import and call parseLogIntent");
  assert.match(chatSource, /loadLogContext/, "Must load log context for recall");
  assert.match(chatSource, /loadMasterySummary/, "Must load mastery for save_log summaries");
  assert.doesNotMatch(chatSource, /createLog/, "Chat route must NOT directly persist logs — that's the POST /api/learning/logs endpoint");
});

// === 9. Server module exists with CRUD functions ===
test("learning-log server exports CRUD functions", () => {
  const serverSource = readFileSync(new URL("../lib/learning-log/server.ts", import.meta.url), "utf8");
  assert.match(serverSource, /export async function createLog/, "Must export createLog");
  assert.match(serverSource, /export async function listRecentLogs/, "Must export listRecentLogs");
  assert.match(serverSource, /export async function updateLogSummary/, "Must export updateLogSummary");
  assert.match(serverSource, /export async function deleteLog/, "Must export deleteLog");
  assert.match(serverSource, /export async function loadLogContext/, "Must export loadLogContext");
  assert.match(serverSource, /import "server-only"/, "Must be server-only");
  assert.match(serverSource, /createMemorySupabaseClient/, "Must reuse the privileged Supabase client");
});

// === 10. SQL migration exists ===
test("learning_logs SQL migration follows project pattern", () => {
  const sql = readFileSync(new URL("../database/phase11a-learning-logs.sql", import.meta.url), "utf8");
  assert.match(sql, /begin/, "Must be wrapped in transaction");
  assert.match(sql, /commit/, "Must commit");
  assert.match(sql, /create table if not exists public\.learning_logs/, "Must create table");
  assert.match(sql, /enable row level security/, "Must enable RLS");
  assert.match(sql, /revoke all.*from public, anon, authenticated/, "Must revoke from public/anon/authenticated");
  assert.match(sql, /grant.*to service_role/, "Must grant only to service_role");
  assert.match(sql, /drop trigger if exists/, "Must have updated_at trigger");
  assert.match(sql, /raise exception.*learning_logs.*must have no public policies/, "Must have fail-closed policy check");
});

// === 11. Dashboard integrates RecentLearning ===
test("dashboard imports and renders RecentLearning", () => {
  const dashSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(dashSource, /import.*RecentLearning/, "Must import RecentLearning component");
  assert.match(dashSource, /<RecentLearning/, "Must render RecentLearning in the dashboard");
});

// === 12. Current lesson resolution ===
test("dashboard mini-chat resolves current lesson from persisted progress with a static fallback", () => {
  const dashSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const hookSource = readFileSync(new URL("../lib/progress/use-current-lesson.ts", import.meta.url), "utf8");
  assert.match(dashSource, /useCurrentLesson/, "Dashboard must use current lesson progress");
  assert.match(hookSource, /fetch\("\/api\/learning\/progress"/, "Current lesson must come from the progress API");
  assert.match(hookSource, /programmingLessonStateBySlug/, "The static curriculum remains the safe fallback");
});

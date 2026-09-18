import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const source = stripTypeScriptTypes(read("lib/profile/local-profile.ts"), { mode: "transform" })
  .replace(/export /g, "") + `
exports.api = {
  LOCAL_PROFILE_STORAGE_KEY,
  createDefaultLocalProfile,
  validateLocalProfile,
  validateLocalProfileDraft,
  loadLocalProfile,
  saveLocalProfile,
  updateLocalProfile,
  resetLocalProfile,
  toRobinProfileContext,
  validateRobinProfileContext,
};`;
const sandbox = { exports: {}, Date, JSON, Number, Object };
vm.runInNewContext(source, sandbox);
const profile = sandbox.exports.api;

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    values,
  };
}

const created = new Date("2026-09-18T08:00:00.000Z");
const updated = new Date("2026-09-18T09:00:00.000Z");

test("local profile defaults are useful, bounded, and explicitly local", () => {
  const value = profile.createDefaultLocalProfile(created);
  assert.equal(value.displayName, "Arya");
  assert.equal(value.preferredName, "Arya");
  assert.equal(value.studyProgram, "Computer Science");
  assert.equal(value.semester, 1);
  assert.equal(value.shortBio, "");
  assert.equal(value.createdAt, created.toISOString());
  assert.ok(profile.validateLocalProfile(value));
});

test("profile validation rejects missing, extra, malformed, and out-of-range fields", () => {
  const valid = profile.createDefaultLocalProfile(created);
  assert.equal(profile.validateLocalProfile({ ...valid, semester: 0 }), null);
  assert.equal(profile.validateLocalProfile({ ...valid, preferredName: "" }), null);
  assert.equal(profile.validateLocalProfile({ ...valid, shortBio: "x".repeat(241) }), null);
  assert.equal(profile.validateLocalProfile({ ...valid, secret: "nope" }), null);
  assert.equal(profile.validateLocalProfileDraft({
    displayName: "Arya", preferredName: "Ara", studyProgram: "Computer Science", semester: 2, shortBio: "", extra: true,
  }), null);
});

test("save and reload restore the same profile after a refresh boundary", () => {
  const storage = memoryStorage();
  const value = profile.createDefaultLocalProfile(created);
  assert.equal(profile.saveLocalProfile(storage, value), true);
  assert.equal(JSON.stringify(profile.loadLocalProfile(storage, updated)), JSON.stringify(value));
});

test("update trims fields, preserves createdAt, and advances updatedAt", () => {
  const current = profile.createDefaultLocalProfile(created);
  const next = profile.updateLocalProfile(current, {
    displayName: "  Arya Pratama  ", preferredName: "  Ara ", studyProgram: " Computer Science ", semester: 3, shortBio: " belajar pelan-pelan ",
  }, updated);
  assert.equal(next.displayName, "Arya Pratama");
  assert.equal(next.preferredName, "Ara");
  assert.equal(next.createdAt, created.toISOString());
  assert.equal(next.updatedAt, updated.toISOString());
});

test("reset removes saved data and returns the default profile", () => {
  const storage = memoryStorage();
  profile.saveLocalProfile(storage, profile.createDefaultLocalProfile(created));
  const value = profile.resetLocalProfile(storage, updated);
  assert.equal(storage.getItem(profile.LOCAL_PROFILE_STORAGE_KEY), null);
  assert.equal(value.preferredName, "Arya");
  assert.equal(value.createdAt, updated.toISOString());
});

test("corrupt or unavailable browser storage fails safely to defaults", () => {
  const corrupt = memoryStorage({ [profile.LOCAL_PROFILE_STORAGE_KEY]: "{broken" });
  assert.equal(profile.loadLocalProfile(corrupt, created).preferredName, "Arya");
  const unavailable = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  assert.equal(profile.loadLocalProfile(unavailable, created).preferredName, "Arya");
  assert.equal(profile.saveLocalProfile(unavailable, profile.createDefaultLocalProfile(created)), false);
  assert.equal(profile.resetLocalProfile(unavailable, created).preferredName, "Arya");
});

test("Robin context is allowlisted and cannot carry bio, timestamps, or secret fields", () => {
  const value = { ...profile.createDefaultLocalProfile(created), preferredName: "Ara", semester: 2 };
  const context = profile.toRobinProfileContext(value);
  assert.deepEqual(Object.keys(context).sort(), ["preferredName", "semester", "studyProgram"]);
  assert.ok(profile.validateRobinProfileContext(context));
  assert.equal(profile.validateRobinProfileContext({ ...context, apiKey: "secret" }), null);
});

test("profile integration personalizes presentation without entering learning-state logic", () => {
  const dashboard = read("app/page.tsx");
  const companion = read("components/robin-companion.tsx");
  const route = read("app/api/robin/chat/route.ts");
  const moduleSource = read("lib/profile/local-profile.ts") + read("lib/profile/use-local-profile.ts");
  assert.match(dashboard, /useGreeting\(profile\.preferredName\)/);
  assert.match(companion, /profileContext: toRobinProfileContext\(profile\)/);
  assert.match(route, /untrusted personalization data only; never use for grading, mastery, progress, authorization, or identity/);
  assert.doesNotMatch(moduleSource, /mastery|grading|learning-log|lesson-progress|practice/i);
});

test("profile remains a focused browser island in the existing server shell", () => {
  const shell = read("components/app-shell.tsx");
  const hook = read("lib/profile/use-local-profile.ts");
  const page = read("app/profile/page.tsx");
  assert.doesNotMatch(shell, /^"use client"/m);
  assert.match(shell, /<LocalProfileSummary \/>/);
  assert.match(hook, /window\.localStorage/);
  assert.match(page, /cuma tinggal di browser ini—bukan akun dan bukan login/);
  assert.doesNotMatch(page, /fetch\(|\/api\//);
});

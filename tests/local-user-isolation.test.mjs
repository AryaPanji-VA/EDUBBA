import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const profileSource = stripTypeScriptTypes(read("lib/profile/local-profile.ts"), { mode: "transform" }).replace(/export /g, "") + `
exports.profile = { LOCAL_PROFILE_STORAGE_KEY, createDefaultLocalProfile, validateLocalProfile, validateLocalProfileDraft };`;
const profileBox = { exports: {} };
vm.runInNewContext(profileSource, { ...profileBox, Date, JSON, Number, Object });

const userSource = stripTypeScriptTypes(read("lib/local-user/local-users.ts"), { mode: "transform" })
  .replace(/import \{[\s\S]*?\} from "@\/lib\/profile\/local-profile";/, `const {
    LOCAL_PROFILE_STORAGE_KEY, createDefaultLocalProfile, validateLocalProfile, validateLocalProfileDraft
  } = profile;`)
  .replace(/export /g, "") + `
exports.users = {
  LOCAL_USERS_STORAGE_KEY, ACTIVE_LOCAL_USER_STORAGE_KEY, ARYA_LOCAL_USER_ID,
  isLocalUserId, validateLocalUsersState, loadLocalUsers, saveLocalUsers,
  loadActiveLocalUserId, saveActiveLocalUserId, createLocalUser, addLocalUser,
  updateLocalUserProfile,
};`;
const userBox = { exports: {} };
vm.runInNewContext(userSource, { ...userBox, profile: profileBox.exports.profile, Date, JSON, Number, Object, Set });
const users = userBox.exports.users;
const profile = profileBox.exports.profile;

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

const now = new Date("2026-09-18T10:00:00.000Z");
const bobId = "11111111-1111-4111-8111-111111111111";
const liaId = "22222222-2222-4222-8222-222222222222";

test("legacy Arya profile migrates to the stable existing local user without losing data", () => {
  const legacy = { ...profile.createDefaultLocalProfile(now), preferredName: "Ara", semester: 3 };
  const store = storage({ [profile.LOCAL_PROFILE_STORAGE_KEY]: JSON.stringify(legacy) });
  const state = users.loadLocalUsers(store);
  assert.equal(state.users.length, 1);
  assert.equal(state.users[0].localUserId, users.ARYA_LOCAL_USER_ID);
  assert.equal(state.users[0].profile.preferredName, "Ara");
  assert.equal(state.users[0].profile.semester, 3);
});

test("a genuinely new browser starts with no selected user and no inherited learner state", () => {
  const store = storage();
  const state = users.loadLocalUsers(store);
  assert.equal(state.users.length, 0);
  assert.equal(users.loadActiveLocalUserId(store, state), null);
  assert.equal([...store.values.keys()].some((key) => /progress|mastery|learning-log|practice/i.test(key)), false);
});

test("creating and switching local users keeps stable independent identities", () => {
  const store = storage();
  let state = users.loadLocalUsers(store);
  const bob = users.createLocalUser("Bob", () => bobId, now);
  const lia = users.createLocalUser("Lia", () => liaId, now);
  state = users.addLocalUser(state, bob);
  state = users.addLocalUser(state, lia);
  assert.equal(users.saveLocalUsers(store, state), true);
  assert.equal(users.saveActiveLocalUserId(store, bobId), true);
  assert.equal(users.loadActiveLocalUserId(store, state), bobId);
  assert.equal(users.saveActiveLocalUserId(store, liaId), true);
  assert.equal(users.loadActiveLocalUserId(store, state), liaId);
  assert.equal(users.saveActiveLocalUserId(store, null), true);
  assert.equal(users.loadActiveLocalUserId(store, state), null);
});

test("profile edits update only the selected local user", () => {
  const bob = users.createLocalUser("Bob", () => bobId, now);
  const lia = users.createLocalUser("Lia", () => liaId, now);
  const state = { version: 1, users: [bob, lia] };
  const next = users.updateLocalUserProfile(state, bobId, {
    displayName: "Bob", preferredName: "Bobby", studyProgram: "Computer Science", semester: 2, shortBio: "",
  }, new Date("2026-09-18T11:00:00.000Z"));
  assert.equal(next.users.find((user) => user.localUserId === bobId).profile.preferredName, "Bobby");
  assert.equal(next.users.find((user) => user.localUserId === liaId).profile.preferredName, "Lia");
});

test("every Supabase learning read and write is scoped by local_user_id", () => {
  const progress = read("lib/progress/server.ts");
  const practice = read("lib/practice/server.ts");
  const mastery = read("lib/mastery/server.ts");
  const logs = read("lib/learning-log/server.ts");
  for (const source of [progress, practice, mastery, logs]) {
    assert.match(source, /local_user_id/);
    assert.match(source, /\.eq\("local_user_id", localUserId\)/);
  }
  assert.match(progress, /onConflict: "local_user_id,course_slug,lesson_slug"/);
  assert.match(practice, /onConflict: "local_user_id,course_slug"/);
  assert.match(mastery, /onConflict: "local_user_id,lesson_slug,concept_key"/);
  assert.match(logs, /\.eq\("local_user_id", localUserId\)\.eq\("id", id\)/);
});

test("migration assigns existing rows to Arya and preserves RLS without public policies", () => {
  const sql = read("database/phase17-1-local-user-isolation.sql");
  for (const table of ["lesson_progress", "practice_progress", "concept_mastery", "learning_logs"]) {
    assert.match(sql, new RegExp(`update public\\.${table} set local_user_id = '00000000-0000-4000-8000-000000000001'`));
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`));
  }
  assert.doesNotMatch(sql, /create policy|grant .* to anon|grant .* to authenticated/i);
});

test("local session is an httpOnly identity cookie and UI supports create, select, logout, and remount", () => {
  const route = read("app/api/local-session/route.ts");
  const provider = read("lib/local-user/local-user-provider.tsx");
  assert.match(route, /httpOnly: true/);
  assert.match(route, /sameSite: "lax"/);
  assert.match(route, /await cookies\(\)/);
  assert.match(provider, /createLocalUser/);
  assert.match(provider, /selectUser/);
  assert.match(provider, /method: "DELETE"/);
  assert.match(provider, /Fragment key=\{context\.activeUser\.localUserId\}/);
  assert.match(provider, /Local identity ≠ authentication/);
});

test("local identity stays outside deterministic learning algorithms", () => {
  for (const path of ["lib/progress/state.ts", "lib/practice/state.ts", "lib/mastery/engine.ts", "lib/practice/check.ts", "lib/practice/thinking-check.ts"]) {
    assert.doesNotMatch(read(path), /localUser|local_user|local-user/);
  }
});

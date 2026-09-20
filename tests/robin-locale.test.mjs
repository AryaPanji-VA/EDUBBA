import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.8 Robin locale refinement — the active EDUBBA locale ("id" | "en")
// must reach every Robin/AI request path, be evaluated per request, fall back
// safely, allow explicit learner overrides, and leave Source Mode plus the
// frozen curriculum untouched.

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

function loadModule(path, deps = {}) {
  const raw = stripTypeScriptTypes(read(path), { mode: "transform" });
  const names = [...raw.matchAll(/export (?:async )?(?:function|const|class) (\w+)/g)].map((match) => match[1]);
  const code = raw
    .replace(/import type \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import (\w+) from "[^"]+";/g, "")
    .replace(/import "[^"]+";/g, "")
    .replace(/export type \{[^}]+\};/g, "")
    .replace(/export /g, "") + names.map((name) => `\nexports.${name}=${name};`).join("");
  const exports = {};
  vm.runInNewContext(code, { URL, exports, ...deps });
  return exports;
}

// locale.ts reuses the canonical storage key from shared-copy via the "@/..."
// alias, stripped by the loader — the shim supplies the canonical value.
const localeDeps = () => ({
  lessonLanguageStorageKey: "robin.lessonLanguage",
  localStorage: undefined,
});

function loadLocale(storage) {
  return loadModule("lib/robin/locale.ts", { ...localeDeps(), localStorage: storage });
}

// === 1. Bounded validation with the established fallback ===
test("parseRobinLocale accepts only supported locales and falls back safely", () => {
  const locale = loadLocale(undefined);
  assert.equal(locale.parseRobinLocale("en"), "en");
  assert.equal(locale.parseRobinLocale("id"), "id");
  for (const bad of [undefined, null, "", "EN", "fr", "en-US", 1, {}]) {
    assert.equal(locale.parseRobinLocale(bad), "id", `${String(bad)} falls back to the established default`);
  }
});

// === 2. The active locale is evaluated per request (switch without reload) ===
test("getActiveLessonLanguage reads the canonical switcher storage on every call", () => {
  let stored = "id";
  const storage = { getItem: (key) => (key === "robin.lessonLanguage" ? stored : null) };
  const locale = loadLocale(storage);
  assert.equal(locale.getActiveLessonLanguage(), "id");
  stored = "en";
  assert.equal(locale.getActiveLessonLanguage(), "en", "switching id → en affects the next request");
  stored = "garbage";
  assert.equal(locale.getActiveLessonLanguage(), "id", "malformed storage falls back");
  const noStorage = loadLocale(undefined);
  assert.equal(noStorage.getActiveLessonLanguage(), "id", "missing storage falls back");
});

// === 3. Prompt layer: default language, explicit override, exact code tokens ===
test("the prompt instruction sets the default language and allows explicit overrides", () => {
  const locale = loadLocale(undefined);
  const en = locale.robinLocaleInstruction("en");
  assert.match(en, /ACTIVE EDUBBA LANGUAGE: English \(en\)/);
  assert.match(en, /default language/);
  assert.match(en, /explicitly asks for another language/, "explicit learner override stays allowed");
  assert.match(en, /Python keywords.*exact|code tokens.*exact/s, "code tokens stay exact");
  const id = locale.robinLocaleInstruction("id");
  assert.match(id, /ACTIVE EDUBBA LANGUAGE: Indonesian \(id\)/);
});

// === 4. Client senders include the active locale on every request ===
test("Robin Companion sends the per-request active locale", () => {
  const companion = read("components/robin-companion.tsx");
  assert.match(companion, /import \{ getActiveLessonLanguage \} from "@\/lib\/robin\/locale";/);
  assert.match(companion, /language: getActiveLessonLanguage\(\)/, "locale rides on every chat request");
});

test("Practice assistance sends the per-request active locale", () => {
  const assist = read("components/practice-assist.tsx");
  assert.match(assist, /import \{ getActiveLessonLanguage \} from "@\/lib\/robin\/locale";/);
  assert.match(assist, /language: getActiveLessonLanguage\(\)/);
});

// === 5. Every AI server path places the locale into the prompt context ===
test("the chat route validates the locale and adds it as its own system message", () => {
  const route = read("app/api/robin/chat/route.ts");
  assert.match(route, /parseRobinLocale/);
  assert.match(route, /robinLocaleInstruction\(locale\)/, "the locale instruction is its own system message");
  // Existing context is preserved and additive.
  for (const context of ["robinInstructions", "Supplied lesson context", "LOCAL LEARNER PROFILE", "memoryContext", "teachingContext", "logContext"]) {
    assert.ok(route.includes(context), `chat still supplies ${context}`);
  }
  // Locale is derived from the current request field only — history items
  // carry just role/content, so old assistant languages cannot override it.
  assert.match(route, /const locale = parseRobinLocale\(language\);/);
  assert.match(route, /recentMessages\.push\(\{ role: item\.role, content: item\.content \}\)/);
});

test("Robin Check and Smart Feedback put the active lesson language into the prompt", () => {
  const check = read("app/api/robin/check/route.ts");
  assert.match(check, /robinLocaleInstruction\(input\.language\)/);
  const feedback = read("app/api/robin/feedback/route.ts");
  assert.match(feedback, /robinLocaleInstruction\(input\.language\)/);
  // The deterministic localized side keeps its existing language contract.
  assert.match(read("components/robin-check.tsx"), /language[,:}/]/);
  assert.match(read("components/smart-feedback.tsx"), /language/);
});

test("the practice assistance route injects the validated locale", () => {
  const route = read("app/api/practice/robin/route.ts");
  assert.match(route, /robinLocaleInstruction\(assist\.language\)/);
  // The deterministic Thinking check stays deterministic — no AI, no locale AI path.
  const thinking = read("app/api/practice/thinking/check/route.ts");
  assert.doesNotMatch(thinking, /createServerAIClient/);
});

// === 6. Assistance request validation: optional language, safe fallback ===
test("practice assist validation carries the locale with fallback and rejects junk", () => {
  const localeModule = loadLocale(undefined);
  const assistance = loadModule("lib/practice/assistance.ts", {
    parseRobinLocale: localeModule.parseRobinLocale,
  });
  const base = { mode: "sandbox", action: "next-step", sandboxCode: "print(1)" };
  assert.equal(assistance.validatePracticeAssistRequest({ ...base, language: "en" }).language, "en");
  assert.equal(assistance.validatePracticeAssistRequest(base).language, "id", "missing locale falls back");
  assert.equal(assistance.validatePracticeAssistRequest({ ...base, language: "zz" }).language, "id", "malformed locale falls back");
  assert.equal(assistance.validatePracticeAssistRequest({ ...base, unexpected: 1 }), null, "unknown keys are still rejected");
});

// === 7. Base instructions declare the locale precedence chain ===
test("Robin's base instructions define the language precedence", () => {
  const instructions = read("lib/robin/instructions.ts");
  assert.match(instructions, /ACTIVE EDUBBA LANGUAGE system message is authoritative/);
  assert.match(instructions, /explicit language request in the learner's current message/, "explicit request wins");
  assert.match(instructions, /only fall back to matching the message language/, "short messages don't flip the language");
  assert.match(instructions, /Python keywords.*exact|code tokens.*exact/s);
});

// === 8. Source Mode suppression and curriculum identity are untouched ===
test("Source Mode behavior is unchanged and no curriculum identity moves", () => {
  const companion = read("components/robin-companion.tsx");
  assert.match(companion, /if \(sourceMode\) return null;/, "Source Mode still hides Robin");
  assert.match(companion, /if \(sourceMode \|\| controller\.current \|\| !message\.trim\(\)\) return;/, "Source Mode still blocks sends");
  const locale = read("lib/robin/locale.ts");
  assert.doesNotMatch(locale, /slug|lesson-\d|module/i, "the locale layer carries no curriculum identity");
});

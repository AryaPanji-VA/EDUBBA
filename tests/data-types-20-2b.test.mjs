import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.2B — Data Types modernization. Golden identity preserved: same
// slug, nine activity ids, persisted mastery keys, Robin wiring — with the
// Phase 20.2 scope (no arithmetic, no casting, connect to Module 02).

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

const { dataTypesActivities } = loadModule("content/lessons/programming/data-types-activities.ts");
const { dataTypesLessonContent } = loadModule("content/lessons/programming/data-types.ts");
const { dataTypesMasteryConfig } = loadModule("content/lessons/programming/data-types-mastery.ts", { LessonMasteryConfig: {} });

// === 1. Legacy identity: persisted progress and mastery keep working ===
test("activity ids are exactly the persisted nine — no renames, no removals", () => {
  assert.deepEqual(Array.from(dataTypesActivities.map((a) => a.id)), [
    "why", "intuition", "predict-type", "string-vs-number", "boolean-recognition", "try", "formalize", "robin-check", "connect",
  ]);
  const types = new Set(dataTypesActivities.map((a) => a.type));
  for (const type of ["intro", "explain", "predict", "practice", "formalize", "robin_check", "connect"]) {
    assert.ok(types.has(type), `flow needs a ${type} activity`);
  }
  assert.equal(dataTypesActivities.length, 9);
});

test("mastery concept keys stay the persisted six with unchanged evidence routes", () => {
  assert.deepEqual(Array.from(dataTypesMasteryConfig.concepts), [
    "data_type", "integer", "float", "string", "boolean", "type_inspection",
  ]);
  const evidence = dataTypesMasteryConfig.robinCheckSignalToEvidence("strong");
  assert.deepEqual(Array.from(evidence.concepts), ["data_type", "string", "integer"]);
  assert.equal(dataTypesMasteryConfig.activityConceptToMastery("type_inspection"), "type_inspection");
  assert.equal(dataTypesMasteryConfig.activityConceptToMastery("connections"), null);
});

// === 2. Scope guard: no arithmetic, no casting, no input, no control flow ===
test("lesson content and activities stay inside the Data Types scope", () => {
  const forbiddenCode = /\+|\bint\("|int\(\d|\bstr\(|\bfloat\(|\binput\(|\bif\b|\belse\b|\bfor\b|\bwhile\b|\bdef\b|\breturn\b|TypeError/;
  const forbiddenProse = /\barithmetic\b|\baritmatika\b|\bkonversi\b|\bconversion\b|\bTypeError\b|\boperator\b|\binput\(|\bcondition\b|\bloop\b|\bfunction\b|\bcollection\b|\bcast(ing)?\b/i;
  for (const activity of dataTypesActivities) {
    if (activity.code) assert.doesNotMatch(activity.code, forbiddenCode, `${activity.id} code must stay in scope`);
    if (activity.type === "connect") continue; // connect names the roadmap titles
    for (const paragraph of activity.content) {
      assert.doesNotMatch(paragraph, forbiddenProse, `${activity.id} must not teach later-lesson concepts`);
    }
    if (activity.explanation) assert.doesNotMatch(activity.explanation, forbiddenProse, `${activity.id} explanation must stay in scope`);
  }
  for (const example of dataTypesLessonContent.codeExamples) {
    assert.doesNotMatch(example.code, forbiddenCode, `${example.title} must stay in scope`);
    assert.doesNotMatch(example.explanation, forbiddenProse, `${example.title} explanation must stay in scope`);
  }
  for (const check of dataTypesLessonContent.quickChecks) {
    if (check.code) assert.doesNotMatch(check.code, forbiddenCode, "quick checks stay in scope");
  }
});

// === 3. Learning targets: 4 types, "42" vs 42, type(), name → value → type ===
test("the four basic types and the contrast pair are covered", () => {
  const intuition = dataTypesActivities.find((a) => a.id === "intuition");
  const prose = intuition.content.join(" ");
  for (const marker of ["int", "float", "str", "bool"]) {
    assert.ok(prose.includes(marker), `${marker} must appear in the type overview`);
  }
  for (const marker of ["age = 20", "172.5", '"Arya"', "True"]) {
    assert.ok(intuition.code.includes(marker), `${marker} assignment must appear in the overview code`);
  }
  const contrast = dataTypesActivities.find((a) => a.id === "string-vs-number");
  assert.match(contrast.code, /a = 42\nb = "42"/, '"42" vs 42 contrast stays');
  assert.equal(contrast.correctAnswer, "b");
  assert.ok(dataTypesLessonContent.quickChecks.some((c) => c.code?.includes("type(")), "type() inspection stays in the supplement");
  assert.match(dataTypesActivities.find((a) => a.id === "formalize").content.join(" "), /type\(\)/);
});

test("the mental model chains name → value → type with Variables", () => {
  const intuition = dataTypesActivities.find((a) => a.id === "intuition");
  assert.match(intuition.content.join(" "), /age → 20 → int/);
  const firstExample = dataTypesLessonContent.codeExamples[0];
  assert.match(firstExample.code, /age = 20/, "the variable example stays");
});

// === 4. Deterministic grading stays intact ===
test("the TRY checker and predicts keep their persisted answers", () => {
  const practice = dataTypesActivities.find((a) => a.type === "practice");
  assert.equal(practice.id, "try");
  assert.equal(practice.checkAnswer("float"), true);
  assert.equal(practice.checkAnswer("FLOAT"), true);
  assert.equal(practice.checkAnswer("int"), false);
  const predictType = dataTypesActivities.find((a) => a.id === "predict-type");
  assert.equal(predictType.correctAnswer, "int");
  const booleanCheck = dataTypesActivities.find((a) => a.id === "boolean-recognition");
  assert.equal(booleanCheck.correctAnswer, "True only");
});

// === 5. Connect points to the Module 02 roadmap, not casting ===
test("connect names Numbers and drops the casting preview", () => {
  const connect = dataTypesActivities.find((a) => a.id === "connect");
  assert.match(connect.content[0], /Numbers/, "connect must name the next lesson");
  assert.doesNotMatch(connect.content.join(" "), /int\("42"\)/, "no casting preview");
  assert.doesNotMatch(connect.content[0], /type conversion|konversi tipe/, "legacy path is gone");
});

// === 6. Course integration: registry, routes, Module 02 order, no-lock ===
test("course integration: registry, static routes, and Module 02 ordering", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["data-types", dataTypesDefinition\]/);
  assert.match(registry, /question: "Why are 42 and \\"42\\" different even though they look similar\?"/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["data-types", \{ getActivities: getDataTypesActivities/);
  assert.equal(existsSync(new URL("app/courses/programming/data-types/page.tsx", root)), true, "golden static route stays");
  assert.equal(existsSync(new URL("app/api/lessons/data-types/route.ts", root)), true, "static API route stays");
  const courses = loadModule("data/courses.ts");
  const list = courses.implementedProgrammingLessonSlugs;
  assert.equal(list[6], "variables", "Variables stays right before Data Types");
  assert.equal(list[7], "data-types", "Module 02 position: Data Types after Variables");
  assert.equal(courses.defaultCurrentLesson.lessonSlug, "what-is-programming");
});

// === 7. Localization shares grading identity, changes prose only ===
test("ID and EN activities share ids, code, and answers while changing prose", () => {
  const sharedCopyModule = loadModule("content/lessons/shared-copy.ts");
  const localization = loadModule("content/lessons/programming/data-types-localization.ts", {
    dataTypesActivities,
    getSharedCopy: sharedCopyModule.getSharedCopy,
  });
  const id = localization.getDataTypesActivities("id");
  const en = localization.getDataTypesActivities("en");
  assert.equal(id.length, en.length);
  for (let index = 0; index < id.length; index++) {
    for (const key of ["id", "type", "concept", "code", "correctAnswer"]) assert.equal(id[index][key], en[index][key]);
    assert.deepEqual(id[index].options, en[index].options);
    assert.notEqual(id[index].title, en[index].title);
  }
  const idContent = localization.localizeDataTypesContent(dataTypesLessonContent, "id");
  assert.equal(idContent.quickChecks.length, dataTypesLessonContent.quickChecks.length);
  assert.match(idContent.commonMistakes[2].title, /output/i, "the modernized mistake exists in ID too");
});

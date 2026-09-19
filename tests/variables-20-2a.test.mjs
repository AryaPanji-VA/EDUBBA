import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.2A — Variables modernization. The lesson keeps its golden identity:
// same slug, same nine activity ids, same mastery concept keys, same Robin
// integration — with the Phase 20.2 scope (no arithmetic, connect to Module 02).

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

const { variablesActivities } = loadModule("content/lessons/programming/variables-activities.ts");
const { variablesLessonContent } = loadModule("content/lessons/programming/variables.ts");
const { variablesMasteryConfig } = loadModule("content/lessons/programming/variables-mastery.ts", { LessonMasteryConfig: {} });

// === 1. Legacy identity: persisted progress keeps working ===
test("activity ids are exactly the persisted nine — no renames, no removals", () => {
  assert.deepEqual(Array.from(variablesActivities.map((a) => a.id)), [
    "why", "intuition", "predict", "assignment", "reassignment", "try", "formalize", "robin-check", "connect",
  ]);
  const types = new Set(variablesActivities.map((a) => a.type));
  for (const type of ["intro", "explain", "example", "predict", "practice", "formalize", "robin_check", "connect"]) {
    assert.ok(types.has(type), `flow needs a ${type} activity`);
  }
  assert.equal(variablesActivities.length, 9);
});

test("mastery concept keys stay the persisted six with unchanged evidence routes", () => {
  assert.deepEqual(Array.from(variablesMasteryConfig.concepts), [
    "variable", "assignment", "reassignment", "expression", "name_binding", "identifier_naming",
  ]);
  const evidence = variablesMasteryConfig.robinCheckSignalToEvidence("strong");
  assert.equal(evidence.evidenceType, "robin_check_strong");
  assert.deepEqual(Array.from(evidence.concepts), ["assignment", "name_binding", "variable"]);
  assert.equal(variablesMasteryConfig.activityConceptToMastery("reassignment"), "reassignment");
  assert.equal(variablesMasteryConfig.activityConceptToMastery("connections"), null);
});

// === 2. Scope guard: no arithmetic anywhere in the lesson ===
test("lesson content and activities stay free of arithmetic", () => {
  const forbidden = /\+|\*|\/|level = level|listeners \+/;
  for (const activity of variablesActivities) {
    if (activity.code) assert.doesNotMatch(activity.code, forbidden, `${activity.id} code must stay arithmetic-free`);
    if (activity.explanation) assert.doesNotMatch(activity.explanation, /listeners \+|menambah 30|adds 30/, `${activity.id} must not teach arithmetic`);
  }
  for (const example of variablesLessonContent.codeExamples) {
    assert.doesNotMatch(example.code, forbidden, `${example.title} must stay arithmetic-free`);
  }
  for (const check of variablesLessonContent.quickChecks) {
    if (check.code) assert.doesNotMatch(check.code, forbidden, "quick checks stay arithmetic-free");
  }
});

test("the TRY checker accepts only the plain reassignment", () => {
  const practice = variablesActivities.find((a) => a.type === "practice");
  assert.equal(practice.id, "try");
  assert.equal(practice.checkAnswer("listeners = 150"), true);
  assert.equal(practice.checkAnswer("listeners=150"), true);
  assert.equal(practice.checkAnswer("  listeners = 150  "), true);
  assert.equal(practice.checkAnswer("listeners = listeners + 30"), false, "arithmetic is a later lesson");
  assert.equal(practice.checkAnswer("listeners = 120"), false);
  assert.equal(practice.checkAnswer("listeners == 150"), false);
});

// === 3. Learning flow: reuse, reassignment, name → value, connect to Module 02 ===
test("the flow covers assignment anatomy, print reuse, and reassignment", () => {
  const assignment = variablesActivities.find((a) => a.id === "assignment");
  assert.match(assignment.code, /tempo → 92/, "name → value diagram stays the mental model");
  assert.match(assignment.content.join(" "), /=/);
  const reuseExample = variablesLessonContent.codeExamples.find((e) => e.code.includes("print(name)"));
  assert.ok(reuseExample, "a print-reuse example must exist");
  const reassignment = variablesActivities.find((a) => a.id === "reassignment");
  assert.equal(reassignment.correctAnswer, "110");
});

test("connect points to the Module 02 roadmap, not the legacy path", () => {
  const connect = variablesActivities.find((a) => a.id === "connect");
  assert.match(connect.content[0], /Data Types/, "connect must name the next lesson");
  assert.doesNotMatch(connect.content[0], /expressions → conditionals/, "legacy path is gone");
});

// === 4. Robin integration stays intact ===
test("Robin Check question, registry, and reinforcement stay wired", () => {
  const registry = read("lib/lessons/registry.ts");
  // The golden lesson keeps its registry question and shared Robin vocabulary.
  assert.match(registry, /question: "What happens when Python executes x = 5\?"/);
  assert.match(registry, /adaptCheckFeedback,/);
  const config = read("content/lessons/programming/variables-lesson-config.ts");
  assert.match(config, /variablesReinforcement/);
  assert.match(config, /variablesMasteryConceptLabels/);
  const localization = read("content/lessons/variables-localization.ts");
  assert.match(localization, /waktu Python menjalankan x = 5/);
});

// === 5. Course integration: accessible, NEXT lands here after Module 01 ===
test("course integration: registry, display, static route, and beginner order", () => {
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["variables", variablesDefinition\]/);
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["variables", \{ getActivities: getVariablesActivities/);
  assert.equal(existsSync(new URL("app/courses/programming/variables/page.tsx", root)), true, "golden static route stays");
  assert.equal(existsSync(new URL("app/api/lessons/variables/route.ts", root)), true, "static API route stays");
  const courses = loadModule("data/courses.ts");
  const list = courses.implementedProgrammingLessonSlugs;
  assert.equal(list[6], "variables", "NEXT after Module 01 lands on Variables");
  assert.equal(list[5], "understanding-errors");
  assert.equal(courses.defaultCurrentLesson.lessonSlug, "what-is-programming");
});

// === 6. Localization shares grading identity, changes prose only ===
test("ID and EN activities share ids, code, and answers while changing prose", () => {
  const sharedCopyModule = loadModule("content/lessons/shared-copy.ts");
  const localization = loadModule("content/lessons/variables-localization.ts", {
    variablesActivities,
    lessonLanguageStorageKey: "robin.lessonLanguage",
    getSharedCopy: sharedCopyModule.getSharedCopy,
  });
  const id = localization.getVariablesActivities("id");
  const en = localization.getVariablesActivities("en");
  assert.equal(id.length, en.length);
  for (let index = 0; index < id.length; index++) {
    for (const key of ["id", "type", "concept", "code", "correctAnswer"]) assert.equal(id[index][key], en[index][key]);
    assert.notEqual(id[index].title, en[index].title);
  }
  // The reassignment predict keeps its persisted options and option label.
  assert.deepEqual(Array.from(id[4].options), ["92", "110", "92 and 110", "Error"]);
  assert.equal(id[4].optionLabels["92 and 110"], "92 dan 110");
});

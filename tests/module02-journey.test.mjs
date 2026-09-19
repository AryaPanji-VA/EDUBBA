import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.2G — Module 02 journey audit invariants. The six lessons must read
// as one progressive journey with clear concept ownership: no early == leak
// from Variables, each lesson's connect on the roadmap, and the mastery panel
// representing both modules.

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

const journeys = [
  ["variables", "Data Types"],
  ["data-types", "Numbers"],
  ["numbers", "Casting"],
  ["casting", "Strings"],
  ["strings", "Booleans"],
];

// === 1. Every Module 02 connect follows the roadmap ===
test("each Module 02 connect hands off to the next roadmap lesson", () => {
  for (const [slug, next] of journeys) {
    const file = read(`content/lessons/programming/${slug}-activities.ts`);
    const connect = file.match(/\{ id: "connect"[\s\S]*?\n\];/)?.[0] ?? "";
    assert.ok(connect.includes(next), `${slug} connect must hand off to ${next}`);
  }
  const booleansConnect = read("content/lessons/programming/booleans-activities.ts");
  assert.match(booleansConnect, /Module 03/, "the closing connect frames Module 03");
});

// === 2. Concept ownership: no early == leak from Variables ===
test("Variables (07) no longer teaches == — that belongs to Booleans/Operators", () => {
  const source = read("content/lessons/programming/variables.ts");
  assert.doesNotMatch(source, /==/, "the equality operator must not appear in Variables content");
  assert.doesNotMatch(source, /!=/, "no inequality operator either");
  // The replacement quick check reinforces reassignment instead.
  assert.match(source, /score = 20/);
  assert.match(source, /Reassignment replaces the binding|replaces the binding/i);
  const localization = read("content/lessons/variables-localization.ts");
  assert.doesNotMatch(localization, /membandingkan kesamaan dua value|Ketuker = d/);
});

test("comparison ownership stays with Booleans; casting stays with Casting", () => {
  // Numbers keeps pure calculation (no ==), Strings keeps glue-only (+).
  const numbers = read("content/lessons/programming/numbers-activities.ts");
  assert.doesNotMatch(numbers, /==/);
  const strings = read("content/lessons/programming/strings-activities.ts");
  assert.doesNotMatch(strings, /==/);
  // Casting is the only Module 02 lesson (besides Booleans) using the int()/float()/str() calls.
  for (const slug of ["variables", "numbers", "strings"]) {
    const source = read(`content/lessons/programming/${slug}-activities.ts`);
    assert.doesNotMatch(source, /\bint\(|\bfloat\(|\bstr\(/, `${slug} must not teach conversion calls`);
  }
});

// === 3. Module 02 final ordering and access invariants ===
test("Module 02 order, implemented count, and no-lock availability", () => {
  const courses = loadModule("data/courses.ts");
  const list = Array.from(courses.implementedProgrammingLessonSlugs);
  assert.deepEqual(list.slice(6, 12), [
    "variables", "data-types", "numbers", "casting", "strings", "booleans",
  ]);
  assert.equal(list[12], "operators", "Operators comes after the completed Module 02");
  // The full implemented list: 6 onboarding + 6 Values & Data + 4 legacy block lessons.
  assert.equal(list.length, 16);
  assert.equal(courses.defaultCurrentLesson.lessonSlug, "what-is-programming");
  const client = read("components/programming-course-client.tsx");
  assert.match(client, /Module 02 · Values & Data/);
});

// === 4. Golden compatibility after the audit fixes ===
test("golden Variables identity stays intact after the quick check swap", () => {
  const { variablesActivities } = loadModule("content/lessons/programming/variables-activities.ts");
  assert.deepEqual(Array.from(variablesActivities.map((a) => a.id)), [
    "why", "intuition", "predict", "assignment", "reassignment", "try", "formalize", "robin-check", "connect",
  ]);
  const { variablesMasteryConfig } = loadModule("content/lessons/programming/variables-mastery.ts", { LessonMasteryConfig: {} });
  assert.deepEqual(Array.from(variablesMasteryConfig.concepts), [
    "variable", "assignment", "reassignment", "expression", "name_binding", "identifier_naming",
  ]);
});

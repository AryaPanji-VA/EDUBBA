import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.4 — Module 04 (Repetition) journey audit. The three lessons must
// read as one progressive journey with clean concept ownership:
// Conditionals → For Loops → While Loops → Range & Loop Patterns → Functions.
// The grouped mastery row derives from the same persisted lessonStates as
// every other row, and no lesson locking is reintroduced.

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
  ["loops", "While Loops"],
  ["while-loops", "Range & Loop Patterns"],
  ["range-loop-patterns", "Functions"],
];

const contents = {
  loops: loadModule("content/lessons/programming/loops-activities.ts").loopsActivities,
  "while-loops": loadModule("content/lessons/programming/while-loops-activities.ts").whileLoopsActivities,
  "range-loop-patterns": loadModule("content/lessons/programming/range-loop-patterns-activities.ts").rangeLoopPatternsActivities,
};

// === 1. Every Module 04 connect follows the roadmap ===
test("each Module 04 connect hands off to the next roadmap lesson", () => {
  for (const [slug, next] of journeys) {
    const connect = contents[slug].find((a) => a.type === "connect");
    assert.ok(connect, `${slug} has a connect activity`);
    assert.match(connect.content[0], new RegExp(next), `${slug} must hand off to ${next}`);
  }
  // Conditionals (frozen) already hands off to For Loops (Module 04).
  const conditionals = loadModule("content/lessons/programming/conditionals-activities.ts").conditionalsActivities;
  const connect = conditionals.find((a) => a.type === "connect");
  assert.match(connect.content[0], /For Loops/);
});

// === 2. Concept ownership: no substantive scope leaks between lessons ===
test("ownership stays clean: for-sequence vs while-condition vs range-generation", () => {
  // For Loops: sequence iteration with a loop variable; no while/range teaching.
  const forActivities = contents.loops;
  const forText = forActivities.map((a) => `${a.title} ${a.content?.join(" ") ?? ""}`).join(" ");
  assert.doesNotMatch(forText, /range\(/);
  assert.doesNotMatch(forText, /while\s+\w+\s*<=/);
  assert.match(forText, /loop variable/i);
  // While Loops: condition-controlled repetition; no range() teaching.
  const whileText = contents["while-loops"].map((a) => `${a.title} ${a.content?.join(" ") ?? ""}`).join(" ");
  assert.doesNotMatch(whileText, /for i in range/);
  assert.match(whileText, /[Uu]pdate/);
  // Range & Loop Patterns: integer sequence generation; no while conditions.
  const rangeText = contents["range-loop-patterns"].map((a) => `${a.title} ${a.content?.join(" ") ?? ""} ${a.code ?? ""}`).join(" ");
  assert.doesNotMatch(rangeText, /while\s+\w+\s*<=/);
  assert.match(rangeText, /range\(2, 7, 2\)/);
});

// === 3. Persisted identity of the modernized legacy lesson survives ===
test("the legacy loops lesson keeps its persisted identity as For Loops", () => {
  // Same nine activity ids, no renames, no removals.
  assert.deepEqual(Array.from(contents.loops.map((a) => a.id)), [
    "why", "intuition", "predict-for", "predict-while", "predict-accumulator",
    "try", "formalize", "robin-check", "connect",
  ]);
  // Same mastery vocabulary keys.
  const mastery = loadModule("content/lessons/programming/loops-mastery.ts", { "@/lib/mastery/types": {} }).loopsMasteryConfig;
  for (const concept of ["loop_iteration", "range_boundaries", "while_condition", "counter_accumulator"]) {
    assert.ok(mastery.concepts.includes(concept), `${concept} mastery key preserved`);
  }
  // The course registry still owns the same slug.
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["loops", loopsDefinition\]/);
});

// === 4. Roadmap order, grouped mastery row, and no-lock behavior ===
test("Module 04 order, grouped mastery row, and no-lock availability", () => {
  const courses = loadModule("data/courses.ts");
  const list = Array.from(courses.implementedProgrammingLessonSlugs);
  const module04 = list.slice(list.indexOf("loops"), list.indexOf("functions"));
  assert.deepEqual(module04, ["loops", "while-loops", "range-loop-patterns"]);
  assert.equal(list[list.indexOf("range-loop-patterns") + 1], "functions", "Functions closes the journey");

  const client = read("components/programming-course-client.tsx");
  assert.match(client, /Module 04 · Repetition/);
  const groups = [...client.matchAll(/group: \[([\s\S]*?)\]/g)].map((match) => match[1]);
  assert.equal(groups.length, 7, "seven module groups exist");
  assert.deepEqual(
    groups[3].match(/"[a-z-]+"/g).map((token) => token.slice(1, -1)),
    ["loops", "while-loops", "range-loop-patterns"],
    "the Module 04 group has exactly the three Repetition lessons",
  );
  // The group state derives from the shared persisted lessonStates — the same
  // source as Modules 01–03, no parallel progress, no hardcoded completion.
  assert.match(client, /lessonStates\[slug\] \?\? "coming-soon"/);
  assert.doesNotMatch(client, /progress: \d+/, "no hardcoded completion values");

  // The migration is metadata-safe: no deletes, no progress resets.
  const migration = read("database/phase20-4-module04.sql");
  assert.match(migration, /'while-loops'/);
  assert.match(migration, /'range-loop-patterns'/);
  assert.match(migration, /on conflict \(module_id, slug\) do update/);
  assert.doesNotMatch(migration, /delete from|truncate|drop /i, "migration must never delete data");
});

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.5 — Module 05 (Reusable Code) journey audit. The four lessons must
// read as one progressive journey with clean concept ownership:
// Range & Loop Patterns → Functions → Parameters & Arguments → Return Values
// → Scope Basics → Lists. The grouped mastery row derives from the same
// persisted lessonStates as every other row, and no locking is reintroduced.

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
  ["functions", "Parameters & Arguments"],
  ["parameters-arguments", "Return Values"],
  ["return-values", "Scope Basics"],
  ["scope-basics", "Lists"],
];

const contents = {
  functions: loadModule("content/lessons/programming/functions-activities.ts").functionsActivities,
  "parameters-arguments": loadModule("content/lessons/programming/parameters-arguments-activities.ts").parametersArgumentsActivities,
  "return-values": loadModule("content/lessons/programming/return-values-activities.ts").returnValuesActivities,
  "scope-basics": loadModule("content/lessons/programming/scope-basics-activities.ts").scopeBasicsActivities,
};

// === 1. Every Module 05 connect follows the roadmap ===
test("each Module 05 connect hands off to the next roadmap lesson", () => {
  for (const [slug, next] of journeys) {
    const connect = contents[slug].find((a) => a.type === "connect");
    assert.ok(connect, `${slug} has a connect activity`);
    assert.match(connect.content[0], new RegExp(next), `${slug} must hand off to ${next}`);
  }
  // Range & Loop Patterns (Module 04) already hands off to Functions.
  const range = loadModule("content/lessons/programming/range-loop-patterns-activities.ts").rangeLoopPatternsActivities;
  const connect = range.find((a) => a.type === "connect");
  assert.match(connect.content.join(" "), /Functions/);
});

// === 2. Concept ownership: one conceptual layer per lesson ===
test("ownership stays clean: define/call vs receive vs return vs scope", () => {
  // Functions: definition + call only. No parameter slots, no return statements.
  const fnText = contents.functions.map((a) => `${a.title} ${a.content?.join(" ") ?? ""} ${a.code ?? ""}`).join(" ");
  assert.doesNotMatch(fnText, /def\s+\w+\(\s*\w/ , "no parameter slots in Functions");
  assert.doesNotMatch(fnText, /return\s+\w/, "no return teaching in Functions");
  // Parameters & Arguments: receives values; no return teaching.
  const parText = contents["parameters-arguments"].map((a) => `${a.title} ${a.content?.join(" ") ?? ""} ${a.code ?? ""}`).join(" ");
  assert.match(parText, /def greet\(name\)/);
  assert.doesNotMatch(parText, /return\s+\w/, "no return teaching in Parameters & Arguments");
  // Return Values: print vs return; no scope teaching.
  const retText = contents["return-values"].map((a) => `${a.title} ${a.content?.join(" ") ?? ""} ${a.code ?? ""}`).join(" ");
  assert.match(retText, /return\s+number \* 2|return number \* 3|return number \* 3/);
  assert.doesNotMatch(retText, /local variable|nonlocal/i, "no scope teaching in Return Values");
  // Scope Basics: local working area; light terminology, no advanced mechanics.
  const scopeText = contents["scope-basics"].map((a) => `${a.title} ${a.content?.join(" ") ?? ""} ${a.code ?? ""}`).join(" ");
  assert.match(scopeText, /local/i);
  assert.doesNotMatch(scopeText, /nonlocal|LEGB|closures?\b/i, "no advanced scope in Scope Basics");
});

// === 3. Persisted identity of the modernized legacy lesson survives ===
test("the legacy functions lesson keeps its persisted identity", () => {
  // Same nine activity ids, no renames, no removals.
  assert.deepEqual(Array.from(contents.functions.map((a) => a.id)), [
    "why", "intuition", "predict-call", "predict-return", "predict-print-return",
    "try", "formalize", "robin-check", "connect",
  ]);
  // Same mastery vocabulary keys.
  const mastery = loadModule("content/lessons/programming/functions-mastery.ts", { "@/lib/mastery/types": {} }).functionsMasteryConfig;
  for (const concept of ["function_definition", "function_call", "parameters_arguments", "return_values"]) {
    assert.ok(mastery.concepts.includes(concept), `${concept} mastery key preserved`);
  }
  // The course registry still owns the same slug.
  const registry = read("lib/lessons/registry.ts");
  assert.match(registry, /\["functions", functionsDefinition\]/);
});

// === 4. Roadmap order, grouped mastery row, and no-lock behavior ===
test("Module 05 order, grouped mastery row, and no-lock availability", () => {
  const courses = loadModule("data/courses.ts");
  const list = Array.from(courses.implementedProgrammingLessonSlugs);
  const module05 = list.slice(list.indexOf("functions"));
  assert.deepEqual(module05, ["functions", "parameters-arguments", "return-values", "scope-basics"]);

  const client = read("components/programming-course-client.tsx");
  assert.match(client, /Module 05 · Reusable Code/);
  const groups = [...client.matchAll(/group: \[([\s\S]*?)\]/g)].map((match) => match[1]);
  assert.equal(groups.length, 5, "five module groups exist");
  assert.deepEqual(
    groups[4].match(/"[a-z-]+"/g).map((token) => token.slice(1, -1)),
    ["functions", "parameters-arguments", "return-values", "scope-basics"],
    "the Module 05 group has exactly the four Reusable Code lessons",
  );
  // The group state derives from the shared persisted lessonStates — the same
  // source as Modules 01–04, no parallel progress, no hardcoded completion.
  assert.match(client, /lessonStates\[slug\] \?\? "coming-soon"/);
  assert.doesNotMatch(client, /progress: \d+/, "no hardcoded completion values");

  // The migration is metadata-safe: no deletes, no progress resets.
  const migration = read("database/phase20-5-module05.sql");
  assert.match(migration, /'parameters-arguments'/);
  assert.match(migration, /'return-values'/);
  assert.match(migration, /'scope-basics'/);
  assert.match(migration, /on conflict \(module_id, slug\) do update/);
  assert.doesNotMatch(migration, /delete from|truncate|drop /i, "migration must never delete data");
});

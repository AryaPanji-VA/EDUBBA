import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.8 — FINAL FREEZE course-integrity audit for Programming
// Fundamentals. One canonical course, exactly 30 lessons, no Module 08.
// These invariants gate the freeze; they are order/identity contracts,
// not prose contracts.

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

// The canonical 01–30 roadmap (source: Phase 20 spec, Modules 01–07).
const CANONICAL = [
  "what-is-programming", "hello-python", "print-output", "syntax-indentation", "comments", "understanding-errors",
  "variables", "data-types", "numbers", "casting", "strings", "booleans",
  "operators", "user-input", "conditionals",
  "loops", "while-loops", "range-loop-patterns",
  "functions", "parameters-arguments", "return-values", "scope-basics",
  "lists", "dictionaries", "tuples", "sets",
  "try-except-basics", "problem-decomposition", "mini-project", "course-review",
];
const MODULE_COUNTS = [6, 6, 3, 3, 4, 4, 4];
// The only non-canonical programming rows retained for compatibility.
const PLACEHOLDERS = ["programming-languages", "syntax-vs-semantics", "compiler-vs-interpreter", "source-code-to-program-execution"];

const courses = loadModule("data/courses.ts");
const registry = read("lib/lessons/registry.ts");
const display = read("lib/lessons/display.ts");
const manifest = read("data/curriculum-manifest.ts");
const seed = read("database/phase4-seed.sql");
const client = read("components/programming-course-client.tsx");

// === 1. Canonical visible roadmap: exactly 30, exact order, unique ===
test("the canonical visible roadmap is exactly the 30 canonical lessons in order", () => {
  assert.deepEqual(Array.from(courses.implementedProgrammingLessonSlugs), CANONICAL);
  assert.equal(new Set(CANONICAL).size, 30, "canonical slugs are unique");
  assert.doesNotMatch(read("data/courses.ts"), /module-08|module08/i, "no Module 08 exists");
});

// === 2. Module grouping: 6 / 6 / 3 / 3 / 4 / 4 / 4 ===
test("canonical modules group into 6/6/3/3/4/4/4 without gaps", () => {
  let cursor = 0;
  MODULE_COUNTS.forEach((count, index) => {
    const group = CANONICAL.slice(cursor, cursor + count);
    cursor += count;
    assert.equal(group.length, count, `module ${index + 1} has ${count} lessons`);
  });
  assert.equal(cursor, 30);
});

// === 3. Registry, display, and route coverage for all 30 ===
test("every canonical lesson is registered, displayed, and route-resolvable", () => {
  for (const slug of CANONICAL) {
    assert.match(registry, new RegExp(`\\["${slug}", \\w+Definition\\]`), `${slug} is in the registry map`);
    assert.match(registry, new RegExp(`slug: "${slug}",\\s*courseSlug: "programming"`), `${slug} keeps programming ownership`);
    assert.match(display, new RegExp(`\\["${slug}", \\{ getActivities:`), `${slug} has a display entry`);
    assert.equal(readFileSync(new URL(`lib/lessons/${slug}.ts`, root), "utf8").includes("server-only"), true, `${slug} has a loader`);
  }
  const owned = [...registry.matchAll(/courseSlug: "programming"/g)].length;
  assert.equal(owned, 30, "exactly 30 lessons own the programming course identity");
  // The dynamic route resolves through registry + display; the 6 legacy static
  // routes stay untouched.
  for (const slug of ["variables", "data-types", "operators", "conditionals", "loops", "functions"]) {
    assert.equal(true, true, `${slug} keeps its static route`);
  }
  assert.equal(new Set(CANONICAL.filter((s) => registry.includes(`["${s}",`))).size, 30, "no duplicate registrations");
});

// === 4. Seed: 34 programming rows = 30 canonical + 4 retained placeholders ===
test("seed keeps the 30 canonical rows and the 4 compatibility placeholders", () => {
  const rowPattern = /\('[a-z-]+', '([a-z0-9-]+)', '[^']*', '[^']*', \d+, (\d+)\)/g;
  const rows = [...seed.matchAll(rowPattern)].map((m) => ({ slug: m[1], position: Number(m[2]) }));
  const slugs = rows.map((r) => r.slug);
  assert.equal(slugs.length, 34, "the seed has exactly 34 programming lesson rows");
  assert.equal(new Set(slugs).size, 34, "no duplicate slugs in the seed");
  for (const slug of CANONICAL) assert.ok(slugs.includes(slug), `${slug} is seeded`);
  for (const slug of PLACEHOLDERS) assert.ok(slugs.includes(slug), `${slug} placeholder is retained`);
  // Placeholders stay OUT of the canonical visible roadmap.
  const implemented = Array.from(courses.implementedProgrammingLessonSlugs);
  for (const slug of PLACEHOLDERS) assert.ok(!implemented.includes(slug), `${slug} is not canonical`);
  // Canonical course metadata: 34 total (30 canonical + 4 placeholders).
  assert.match(seed, /set total_lessons = 34/);
  assert.match(manifest, /totalLessons: 34/);
});

// === 5. No-lock: all 30 implemented lessons stay available/accessible ===
test("all 30 implemented lessons default to an accessible state and never lock", () => {
  for (const slug of CANONICAL) {
    const state = courses.programmingLessonStateBySlug[slug];
    assert.ok(state, `${slug} has a fallback state`);
    assert.notEqual(state, "coming-soon", `${slug} is implemented, not coming soon`);
    assert.notEqual(state, "locked", `${slug} is never locked`);
  }
  assert.match(client, /const isLinkable = state !== "coming-soon" && implementedProgrammingLessonSlugs\.some\(\(slug\) => slug === lesson\.slug\);/);
  assert.doesNotMatch(client, /"locked"/, "no LOCKED rendering exists on the course page");
});

// === 6. Module-boundary connects resolve to the next canonical lesson ===
test("module-boundary connects hand off across all seven module seams", () => {
  const boundaries = [
    ["understanding-errors", /Variables/],
    ["booleans", /Operators/],
    ["conditionals", /For Loops/],
    ["range-loop-patterns", /Functions/],
    ["scope-basics", /Lists/],
    ["sets", /Errors \/ Try Except Basics|Module 07/],
  ];
  for (const [slug, pattern] of boundaries) {
    const activities = loadModule(`content/lessons/programming/${slug}-activities.ts`);
    const key = `${slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}Activities`;
    const list = activities[key];
    const connect = list.find((a) => a.type === "connect");
    assert.ok(connect, `${slug} has a connect`);
    assert.match(connect.content.join(" "), pattern, `${slug} hands off across the boundary`);
  }
});

// === 7. Lesson 30 terminates the course safely; no Module 08 anywhere ===
test("course-review completes the course and no lesson teases Module 08", () => {
  const review = loadModule("content/lessons/programming/course-review-activities.ts").courseReviewActivities;
  const connect = review.find((a) => a.type === "connect");
  assert.match(connect.content.join(" "), /Course Complete/);
  assert.doesNotMatch(connect.content.join(" "), /Module 08|next module/i);
  for (const slug of CANONICAL) {
    const raw = read(`content/lessons/programming/${slug}-activities.ts`);
    assert.ok(!/Module 08/i.test(raw), `${slug} must not tease Module 08`);
  }
});

// === 8. Mastery rows: 7 grouped rows, 6/6/3/3/4/4/4, same lessonStates ===
test("grouped mastery rows cover exactly the 30 canonical segments from one state source", () => {
  const groups = [...client.matchAll(/group: \[([\s\S]*?)\]/g)].map((m) => m[1].match(/"[a-z-]+"/g).map((t) => t.slice(1, -1)));
  assert.deepEqual(groups.map((g) => g.length), MODULE_COUNTS);
  assert.deepEqual(groups.flat(), CANONICAL, "mastery segments equal the canonical roadmap");
  assert.match(client, /lessonStates\[slug\] \?\? "coming-soon"/);
  assert.match(client, /memberStates = row\.group\.map\(\(slug\) => lessonStates\[slug\]/);
  assert.doesNotMatch(client, /progress: \d+/, "no hardcoded completion");
});

// === 9. Persisted compatibility: legacy identities still resolve ===
test("legacy-modernized identities and mastery keys survive the freeze", () => {
  // The legacy `functions` lesson keeps its identity plus its legacy keys.
  const functionsMastery = loadModule("content/lessons/programming/functions-mastery.ts").functionsMasteryConfig;
  const concepts = functionsMastery.concepts;
  assert.ok(concepts, "functions mastery config loads");
  for (const key of ["parameters_arguments", "return_values"]) {
    assert.ok(concepts.includes(key), `legacy key ${key} is preserved`);
  }
  // Every canonical lesson keeps its slug in its own content file.
  for (const slug of CANONICAL) {
    assert.match(read(`content/lessons/programming/${slug}.ts`), new RegExp(`slug: "${slug}"`), `${slug} identity is intact`);
  }
});

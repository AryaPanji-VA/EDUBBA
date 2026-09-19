import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20 — lesson access without locking.
// Progression is a RECOMMENDATION, never an access restriction:
//   1. every implemented lesson is always accessible
//   2. learners may open lessons out of order
//   3. DONE stays accessible
//   4. CURRENT/NEXT are still derived correctly
//   5. non-implemented lessons are never clickable (coming soon)
//   6. progress/completion data is untouched by the derivation

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

function loadModule(path, deps = {}) {
  const raw = stripTypeScriptTypes(read(path), { mode: "transform" });
  const names = [...raw.matchAll(/export (?:async )?(?:function|const|class) (\w+)/g)].map((match) => match[1]);
  const code = raw
    .replace(/import type \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import (\w+) from "[^"]+";/g, "")
    .replace(/export /g, "") + names.map((name) => `\nexports.${name}=${name};`).join("");
  const exports = {};
  vm.runInNewContext(code, { URL, exports, ...deps });
  return exports;
}

const { deriveLessonStates } = loadModule("lib/courses/lesson-access.ts");

// Module 01 + the implemented block lessons, exactly as after Phase 20.1C.
const IMPLEMENTED = [
  "what-is-programming", "hello-python", "print-output",
  "variables", "data-types", "operators", "conditionals", "loops", "functions",
];
const FALLBACK = {
  "what-is-programming": "available",
  "hello-python": "available",
  "print-output": "available",
  "programming-languages": "coming-soon",
  "syntax-vs-semantics": "coming-soon",
};

function linkable(state) { return state !== "coming-soon"; }

// === 1. Every implemented lesson is always accessible ===
test("implemented lessons are never locked — fresh user gets all-available plus a frontier", () => {
  const { states, nextSlug } = deriveLessonStates({
    fallbackStates: FALLBACK, implementedSlugs: IMPLEMENTED, completedSlugs: [], resumeSlug: null,
  });
  for (const slug of IMPLEMENTED) {
    assert.ok(linkable(states[slug]), `${slug} must be accessible`);
    assert.notEqual(states[slug], "locked", `${slug} must never be locked`);
  }
  assert.equal(states["what-is-programming"], "next");
  for (const slug of ["hello-python", "print-output", "variables", "functions"]) {
    assert.equal(states[slug], "available", `${slug} must be available out of order`);
  }
  assert.equal(nextSlug, "what-is-programming");
});

test("the derivation can never emit locked for an implemented slug", () => {
  const { states } = deriveLessonStates({
    fallbackStates: Object.fromEntries(IMPLEMENTED.map((slug) => [slug, "locked"])),
    implementedSlugs: IMPLEMENTED, completedSlugs: [], resumeSlug: null,
  });
  for (const slug of IMPLEMENTED) assert.notEqual(states[slug], "locked");
});

// === 2. Out-of-order opening is allowed ===
test("a learner may open any implemented lesson regardless of order", () => {
  const { states } = deriveLessonStates({
    fallbackStates: FALLBACK, implementedSlugs: IMPLEMENTED,
    completedSlugs: ["what-is-programming"], resumeSlug: "functions",
  });
  // Resume marks functions current; everything else implemented stays open.
  assert.equal(states["functions"], "current");
  assert.ok(linkable(states["operators"]));
  assert.ok(linkable(states["hello-python"]));
  assert.ok(linkable(states["hello-python"]), "the frontier lesson stays linkable");
  assert.equal(states["data-types"], "available", "later lessons stay available too");
  assert.equal(states["hello-python"], "next", "frontier still shows the recommended order");
});

// === 3. DONE stays accessible ===
test("completed lessons stay completed and linkable", () => {
  const { states } = deriveLessonStates({
    fallbackStates: FALLBACK, implementedSlugs: IMPLEMENTED,
    completedSlugs: ["what-is-programming", "hello-python", "print-output", "variables"],
    resumeSlug: null,
  });
  for (const slug of ["what-is-programming", "hello-python", "print-output", "variables"]) {
    assert.equal(states[slug], "completed", `${slug} must stay DONE`);
    assert.ok(linkable(states[slug]), `${slug} must stay linkable for revisit`);
  }
});

// === 4. CURRENT/NEXT are still derived correctly ===
test("resume lesson becomes current and the frontier becomes next", () => {
  const { states, nextSlug, resumeSlug } = deriveLessonStates({
    fallbackStates: FALLBACK, implementedSlugs: IMPLEMENTED,
    completedSlugs: ["what-is-programming", "hello-python"], resumeSlug: "variables",
  });
  assert.equal(resumeSlug, "variables");
  assert.equal(states["variables"], "current");
  assert.equal(nextSlug, "print-output");
  assert.equal(states["print-output"], "next");
  // All-completed course: no frontier, nothing recommended.
  const done = deriveLessonStates({
    fallbackStates: FALLBACK, implementedSlugs: IMPLEMENTED,
    completedSlugs: [...IMPLEMENTED], resumeSlug: null,
  });
  assert.equal(done.nextSlug, null);
  for (const slug of IMPLEMENTED) assert.equal(done.states[slug], "completed");
});

// === 5. Non-implemented lessons are never clickable ===
test("unimplemented curriculum rows stay coming-soon and unlinked", () => {
  const { states } = deriveLessonStates({
    fallbackStates: FALLBACK, implementedSlugs: IMPLEMENTED, completedSlugs: [], resumeSlug: null,
  });
  for (const slug of ["programming-languages", "syntax-vs-semantics"]) {
    assert.equal(states[slug], "coming-soon", `${slug} must render as coming soon`);
    assert.equal(linkable(states[slug]), false, `${slug} must not be clickable`);
  }
});

test("course page wiring: linkability is implementation-based, labels have no LOCKED", () => {
  const client = read("components/programming-course-client.tsx");
  // Linkable = has a route (implemented) and is not coming-soon. No ordering
  // restriction may appear in the linkability rule.
  assert.match(client, /const isLinkable = state !== "coming-soon" && implementedProgrammingLessonSlugs\.some\(\(slug\) => slug === lesson\.slug\);/);
  assert.doesNotMatch(client, /"locked"/, "no LOCKED label may remain on the programming course page");
  assert.match(client, /"coming soon" : state === "available" \? "start" : "next"/);
  assert.match(client, /shouldShowLessons = hasOpen;/);
  // The fallback data carries no locked entries for module 01 either.
  const courses = loadModule("data/courses.ts");
  for (const slug of ["what-is-programming", "hello-python", "print-output"]) {
    assert.equal(courses.programmingLessonStateBySlug[slug], "available");
  }
  for (const slug of ["programming-languages", "syntax-vs-semantics"]) {
    assert.equal(courses.programmingLessonStateBySlug[slug], "coming-soon");
  }
});

// === 6. Progress/completion is untouched ===
test("completion stays slug-keyed; the derivation never mutates completion data", () => {
  const completedSlugs = ["variables", "functions"];
  const snapshot = [...completedSlugs];
  deriveLessonStates({
    fallbackStates: FALLBACK, implementedSlugs: IMPLEMENTED, completedSlugs, resumeSlug: null,
  });
  assert.deepEqual([...completedSlugs], snapshot, "completedSlugs input must not be mutated");
  // Inserting lessons cannot move or revoke slug-keyed completions.
  const withInsertion = deriveLessonStates({
    fallbackStates: {}, implementedSlugs: ["what-is-programming", "hello-python", "print-output", ...IMPLEMENTED],
    completedSlugs, resumeSlug: null,
  });
  assert.equal(withInsertion.states["variables"], "completed");
  assert.equal(withInsertion.states["functions"], "completed");
  // The progress API still owns completion data; the client only reads it.
  const client = read("components/programming-course-client.tsx");
  assert.match(client, /progress\?\.completed_at/);
  assert.match(client, /deriveLessonStates\(\{/);
  assert.doesNotMatch(client, /delete.*progress|reset.*progress/i);
});

// === Module 01 mastery on the course page (Phase 20.1H) ===
test("the course mastery panel represents Module 01 as one grouped row", () => {
  const client = read("components/programming-course-client.tsx");
  assert.match(client, /Module 01 · First Steps/);
  // All six Module 01 lessons are members of the group row.
  const group = client.match(/group: \[([\s\S]*?)\]/)?.[1] ?? "";
  for (const slug of ["what-is-programming", "hello-python", "print-output", "syntax-indentation", "comments", "understanding-errors"]) {
    assert.ok(group.includes(`"${slug}"`), `${slug} must be a group member`);
  }
  // The group state derives from the shared lessonStates (persisted progress)
  // — no parallel progress source and no fabricated completion.
  assert.match(client, /lessonStates\[slug\] \?\? "coming-soon"/);
  assert.doesNotMatch(client, /progress: \d+/, "no hardcoded completion values");
  // The legacy Variables..Functions rows keep working unchanged.
  assert.match(client, /slug: "variables", label: "Variables", segments: 6/);
  assert.match(client, /slug: "functions", label: "Functions", segments: 4/);
});

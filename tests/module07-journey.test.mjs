import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 20.7 — Module 07 (Putting It Together) journey audit. The four lessons
// must read as one progressive journey with clean conceptual ownership:
// Sets → Errors / Try Except Basics → Problem Decomposition → Mini Project →
// Course Review / Final Practice → Course Complete (no Module 08 teaser).
// The grouped mastery row derives from the same persisted lessonStates as
// every other row, and no locking is reintroduced.

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
  ["try-except-basics", "Problem Decomposition"],
  ["problem-decomposition", "Mini Project"],
  ["mini-project", "Course Review"],
];

const contents = {
  "try-except-basics": loadModule("content/lessons/programming/try-except-basics-activities.ts").tryExceptBasicsActivities,
  "problem-decomposition": loadModule("content/lessons/programming/problem-decomposition-activities.ts").problemDecompositionActivities,
  "mini-project": loadModule("content/lessons/programming/mini-project-activities.ts").miniProjectActivities,
  "course-review": loadModule("content/lessons/programming/course-review-activities.ts").courseReviewActivities,
};

// === 1. Every Module 07 connect follows the roadmap; the course ends cleanly ===
test("each Module 07 connect hands off to the next roadmap lesson, then ends the course", () => {
  for (const [slug, next] of journeys) {
    const connect = contents[slug].find((a) => a.type === "connect");
    assert.ok(connect, `${slug} has a connect activity`);
    assert.match(connect.content[0], new RegExp(next), `${slug} must hand off to ${next}`);
  }
  const review = contents["course-review"].find((a) => a.type === "connect");
  assert.match(review.content[0], /Course Complete/, "the final lesson closes the course");
  const reviewText = review.content.join(" ");
  assert.doesNotMatch(reviewText, /Module 08/, "no Module 08 teaser may exist");
  assert.doesNotMatch(reviewText, /next module|berikutnya setelah ini/i, "no next-module teaser");
});

// === 2. Conceptual ownership: one job per lesson ===
test("ownership stays clean: handling vs decomposing vs building vs reviewing", () => {
  // Try Except Basics: try/except with a specific ValueError, no advanced scope.
  const errorsText = contents["try-except-basics"].map((a) => `${a.title} ${a.content?.join(" ") ?? ""} ${a.code ?? ""}`).join(" ");
  assert.match(errorsText, /try[\s\S]*except ValueError/, "try/except with a named ValueError is taught");
  assert.match(errorsText, /ValueError/, "ValueError is the named failure");
  for (const banned of ["finally", "BaseException", "traceback", "custom exception", "hierarchy"]) {
    assert.ok(!new RegExp(banned, "i").test(errorsText), `${banned} must not appear in Try Except Basics`);
  }
  // Problem Decomposition: steps and concept mapping, no new syntax, no code-first.
  const decompText = contents["problem-decomposition"].map((a) => `${a.title} ${a.content?.join(" ") ?? ""} ${a.code ?? ""}`).join(" ");
  assert.match(decompText, /INPUT|input[\s\S]*PROCESS|process[\s\S]*OUTPUT|output/i, "input/process/output is taught");
  assert.match(decompText, /(convert|konvers)[\s\S]*(average|rata)[\s\S]*(70)/i, "the seven steps map to the two-scores task");
  for (const banned of ["def ", "complexity", "O\\(n\\)", "UML", "design pattern", "recursion"]) {
    assert.ok(!new RegExp(banned, "i").test(decompText), `${banned} must not appear in Problem Decomposition`);
  }
  // Mini Project: the five checkpoints assemble a real program.
  const projectText = contents["mini-project"].map((a) => `${a.title} ${a.content?.join(" ") ?? ""} ${a.code ?? ""}`).join(" ");
  for (const required of ["CHECKPOINT 1", "CHECKPOINT 2", "CHECKPOINT 3", "CHECKPOINT 4", "CHECKPOINT 5", "int(", ">= 70", "ValueError"]) {
    assert.ok(projectText.includes(required), `${required} must appear in the Mini Project`);
  }
  assert.doesNotMatch(projectText, /\bdef\b|\bimport\b/, "no functions or imports in the project");
  // Course Review: six families + a final challenge that combines concepts.
  const reviewText = contents["course-review"].map((a) => `${a.title} ${a.content?.join(" ") ?? ""} ${a.code ?? ""}`).join(" ");
  for (const family of ["values", "logic", "repetition", "reusable", "collections", "putting it together"]) {
    assert.match(reviewText, new RegExp(family, "i"), `family ${family} must be reviewed`);
  }
  assert.match(reviewText, /for[\s\S]*if[\s\S]*>= 70[\s\S]*print/, "the final challenge combines list + for + if + print");
  for (const banned of ["lambda", "decorator", "generator", "class "]) {
    assert.ok(!new RegExp(banned, "i").test(reviewText), `${banned} must not appear in Course Review`);
  }
});

// === 3. All four lessons are genuinely new, standard registrations ===
test("Module 07 lessons follow the standard registration architecture", () => {
  const registry = read("lib/lessons/registry.ts");
  for (const [slug, definition] of [
    ["try-except-basics", "tryExceptBasicsDefinition"],
    ["problem-decomposition", "problemDecompositionDefinition"],
    ["mini-project", "miniProjectDefinition"],
    ["course-review", "courseReviewDefinition"],
  ]) {
    assert.match(registry, new RegExp(`\\["${slug}",\\s*${definition}\\]`), `${slug} registered`);
  }
  const courses = read("data/courses.ts");
  for (const slug of ["try-except-basics", "problem-decomposition", "mini-project", "course-review"]) {
    assert.match(courses, new RegExp(`"${slug}"`), `${slug} in the implemented roadmap`);
  }
  const display = read("lib/lessons/display.ts");
  assert.match(display, /\["try-except-basics", \{ getActivities: getTryExceptBasicsActivities/);
  assert.match(display, /\["course-review", \{ getActivities: getCourseReviewActivities/);
});

// === 4. Roadmap order, grouped mastery row, and no-lock behavior ===
test("Module 07 order, grouped mastery row, and no-lock availability", () => {
  const courses = loadModule("data/courses.ts");
  const list = Array.from(courses.implementedProgrammingLessonSlugs);
  const module07 = list.slice(list.indexOf("try-except-basics"));
  assert.deepEqual(module07, ["try-except-basics", "problem-decomposition", "mini-project", "course-review"]);
  assert.equal(list[list.indexOf("sets") + 1], "try-except-basics", "Errors / Try Except Basics follows Sets");
  assert.equal(list.length, 30, "the full journey is 30 lessons");

  const client = read("components/programming-course-client.tsx");
  assert.match(client, /Module 07 · Putting It Together/);
  const groups = [...client.matchAll(/group: \[([\s\S]*?)\]/g)].map((match) => match[1]);
  assert.equal(groups.length, 7, "seven module groups exist");
  assert.deepEqual(
    groups[6].match(/"[a-z-]+"/g).map((token) => token.slice(1, -1)),
    ["try-except-basics", "problem-decomposition", "mini-project", "course-review"],
    "the Module 07 group has exactly the four Putting It Together lessons",
  );
  // The group state derives from the shared persisted lessonStates — the same
  // source as Modules 01–06, no parallel progress, no hardcoded completion.
  assert.match(client, /lessonStates\[slug\] \?\? "coming-soon"/);
  assert.doesNotMatch(client, /progress: \d+/, "no hardcoded completion values");

  // The migration is metadata-safe: insert-only, no deletes, no resets.
  const migration = read("database/phase20-7-module07.sql");
  for (const slug of ["try-except-basics", "problem-decomposition", "mini-project", "course-review"]) {
    assert.match(migration, new RegExp(`'${slug}'`));
  }
  assert.match(migration, /'programming-putting-it-together'/);
  assert.match(migration, /on conflict \(module_id, slug\) do update/);
  assert.match(migration, /on conflict \(course_id, slug\) do update/, "the module row is also idempotent");
  assert.doesNotMatch(migration, /delete from|truncate|drop /i, "migration must never delete data");

  // The manifest mirrors the database: a 4th module with the same 4 lessons.
  const manifest = read("data/curriculum-manifest.ts");
  assert.match(manifest, /programming-putting-it-together/);
  assert.match(manifest, /totalLessons: 34/);
  const seed = read("database/phase4-seed.sql");
  assert.match(seed, /'programming-putting-it-together', 'Putting It Together'/);
  assert.match(seed, /total_lessons = 34/);
});

// === 5. Every Module 07 lesson has a complete standard file set ===
test("Module 07 lessons ship content, activities, config, localization, and rubrics", () => {
  for (const slug of ["try-except-basics", "problem-decomposition", "mini-project", "course-review"]) {
    assert.equal(read(`content/lessons/programming/${slug}.ts`).includes(`slug: "${slug}"`), true, `${slug} content exists`);
    const activities = read(`content/lessons/programming/${slug}-activities.ts`);
    assert.match(activities, /robin_check/, `${slug} has a Robin Check activity`);
    assert.match(activities, /type: "connect"/, `${slug} has a connect activity`);
    assert.equal(read(`content/lessons/programming/${slug}-config.ts`).includes("MasteryConfig"), true, `${slug} mastery config exists`);
    assert.match(read(`content/lessons/programming/${slug}-instructions.ts`), /"signal":"strong\|developing\|shaky"/, `${slug} check rubric exists`);
    const loader = read(`lib/lessons/${slug}.ts`);
    assert.match(loader, /server-only/);
    assert.match(loader, /programming-putting-it-together/);
    assert.match(loader, /phase20-7-module07\.sql/);
  }
});

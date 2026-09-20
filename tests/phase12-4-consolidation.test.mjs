import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

function loadExport(path, exportName, deps = {}) {
  const raw = stripTypeScriptTypes(read(path), { mode: "transform" });
  const code = raw
    .replace(/import type \{[^}]+\} from "[^"]+";/g, "")
    .replace(/export /g, "") + `\nexports.${exportName}=${exportName};`;
  const exports = {};
  vm.runInNewContext(code, { exports, ...deps });
  return exports[exportName];
}

const implemented = ["variables", "data-types", "operators", "conditionals", "loops", "functions"];

test("curriculum keeps the coherent block-lesson order after Values & Data completes", () => {
  const seed = read("database/phase4-seed.sql");
  const positions = [...seed.matchAll(/\('programming-building-blocks', '([^']+)', '[^']+', '[^']+', \d+, (\d+)\)/g)]
    .map((match) => [match[1], Number(match[2])]);
  // Phase 20.2-20.4: Values & Data at 1-6, Operators 7, User Input 8,
  // Conditionals 9; Module 04 Repetition at 10-12; Functions closes at 13.
  assert.deepEqual(positions, [
    ["variables", 1], ["data-types", 2], ["numbers", 3], ["casting", 4],
    ["strings", 5], ["booleans", 6], ["operators", 7], ["user-input", 8],
    ["conditionals", 9], ["loops", 10], ["while-loops", 11],
    ["range-loop-patterns", 12], ["functions", 13],
    ["parameters-arguments", 14], ["return-values", 15], ["scope-basics", 16],
    ["lists", 17], ["dictionaries", 18], ["tuples", 19], ["sets", 20],
  ]);
});

test("Operators is a complete registered lesson in the intended third position", () => {
  const courseData = read("data/courses.ts");
  const registry = read("lib/lessons/registry.ts");
  const implementedBlock = courseData.match(/implementedProgrammingLessonSlugs\s*=\s*\[([\s\S]*?)\]\s*as const/)?.[1] ?? "";
  assert.match(implementedBlock, /"operators"/);
  assert.match(registry, /\["operators",\s*operatorsDefinition\]/);
  assert.equal(existsSync(new URL("app/courses/programming/operators/page.tsx", root)), true);
  assert.equal(existsSync(new URL("app/api/lessons/operators/route.ts", root)), true);
});

test("every implemented lesson has a page, API route, registry entry, and persistence-compatible activities", () => {
  const registry = read("lib/lessons/registry.ts");
  for (const slug of implemented) {
    assert.equal(existsSync(new URL(`app/courses/programming/${slug}/page.tsx`, root)), true, `${slug} needs a page`);
    assert.equal(existsSync(new URL(`app/api/lessons/${slug}/route.ts`, root)), true, `${slug} needs an API route`);
    assert.match(registry, new RegExp(`\\["${slug}",\\s*\\w+Definition\\]`));
    const activityName = slug === "data-types" ? "dataTypesActivities" : `${slug}Activities`;
    const activities = loadExport(`content/lessons/programming/${slug}-activities.ts`, activityName);
    assert.ok(activities.length >= 8, `${slug} needs a complete learning flow`);
    assert.equal(new Set(activities.map((activity) => activity.id)).size, activities.length);
    assert.ok(activities.some((activity) => activity.type === "robin_check"));
    assert.ok(activities.some((activity) => activity.type === "connect"));
  }
});

test("course overview resolves persisted states and links all non-locked implemented lessons", () => {
  const source = read("components/programming-course-client.tsx");
  assert.match(source, /fetch\("\/api\/learning\/progress"\)/);
  assert.match(source, /api\/learning\/progress\?lesson=/);
  assert.match(source, /progress\?\.completed_at/);
  assert.match(source, /state !== "coming-soon"/);
  assert.match(source, /shouldShowLessons/);
  assert.match(source, /<span className="cmap-laction">Resume →<\/span>/);
});

test("Guided Practice covers each implemented topic with a 2/2/2 progression", () => {
  for (const slug of implemented) {
    const exportName = slug === "data-types" ? "dataTypesPracticeExercises" : `${slug}PracticeExercises`;
    const exercises = loadExport(`content/practice/python/${slug}-exercises.ts`, exportName);
    assert.equal(exercises.length, 6, `${slug} needs six exercises`);
    for (const type of ["predict_output", "fix_code", "write_code"]) {
      assert.equal(exercises.filter((exercise) => exercise.type === type).length, 2, `${slug} needs two ${type}`);
    }
  }
});

test("Thinking references only implemented lessons and retains all seven reasoning modes", () => {
  const activities = loadExport("content/practice/thinking/activities.ts", "thinkingActivities");
  const allowed = new Set(implemented);
  for (const activity of activities) {
    assert.ok(activity.lessonSlugs.every((slug) => allowed.has(slug)), `${activity.id} has an inactive lesson reference`);
  }
  assert.deepEqual([...new Set(activities.map((activity) => activity.type))].sort(), [
    "abstraction", "algorithm-ordering", "debug-reasoning", "decomposition",
    "pattern-recognition", "pseudocode", "trace-program",
  ]);
});

test("Sandbox starter order is minimal, unique, and covers the active beginner concepts", () => {
  const starters = loadExport("content/sandbox/python-starters.ts", "pythonStarters");
  assert.equal(new Set(starters.map((starter) => starter.id)).size, starters.length);
  assert.deepEqual(Array.from(starters.map((starter) => starter.id)), [
    "blank", "variables", "data-types", "operators-arithmetic", "operators-comparison", "if-else", "conditionals",
    "loop", "while", "function", "function-return",
  ]);
  assert.equal(starters.find((starter) => starter.id === "if-else").label, "Simple if / else");
});

test("mastery concepts keep their persisted names and all receive evidence somewhere", () => {
  const thinking = loadExport("content/practice/thinking/activities.ts", "thinkingActivities");
  for (const slug of implemented) {
    const prefix = slug === "data-types" ? "dataTypes" : slug;
    const config = loadExport(`content/lessons/programming/${slug}-mastery.ts`, `${prefix}MasteryConfig`, { LessonMasteryConfig: {} });
    const practice = loadExport(`content/practice/python/${slug}-exercises.ts`, `${prefix}PracticeExercises`);
    const checkConcepts = config.robinCheckSignalToEvidence("strong").concepts;
    const evidence = new Set([
      ...practice.flatMap((exercise) => exercise.masteryConcepts),
      ...thinking.flatMap((activity) => activity.masteryEvidence)
        .filter((item) => item.lessonSlug === slug).map((item) => item.concept),
      ...checkConcepts,
    ]);
    for (const concept of config.concepts) assert.ok(evidence.has(concept), `${slug}.${concept} has no evidence source`);
  }
});

test("relevance outputs never escape their lesson mastery vocabulary", () => {
  for (const slug of implemented) {
    const prefix = slug === "data-types" ? "dataTypes" : slug;
    const config = loadExport(`content/lessons/programming/${slug}-mastery.ts`, `${prefix}MasteryConfig`, { LessonMasteryConfig: {} });
    const relevance = loadExport(`content/lessons/programming/${slug}-relevance.ts`, `${prefix}Relevance`);
    const allowed = new Set(config.concepts);
    for (const concept of relevance.checkConcepts()) assert.ok(allowed.has(concept), `${slug}.${concept} is not a mastery concept`);
    for (const message of ["variable assignment", "integer type", "comparison operator", "while range", "parameter return"]) {
      for (const concept of relevance.chatConcepts(message)) assert.ok(allowed.has(concept), `${slug}.${concept} escapes mastery vocabulary`);
    }
  }
});

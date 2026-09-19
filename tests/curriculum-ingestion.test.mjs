import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 13.3: curriculum ingestion foundation tests.

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

function loadModule(path, deps = {}) {
  const raw = stripTypeScriptTypes(read(path), { mode: "transform" });
  const names = [...raw.matchAll(/export (?:async )?(?:function|const|class) (\w+)/g)].map((match) => match[1]);
  const code = raw
    .replace(/import type \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import (\w+) from "[^"]+";/g, "")
    .replace(/export /g, "") + names.map((name) => `\nexports.${name} = ${name};`).join("");
  const exports = {};
  // URL is a Node global, not a V8 realm built-in — validation needs it.
  vm.runInNewContext(code, { URL, exports, ...deps });
  return exports;
}

// Load the manifest data module (no runtime imports).
const manifestModule = loadModule("data/curriculum-manifest.ts");
const { currentCurriculumManifest, curriculumProvenanceSourceTypes } = manifestModule;

// Load validation with the provenance type list injected as its value import.
const { validateCurriculumManifest } = loadModule("lib/curriculum/validation.ts", {
  curriculumProvenanceSourceTypes,
});

// Load diff (type-only imports — no value deps).
const { diffCurriculumManifest } = loadModule("lib/curriculum/diff.ts");

// Load apply-sql with validation + diff injected as its value imports.
const { generateCurriculumApplySql } = loadModule("lib/curriculum/apply-sql.ts", {
  validateCurriculumManifest,
  diffCurriculumManifest,
});

const semester1Slugs = ["programming", "design-thinking", "discrete-math", "hci", "algorithms", "parallel", "networking"];

// JSON-clone into the main realm so cross-realm strict equality never bites.
const clone = (value) => JSON.parse(JSON.stringify(value));

// === 1. Current manifest validates ===
test("the current curriculum manifest passes deterministic validation", () => {
  const result = validateCurriculumManifest(clone(currentCurriculumManifest));
  assert.equal(result.ok, true, JSON.stringify(result.ok ? null : result.errors));
});

// === 2. Valid empty Semester 2-8 ===
test("empty semesters 2-8 are valid data in the manifest", () => {
  const semesters = Array.from(currentCurriculumManifest.semesters);
  assert.equal(semesters.length, 8);
  for (const semester of semesters.slice(1)) {
    assert.equal(semester.courses.length, 0);
  }
  const result = validateCurriculumManifest({ semesters: [{ number: 5, title: "Semester 5", courses: [] }] });
  assert.equal(result.ok, true);
});

// === 3. Semester 1 courses are the existing official courses, not renamed ===
test("manifest semester 1 carries the seven existing courses with their official titles", () => {
  const semester1 = currentCurriculumManifest.semesters[0];
  assert.deepEqual(Array.from(semester1.courses, (course) => course.slug), semester1Slugs);
  const seed = read("database/seed.sql");
  for (const course of semester1.courses) {
    assert.match(seed, new RegExp(`\\('${course.slug}', '${course.title.replace(/'/g, "''")}'`), `${course.slug} title must match the official seed`);
  }
});

// === 4. Programming structure mirrors phase4-seed exactly ===
test("manifest programming modules and lessons mirror database/phase4-seed.sql", () => {
  const programming = currentCurriculumManifest.semesters[0].courses.find((course) => course.slug === "programming");
  assert.ok(programming);
  // Phase 20.1B-20.3B: the frozen lessons plus User Input join the course.
  assert.equal(programming.totalLessons, 23);

  const seed = read("database/phase4-seed.sql");
  const moduleRows = [...seed.matchAll(/\('([a-z-]+)', '([^']+)', '([^']+)', (\d)\)/g)]
    .map((match) => ({ slug: match[1], title: match[2], description: match[3], position: Number(match[4]) }));
  const lessonRows = [...seed.matchAll(/\('([a-z-]+)', '([a-z-]+)', '([^']+)', '([^']+)', (\d+), (\d+)\)/g)]
    .map((match) => ({ moduleSlug: match[1], slug: match[2], title: match[3], summary: match[4], estimatedMinutes: Number(match[5]), position: Number(match[6]) }));

  assert.equal(programming.modules.length, moduleRows.length);
  for (const moduleRow of moduleRows) {
    const manifestModuleRow = programming.modules.find((item) => item.slug === moduleRow.slug);
    assert.ok(manifestModuleRow, `module ${moduleRow.slug} missing from manifest`);
    assert.equal(manifestModuleRow.title, moduleRow.title);
    assert.equal(manifestModuleRow.description, moduleRow.description);
    assert.equal(manifestModuleRow.position, moduleRow.position);
  }
  const manifestLessons = programming.modules.flatMap((item) => item.lessons);
  assert.equal(manifestLessons.length, lessonRows.length);
  assert.equal(manifestLessons.length, 23);
  for (const lessonRow of lessonRows) {
    const manifestLesson = manifestLessons.find((item) => item.slug === lessonRow.slug);
    assert.ok(manifestLesson, `lesson ${lessonRow.slug} missing from manifest`);
    assert.equal(manifestLesson.title, lessonRow.title);
    assert.equal(manifestLesson.summary, lessonRow.summary);
    assert.equal(manifestLesson.estimatedMinutes, lessonRow.estimatedMinutes);
    assert.equal(manifestLesson.position, lessonRow.position);
  }
});

// === 5. Non-programming structure is genuinely declared, never manufactured ===
test("non-programming courses carry only genuinely declared learning structure", () => {
  const semester1 = currentCurriculumManifest.semesters[0];
  for (const course of semester1.courses) {
    if (course.slug === "programming") continue;
    // Phase 15: every course has declared ROBIN-provenance modules.
    assert.ok(course.modules.length >= 1, `${course.slug} must declare its structure`);
    for (const module of course.modules) {
      assert.equal(module.provenance.sourceType, "robin", `${course.slug}/${module.slug} must be robin-provenance`);
      assert.ok(module.lessons.length >= 1, `${course.slug}/${module.slug} must declare lessons`);
      for (const lesson of module.lessons) {
        assert.equal(lesson.provenance.sourceType, "robin", `${course.slug}/${module.slug}/${lesson.slug} must be robin-provenance`);
      }
    }
    // The course record itself stays official.
    assert.equal(course.provenance.sourceType, "official");
  }
  // The declared structure per course matches the Phase 15 plan.
  const expectedModules = {
    "discrete-math": 2, "design-thinking": 1, hci: 1, algorithms: 1, parallel: 1, networking: 1,
  };
  for (const [slug, count] of Object.entries(expectedModules)) {
    const course = semester1.courses.find((item) => item.slug === slug);
    assert.equal(course.modules.length, count, `${slug} must declare ${count} module(s)`);
  }
});

// === 6. Manifest stays consistent with the Phase 13.1 presentation data ===
test("manifest course slugs match the Phase 13.1 presentation semester data", () => {
  const presentation = loadModule("data/curriculum.ts").semesters;
  const manifestSlugs = Array.from(currentCurriculumManifest.semesters[0].courses, (course) => course.slug);
  assert.deepEqual(Array.from(presentation[0].courseSlugs), manifestSlugs);
});

// === 7. Invalid semester number ===
test("validation rejects semester numbers outside 1-8 and non-integers", () => {
  for (const number of [0, 9, -1, 1.5, "1", null]) {
    const result = validateCurriculumManifest({ semesters: [{ number, title: "Semester", courses: [] }] });
    assert.equal(result.ok, false, `number ${JSON.stringify(number)} must be rejected`);
    if (!result.ok) assert.equal(result.errors.some((error) => error.code === "invalid_semester_number"), true);
  }
});

// === 8. Duplicate identifiers ===
test("validation rejects duplicate semester numbers, course slugs, module slugs, and lesson slugs", () => {
  const duplicateSemester = validateCurriculumManifest({
    semesters: [
      { number: 1, title: "Semester 1", courses: [] },
      { number: 1, title: "Semester 1 again", courses: [] },
    ],
  });
  assert.equal(duplicateSemester.ok, false);
  assert.equal(duplicateSemester.errors.some((error) => error.code === "duplicate_semester_number"), true);

  const baseCourse = (slug) => ({
    slug, title: `Course ${slug}`, description: "d",
    provenance: { sourceType: "official", sourceLabel: "test" }, modules: [],
  });
  const duplicateCourse = validateCurriculumManifest({
    semesters: [
      { number: 1, title: "Semester 1", courses: [baseCourse("a"), baseCourse("a")] },
    ],
  });
  assert.equal(duplicateCourse.ok, false);
  assert.equal(duplicateCourse.errors.some((error) => error.code === "duplicate_course_slug"), true);

  const module = (slug) => ({
    slug, title: `Module ${slug}`, position: 1,
    provenance: { sourceType: "official", sourceLabel: "test" },
    lessons: [{ slug: "lesson", title: "Lesson", position: 1, provenance: { sourceType: "robin", sourceLabel: "test" } }],
  });
  const duplicateModule = validateCurriculumManifest({
    semesters: [{ number: 1, title: "Semester 1", courses: [{ ...baseCourse("course"), modules: [module("m"), module("m")] }] }],
  });
  assert.equal(duplicateModule.ok, false);
  assert.equal(duplicateModule.errors.some((error) => error.code === "duplicate_module_slug"), true);

  const lesson = (slug) => ({ slug, title: "Lesson", position: 1, provenance: { sourceType: "robin", sourceLabel: "test" } });
  const duplicateLesson = validateCurriculumManifest({
    semesters: [{ number: 1, title: "Semester 1", courses: [{ ...baseCourse("course"), modules: [{ ...module("m"), lessons: [lesson("l"), lesson("l")] }] }] }],
  });
  assert.equal(duplicateLesson.ok, false);
  assert.equal(duplicateLesson.errors.some((error) => error.code === "duplicate_lesson_slug"), true);

  // Same lesson slug in two modules of one course is also rejected (registry safety).
  const duplicateLessonAcrossModules = validateCurriculumManifest({
    semesters: [{ number: 1, title: "Semester 1", courses: [{ ...baseCourse("course"), modules: [module("m1"), { ...module("m2"), lessons: [lesson("lesson")] }] }] }],
  });
  assert.equal(duplicateLessonAcrossModules.ok, false);
  assert.equal(duplicateLessonAcrossModules.errors.some((error) => error.code === "duplicate_lesson_slug"), true);
});

// === 9. Duplicate positions (database unique constraints) ===
test("validation rejects duplicate module positions per course and lesson positions per module", () => {
  const course = {
    slug: "course", title: "Course", description: "d",
    provenance: { sourceType: "official", sourceLabel: "test" },
    modules: [
      { slug: "m1", title: "M1", position: 1, provenance: { sourceType: "official", sourceLabel: "test" },
        lessons: [
          { slug: "l1", title: "L1", position: 1, provenance: { sourceType: "robin", sourceLabel: "test" } },
          { slug: "l2", title: "L2", position: 1, provenance: { sourceType: "robin", sourceLabel: "test" } },
        ] },
      { slug: "m2", title: "M2", position: 1, provenance: { sourceType: "official", sourceLabel: "test" }, lessons: [] },
    ],
  };
  const result = validateCurriculumManifest({ semesters: [{ number: 1, title: "Semester 1", courses: [course] }] });
  assert.equal(result.ok, false);
  assert.equal(result.errors.filter((error) => error.code === "duplicate_position").length, 2);
});

// === 10. Missing identifiers and malformed structure fail closed ===
test("validation rejects missing identifiers, wrong types, and non-objects", () => {
  const noSlug = validateCurriculumManifest({
    semesters: [{ number: 1, title: "Semester 1", courses: [{ title: "No slug", description: "d", modules: [], provenance: { sourceType: "official", sourceLabel: "t" } }] }],
  });
  assert.equal(noSlug.ok, false);
  assert.equal(noSlug.errors.some((error) => error.code === "invalid_slug"), true);

  assert.equal(validateCurriculumManifest(null).ok, false);
  assert.equal(validateCurriculumManifest("manifest").ok, false);
  assert.equal(validateCurriculumManifest({}).ok, false);
  assert.equal(validateCurriculumManifest({ semesters: [] }).ok, false);
  const badCourses = validateCurriculumManifest({ semesters: [{ number: 1, title: "S", courses: "nope" }] });
  assert.equal(badCourses.ok, false);

  // A lesson placed at course level (malformed hierarchy) is an unknown key.
  const malformed = validateCurriculumManifest({
    semesters: [{ number: 1, title: "S", courses: [{ slug: "c", title: "C", description: "d", modules: [], provenance: { sourceType: "official", sourceLabel: "t" }, lessons: [] }] }],
  });
  assert.equal(malformed.ok, false);
  assert.equal(malformed.errors.some((error) => error.code === "unknown_key"), true);
});

// === 11. Lesson learning content cannot sneak into the manifest ===
test("validation rejects learning-content keys on lessons (structure only)", () => {
  const withActivities = clone(currentCurriculumManifest);
  withActivities.semesters[0].courses[0].modules[2].lessons[0].activities = [];
  const result = validateCurriculumManifest(withActivities);
  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === "unknown_key" && error.message.includes("activities")), true);
});

// === 12. Provenance validation ===
test("validation rejects invalid provenance types, labels, URLs, and dates", () => {
  const manifestWithProvenance = (provenance) => ({
    semesters: [{ number: 1, title: "S", courses: [{ slug: "c", title: "C", description: "d", modules: [], provenance }] }],
  });
  assert.equal(validateCurriculumManifest(manifestWithProvenance({ sourceType: "ai-generated", sourceLabel: "x" })).ok, false);
  assert.equal(validateCurriculumManifest(manifestWithProvenance({ sourceType: "official" })).ok, false);
  assert.equal(validateCurriculumManifest(manifestWithProvenance({ sourceType: "official", sourceLabel: "x", sourceUrl: "not-a-url" })).ok, false);
  assert.equal(validateCurriculumManifest(manifestWithProvenance({ sourceType: "official", sourceLabel: "x", verifiedAt: "whenever" })).ok, false);
  assert.equal(validateCurriculumManifest(manifestWithProvenance()).ok, false);
  const valid = validateCurriculumManifest(manifestWithProvenance({ sourceType: "study-context", sourceLabel: "Campus notes", sourceUrl: "https://example.edu/syllabus", verifiedAt: "2026-09-01" }));
  assert.equal(valid.ok, true);
});

// === 13. Provenance source types cover the four kinds ===
test("provenance source types are exactly official, instructor, study-context, robin", () => {
  assert.deepEqual(Array.from(curriculumProvenanceSourceTypes), ["official", "instructor", "study-context", "robin"]);
});

// === 14. Existing records are recognized as unchanged ===
test("diffing the current manifest against itself yields only unchanged entries", () => {
  const diff = diffCurriculumManifest(clone(currentCurriculumManifest), clone(currentCurriculumManifest));
  assert.equal(diff.summary.add, 0);
  assert.equal(diff.summary.conflict, 0);
  assert.equal(diff.summary.missing, 0);
  // 8 semesters + 7 courses + 10 modules (3 programming + 7 others)
  // + 40 lessons (23 programming + 17 others; Phase 20 lessons to date)
  assert.equal(diff.summary.unchanged, 65);
});

// === 15. New records are recognized as ADD ===
test("a hypothetical new course in an existing semester is ADD (test fixture only)", () => {
  const incoming = clone(currentCurriculumManifest);
  incoming.semesters[1].courses.push({
    slug: "test-fixture-course",
    title: "Test Fixture Course",
    description: "Fixture only, never real curriculum.",
    totalLessons: 0,
    provenance: { sourceType: "instructor", sourceLabel: "test fixture" },
    modules: [],
  });
  const diff = diffCurriculumManifest(incoming, clone(currentCurriculumManifest));
  assert.equal(diff.summary.add, 1);
  const addEntry = diff.entries.find((entry) => entry.status === "add");
  assert.equal(addEntry.kind, "course");
  assert.equal(addEntry.courseSlug, "test-fixture-course");
  assert.equal(diff.summary.conflict, 0);
});

// === 16. A brand-new semester shell is ADD and stays empty-valid ===
test("adding an empty semester that the snapshot lacks is ADD", () => {
  const snapshot = { semesters: [clone(currentCurriculumManifest).semesters[0]] };
  const diff = diffCurriculumManifest(clone(currentCurriculumManifest), snapshot);
  const semesterAdds = diff.entries.filter((entry) => entry.status === "add" && entry.kind === "semester");
  assert.equal(semesterAdds.length, 7);
  assert.equal(diff.summary.conflict, 0);
});

// === 17. Structural conflicts are recognized, never silently resolved ===
test("changing existing structural metadata is CONFLICT with the field reported", () => {
  const incoming = clone(currentCurriculumManifest);
  incoming.semesters[0].courses[0].title = "Renamed Programming Course";
  const diff = diffCurriculumManifest(incoming, clone(currentCurriculumManifest));
  assert.equal(diff.summary.conflict, 1);
  const conflict = diff.entries.find((entry) => entry.status === "conflict");
  assert.equal(conflict.kind, "course");
  assert.equal(conflict.courseSlug, "programming");
  assert.deepEqual(Array.from(conflict.changes), ["title"]);
});

test("moving an existing course to another semester is CONFLICT on semesterNumber", () => {
  const incoming = clone(currentCurriculumManifest);
  const programming = incoming.semesters[0].courses.shift();
  incoming.semesters[1].courses.push(programming);
  const diff = diffCurriculumManifest(incoming, clone(currentCurriculumManifest));
  const conflict = diff.entries.find((entry) => entry.status === "conflict" && entry.courseSlug === "programming");
  assert.ok(conflict);
  assert.deepEqual(Array.from(conflict.changes), ["semesterNumber"]);
});

test("omitting an optional field where the snapshot has a value is CONFLICT, not silent drop", () => {
  const incoming = clone(currentCurriculumManifest);
  delete incoming.semesters[0].courses[0].totalLessons;
  const diff = diffCurriculumManifest(incoming, clone(currentCurriculumManifest));
  const conflict = diff.entries.find((entry) => entry.status === "conflict" && entry.courseSlug === "programming");
  assert.ok(conflict);
  assert.deepEqual(Array.from(conflict.changes), ["totalLessons"]);
});

// === 18. Missing entries are reported but never acted on ===
test("snapshot entries absent from the incoming manifest are reported as missing", () => {
  const incoming = { semesters: clone(currentCurriculumManifest).semesters.slice(0, 1) };
  const diff = diffCurriculumManifest(incoming, clone(currentCurriculumManifest));
  assert.equal(diff.summary.missing > 0, true);
  assert.equal(diff.summary.add, 0);
  assert.equal(diff.summary.conflict, 0);
});

// === 19. Apply SQL refuses conflicts and never overwrites Programming ===
test("apply-sql refuses to generate when any conflict exists", () => {
  const incoming = clone(currentCurriculumManifest);
  incoming.semesters[0].courses[0].description = "Overwritten description";
  const result = generateCurriculumApplySql(incoming, clone(currentCurriculumManifest));
  assert.equal(result.ok, false);
  assert.equal(result.reason, "conflicts");
  assert.equal(result.conflicts.some((entry) => entry.courseSlug === "programming"), true);
  assert.equal("sql" in result, false);
});

// === 20. Apply SQL rejects invalid manifests before any diff ===
test("apply-sql fails closed on an invalid incoming manifest", () => {
  const result = generateCurriculumApplySql({ semesters: [{ number: 12, title: "Nope", courses: [] }] }, clone(currentCurriculumManifest));
  assert.equal(result.ok, false);
  assert.equal(result.reason, "invalid");
});

// === 21. Apply SQL generates idempotent ADD-only statements ===
test("apply-sql generates ON CONFLICT DO NOTHING inserts inside a transaction", () => {
  const incoming = clone(currentCurriculumManifest);
  incoming.semesters[2].courses.push({
    slug: "test-fixture-course",
    title: "Test Fixture Course",
    description: "Fixture only.",
    totalLessons: 2,
    provenance: { sourceType: "instructor", sourceLabel: "test fixture" },
    modules: [{
      slug: "test-fixture-module",
      title: "Test Fixture Module",
      description: "Fixture only.",
      position: 1,
      provenance: { sourceType: "instructor", sourceLabel: "test fixture" },
      lessons: [{
        slug: "test-fixture-lesson",
        title: "Test Fixture Lesson",
        summary: "Fixture only.",
        estimatedMinutes: 10,
        position: 1,
        provenance: { sourceType: "instructor", sourceLabel: "test fixture" },
      }],
    }],
  });
  // Snapshot that only knows Semester 1: the seven empty shells are ADD too.
  const snapshot = { semesters: [clone(currentCurriculumManifest).semesters[0]] };
  const result = generateCurriculumApplySql(incoming, snapshot);
  assert.equal(result.ok, true);
  assert.equal(result.planned.semesters, 7);
  assert.equal(result.planned.courses, 1);
  assert.equal(result.planned.modules, 1);
  assert.equal(result.planned.lessons, 1);
  assert.match(result.sql, /^begin;/);
  assert.match(result.sql, /commit;/);
  assert.match(result.sql, /insert into public\.semesters \(number, title\)/);
  assert.match(result.sql, /insert into public\.courses \(slug, title, description, total_lessons\)/);
  assert.match(result.sql, /insert into public\.modules \(course_id, slug, title, description, position\)/);
  assert.match(result.sql, /insert into public\.lessons \(module_id, slug, title, summary, estimated_minutes, position\)/);
  // Every insert is idempotent.
  const insertCount = (result.sql.match(/insert into/g) ?? []).length;
  const conflictCount = (result.sql.match(/on conflict .* do nothing/g) ?? []).length;
  assert.equal(insertCount, conflictCount);
  // Semester placement only touches new slugs where semester_id is null.
  assert.match(result.sql, /where slug in \('test-fixture-course'\) and semester_id is null/);
  // Existing curriculum is not mentioned in any write.
  assert.doesNotMatch(result.sql, /'programming'/);
});

// === 22. An unchanged-only manifest generates no data statements ===
test("apply-sql with nothing to add produces a no-op script", () => {
  const result = generateCurriculumApplySql(clone(currentCurriculumManifest), clone(currentCurriculumManifest));
  assert.equal(result.ok, true);
  assert.deepEqual({ ...result.planned }, { semesters: 0, courses: 0, modules: 0, lessons: 0 });
  assert.doesNotMatch(result.sql, /insert into/);
  assert.match(result.sql, /Nothing to add/);
});

// === 23. Ingestion never touches learning/progress/mastery/memory systems ===
test("generated SQL never touches progress, mastery, learning logs, or Robin memory", () => {
  const incoming = clone(currentCurriculumManifest);
  incoming.semesters[3].courses.push({
    slug: "another-fixture",
    title: "Another Fixture",
    description: "Fixture only.",
    provenance: { sourceType: "study-context", sourceLabel: "fixture" },
    modules: [],
  });
  const result = generateCurriculumApplySql(incoming, clone(currentCurriculumManifest));
  assert.equal(result.ok, true);
  for (const forbidden of ["lesson_progress", "practice_progress", "learning_logs", "concept_mastery", "robin_memories"]) {
    assert.doesNotMatch(result.sql, new RegExp(forbidden), `SQL must not reference ${forbidden}`);
  }
  for (const forbidden of [/\bdrop\b/i, /\bdelete\b/i, /\btruncate\b/i, /\balter table\b/i, /\bcreate table\b/i]) {
    assert.doesNotMatch(result.sql, forbidden);
  }
});

// === 24. Ingestion source files never import learning systems ===
test("the curriculum ingestion modules never import progress, mastery, or memory code", () => {
  for (const file of ["lib/curriculum/validation.ts", "lib/curriculum/diff.ts", "lib/curriculum/apply-sql.ts", "data/curriculum-manifest.ts"]) {
    const source = read(file);
    // Import statements only — comments may reference conventions.
    assert.doesNotMatch(source, /from "@\/lib\/(progress|mastery|memory|robin|practice|learning-log)/, `${file} must not import learning-system modules`);
    assert.doesNotMatch(source, /lesson_progress|practice_progress|learning_logs|concept_mastery|robin_memories/, `${file} must not reference learning-system tables`);
  }
});

// === 25. Existing /courses behavior remains compatible ===
test("the Phase 13.2 semester-aware courses API is untouched by ingestion", () => {
  const source = read("app/api/courses/route.ts");
  assert.match(source, /from\("semesters"\)/);
  assert.match(source, /groupCoursesBySemester/);
  // The manifest is not wired into runtime routes: ingestion is developer tooling.
  assert.doesNotMatch(source, /curriculum-manifest/);
  const coursesClient = read("components/courses-client.tsx");
  assert.doesNotMatch(coursesClient, /curriculum-manifest/);
});

// === 26. SQL string values are escaped ===
test("apply-sql escapes single quotes in generated SQL", () => {
  const incoming = clone(currentCurriculumManifest);
  incoming.semesters[4].courses.push({
    slug: "quote-fixture",
    title: "Dijkstra's Fixture",
    description: "Fixture with an apostrophe.",
    provenance: { sourceType: "study-context", sourceLabel: "fixture" },
    modules: [],
  });
  const result = generateCurriculumApplySql(incoming, clone(currentCurriculumManifest));
  assert.equal(result.ok, true);
  assert.match(result.sql, /'Dijkstra''s Fixture'/);
  assert.doesNotMatch(result.sql, /'Dijkstra's Fixture'/);
});

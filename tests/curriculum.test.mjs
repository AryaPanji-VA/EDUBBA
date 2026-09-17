import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

function loadExport(path, exportName) {
  const raw = stripTypeScriptTypes(read(path), { mode: "transform" });
  const code = raw
    .replace(/import type \{[^}]+\} from "[^"]+";/g, "")
    .replace(/export /g, "") + `\nexports.${exportName}=${exportName};`;
  const exports = {};
  vm.runInNewContext(code, { exports });
  return exports[exportName];
}

const semester1Slugs = ["programming", "design-thinking", "discrete-math", "hci", "algorithms", "parallel", "networking"];

// === 1. The curriculum represents eight semesters ===
test("curriculum data represents exactly eight semesters numbered 1-8", () => {
  const semesters = loadExport("data/curriculum.ts", "semesters");
  assert.equal(semesters.length, 8);
  assert.deepEqual(Array.from(semesters, (semester) => semester.number), [1, 2, 3, 4, 5, 6, 7, 8]);
  for (const semester of semesters) {
    assert.equal(typeof semester.title, "string");
    assert.ok(semester.title.length > 0);
    assert.ok(Array.isArray(semester.courseSlugs));
  }
});

// === 2. Only Semester 1 has courses; no invented courses ===
test("only semester 1 carries courses and semesters 2-8 stay empty", () => {
  const semesters = loadExport("data/curriculum.ts", "semesters");
  assert.deepEqual(Array.from(semesters[0].courseSlugs), semester1Slugs);
  for (const semester of Array.from(semesters).slice(1)) {
    assert.deepEqual(Array.from(semester.courseSlugs), [], `semester ${semester.number} must stay empty`);
  }
});

// === 3. The semester 1 course list matches the existing database seeds ===
test("semester 1 course slugs match the existing course and semester seeds", () => {
  const seedSlugs = [...read("database/seed.sql").matchAll(/\('([a-z-]+)', '[^']+', '[^']+', \d+\)/g)].map((match) => match[1]);
  assert.deepEqual(seedSlugs, semester1Slugs);

  const migration = read("database/phase13-semesters.sql");
  for (const slug of semester1Slugs) {
    assert.match(migration, new RegExp(`'${slug}'`), `migration must place ${slug}`);
  }
});

// === 4. Every placed course already exists in the course presentation data ===
test("every semester 1 course slug exists in data/courses.ts presentation", () => {
  const courseData = read("data/courses.ts");
  for (const slug of semester1Slugs) {
    assert.match(courseData, new RegExp(`slug: "${slug}"`), `${slug} must already exist as a course`);
  }
});

// === 5. Lookup helpers behave for known and unknown semesters ===
test("semester lookup helpers resolve known semesters and fail closed otherwise", () => {
  const getSemester = loadExport("data/curriculum.ts", "getSemester");
  const getCoursesForSemester = loadExport("data/curriculum.ts", "getCoursesForSemester");
  assert.equal(getSemester(1).number, 1);
  assert.equal(getSemester(8).number, 8);
  assert.equal(getSemester(9), null);
  assert.equal(getSemester(0), null);
  assert.deepEqual(Array.from(getCoursesForSemester(1)), semester1Slugs);
  assert.deepEqual(Array.from(getCoursesForSemester(2)), []);
  assert.deepEqual(Array.from(getCoursesForSemester(99)), []);
});

// === 6. Course-to-semester placement covers exactly the seeded courses ===
test("semesterNumberByCourseSlug places exactly the seven semester 1 courses", () => {
  const mapping = loadExport("data/curriculum.ts", "semesterNumberByCourseSlug");
  assert.equal(Object.keys(mapping).length, 7);
  for (const slug of semester1Slugs) {
    assert.equal(mapping[slug], 1, `${slug} must be in semester 1`);
  }
  assert.equal(mapping["not-a-course"], undefined);
});

// === 7. Current semester context stays semester 1 ===
test("current semester context is semester 1", () => {
  const current = loadExport("data/curriculum.ts", "currentSemesterNumber");
  assert.equal(current, 1);
});

// === 8. The semester migration stays additive and idempotent ===
test("the semester migration is additive and idempotent", () => {
  const migration = read("database/phase13-semesters.sql");
  assert.match(migration, /create table if not exists public\.semesters/);
  assert.match(migration, /create unique index if not exists semesters_number_unique/);
  assert.match(migration, /add column if not exists semester_id uuid references public\.semesters\(id\)/);
  assert.match(migration, /on conflict \(number\) do update/);
  assert.match(migration, /semester_id is null/);
  assert.doesNotMatch(migration, /drop table/i);
  assert.doesNotMatch(migration, /drop column/i);
  // The courses.semester_id link must stay nullable so existing rows keep working.
  assert.doesNotMatch(migration, /add column if not exists semester_id uuid[^;\n]*not null/i);
  // Exactly eight semester shells are seeded.
  const shells = [...migration.matchAll(/\((\d), 'Semester \d'\)/g)].map((match) => Number(match[1]));
  assert.deepEqual(shells, [1, 2, 3, 4, 5, 6, 7, 8]);
});

// === 9. Existing tables are untouched by the foundation ===
test("the migration does not modify modules, lessons, or progress tables", () => {
  const migration = read("database/phase13-semesters.sql");
  for (const table of ["modules", "lessons", "lesson_progress", "practice_progress", "learning_logs", "concept_mastery"]) {
    assert.doesNotMatch(migration, new RegExp(`alter table public\\.${table}`), `must not alter ${table}`);
  }
});

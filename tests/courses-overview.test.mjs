import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Phase 13.2: semester-aware Courses Overview tests.

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

// Load the real presentation fallbacks so grouping uses actual data.
const coursePresentationBySlug = loadExport("data/courses.ts", "coursePresentationBySlug");

// Load the API route with its imports stubbed (type imports are erased by the stripper).
function loadRoute() {
  const raw = stripTypeScriptTypes(read("app/api/courses/route.ts"), { mode: "transform" });
  const names = [...raw.matchAll(/export (?:async )?(?:function|const|class) (\w+)/g)].map((match) => match[1]);
  const code = raw
    .replace(/import \{[^}]+\} from "[^"]+";/g, "")
    .replace(/export /g, "") + names.map((name) => `\nexports.${name} = ${name};`).join("");
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    coursePresentationBySlug,
    createServerSupabaseClient: () => ({}),
  });
  return exports;
}

const semester1Slugs = ["programming", "design-thinking", "discrete-math", "hci", "algorithms", "parallel", "networking"];

function semesterRows() {
  return [1, 2, 3, 4, 5, 6, 7, 8].map((number) => ({ id: `sem-${number}`, number, title: `Semester ${number}` }));
}

function courseRows() {
  return semester1Slugs.map((slug, index) => ({
    slug,
    title: `Course ${slug}`,
    description: "Course description.",
    // Mirrors the real seeds: programming carries 11 lessons.
    total_lessons: slug === "programming" ? 11 : 8 + index,
    semester_id: "sem-1",
  }));
}

// === 1. Grouping orders semesters 1-8 and places Semester 1 courses ===
test("grouping returns semesters ordered 1-8 with semester 1 carrying the seeded courses", () => {
  const { groupCoursesBySemester } = loadRoute();
  const { semesters, unassignedCourses } = groupCoursesBySemester(semesterRows(), courseRows());
  assert.equal(semesters.length, 8);
  assert.deepEqual(Array.from(semesters, (semester) => semester.number), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(Array.from(semesters[0].courses, (course) => course.slug), semester1Slugs);
  for (const semester of Array.from(semesters).slice(1)) {
    assert.equal(semester.courses.length, 0, `semester ${semester.number} must stay empty`);
  }
  assert.equal(unassignedCourses.length, 0);
});

// === 2. Course counts are derived from actual rows ===
test("course counts come from the actual database rows", () => {
  const { groupCoursesBySemester } = loadRoute();
  const partial = courseRows().slice(0, 3);
  const { semesters } = groupCoursesBySemester(semesterRows(), partial);
  assert.equal(semesters[0].courses.length, 3);
  assert.equal(semesters[1].courses.length, 0);
  const none = groupCoursesBySemester(semesterRows(), []);
  for (const semester of none.semesters) assert.equal(semester.courses.length, 0);
  assert.equal(none.unassignedCourses.length, 0);
});

// === 3. Null semester relationships are reported, never silently assigned ===
test("a null semester_id course is reported as unassigned and does not crash", () => {
  const { groupCoursesBySemester } = loadRoute();
  const rows = [...courseRows(), { slug: "legacy-course", title: "Legacy", description: "Old row.", total_lessons: 5, semester_id: null }];
  const { semesters, unassignedCourses } = groupCoursesBySemester(semesterRows(), rows);
  assert.equal(unassignedCourses.length, 1);
  assert.equal(unassignedCourses[0].slug, "legacy-course");
  assert.equal(semesters[0].courses.length, semester1Slugs.length);
  for (const semester of semesters) {
    assert.equal(semester.courses.some((course) => course.slug === "legacy-course"), false);
  }
});

// === 4. An unknown semester_id also lands in unassigned (safe fallback) ===
test("an unknown semester_id is reported as unassigned instead of crashing or guessing", () => {
  const { groupCoursesBySemester } = loadRoute();
  const rows = [{ slug: "orphan-course", title: "Orphan", description: "d", total_lessons: 5, semester_id: "sem-99" }];
  const { semesters, unassignedCourses } = groupCoursesBySemester(semesterRows(), rows);
  assert.equal(unassignedCourses.length, 1);
  assert.equal(semesters.every((semester) => semester.courses.length === 0), true);
});

// === 5. Presentation fallbacks are applied to grouped courses ===
test("grouped courses use neutral presentation fallbacks with honest zero progress", () => {
  const { groupCoursesBySemester } = loadRoute();
  const { semesters } = groupCoursesBySemester(semesterRows(), courseRows());
  const programming = semesters[0].courses.find((course) => course.slug === "programming");
  assert.equal(programming.code, "CS-101");
  // Phase 15: no fake progress or lesson counts — unknown means honest zero.
  assert.equal(programming.progress, 0);
  assert.equal(programming.status, "Not started");
  assert.equal(programming.lessons, 0);
  // Real lesson counts derive from the seeded structure.
  const withCounts = groupCoursesBySemester(semesterRows(), courseRows(), { programming: 11 }, { programming: 4 });
  const withProgress = withCounts.semesters[0].courses.find((course) => course.slug === "programming");
  assert.equal(withProgress.lessons, 11);
  assert.equal(withProgress.progress, 36);
  assert.equal(withProgress.status, "In progress");
  const unknown = groupCoursesBySemester(semesterRows(), [{ slug: "brand-new", title: "New", description: "d", total_lessons: 3, semester_id: "sem-1" }]);
  assert.equal(unknown.semesters[0].courses[0].code, "CS");
  assert.equal(unknown.semesters[0].courses[0].progress, 0);
});

// === 6. The API reads semester data from the database, never invents it ===
test("the courses API reads semesters, structure, and real progress from the database", () => {
  const source = read("app/api/courses/route.ts");
  assert.match(source, /from\("semesters"\)/);
  assert.match(source, /select\("id, number, title"\)/);
  assert.match(source, /order\("number", \{ ascending: true \}\)/);
  assert.match(source, /select\("id, slug, title, description, total_lessons, semester_id"\)/);
  assert.match(source, /order\("created_at", \{ ascending: true \}\)/);
  // Phase 15: real lesson counts and real persisted progress, never invented.
  assert.match(source, /from\("modules"\)/);
  assert.match(source, /from\("lessons"\)/);
  assert.match(source, /loadCompletedLessonCountsByCourse/);
  // Legacy flat list is preserved for backward compatibility.
  assert.match(source, /Response\.json\(\{ courses, count: courses\.length, semesters, unassignedCourses \}\)/);
  // Empty semesters table is reported as a data problem, not faked.
  assert.match(source, /The semesters table is empty/);
});

// === 7. The client renders a semester selector defaulting to Semester 1 ===
test("the courses client renders eight semester controls and defaults to semester 1", () => {
  const source = read("components/courses-client.tsx");
  assert.match(source, /const defaultSemesterNumber = 1/);
  assert.match(source, /useState\(defaultSemesterNumber\)/);
  assert.match(source, /className="switcher semester-nav" role="group" aria-label="Semester"/);
  assert.match(source, /aria-pressed=\{item\.number === selectedSemester\}/);
  assert.match(source, /SEM \{padSemester\(item\.number\)\}/);
  assert.match(source, /data\.semesters\.map/);
});

// === 8. Empty semesters show the calm empty state, not fake cards ===
test("empty semesters render the empty state with honest copy", () => {
  const source = read("components/courses-client.tsx");
  assert.match(source, /Belum ada course yang dimasukin ke semester ini\./);
  assert.match(source, /semester-empty/);
  assert.doesNotMatch(source, /Coming Soon/i);
});

// === 9. Semester hero reflects the selected semester with actual counts ===
test("the hero uses the selected semester and its actual course count", () => {
  const source = read("components/courses-client.tsx");
  assert.match(source, /Semester \{padSemester\(selectedSemester\)\} · \{courseCount\}/);
  assert.match(source, /SEM \/ \{padSemester\(selectedSemester\)\}/);
  assert.match(source, /courses\.length \?|courseCount > 0/);
  assert.match(source, /overallProgress === null \? "—"/);
});

// === 10. Null semester relationships surface as a visible data notice ===
test("unassigned courses surface as a visible data notice in the client", () => {
  const source = read("components/courses-client.tsx");
  assert.match(source, /unassignedCourses\.length > 0/);
  assert.match(source, /data-notice/);
  assert.match(source, /phase13-semesters\.sql/);
});

// === 11. Course cards, slugs, and navigation remain unchanged ===
test("course card markup, slugs, and navigation stay data-driven", () => {
  const source = read("components/courses-client.tsx");
  // Deep links resolve through the trusted overview-route map, never hardcoded per course.
  assert.match(source, /courseOverviewRouteBySlug\[course\.slug\] \?\? "\/courses"/);
  assert.match(source, /import \{ courseOverviewRouteBySlug, type Course \} from "@\/data\/courses"/);
  assert.match(source, /course-row/);
  assert.match(source, /course-index/);
  assert.match(source, /course-main/);
  assert.match(source, /course-stats/);
  assert.match(source, /course-progress/);
  assert.match(source, /ProgressBar value=\{course\.progress\}/);
  assert.match(source, /role="status"/);
  assert.match(source, /course-request-state is-error/);
  assert.match(source, /coba lagi/);
  // Only courses with implemented overview pages are deep-linked.
  const courseData = read("data/courses.ts");
  assert.match(courseData, /programming: "\/courses\/programming"/);
  assert.match(courseData, /"discrete-math": "\/courses\/discrete-math"/);
});

// === 12. The page still mounts the client inside the app shell ===
test("the courses page mounts CoursesClient inside AppShell", () => {
  const source = read("app/courses/page.tsx");
  assert.match(source, /AppShell active="courses"/);
  assert.match(source, /CoursesClient/);
});

// === 13. No invented courses for Semester 2-8 anywhere in the overview ===
test("no semester 2-8 course content is invented in data or client", () => {
  const curriculum = loadExport("data/curriculum.ts", "semesters");
  for (const semester of Array.from(curriculum).slice(1)) {
    assert.equal(semester.courseSlugs.length, 0);
  }
  const client = read("components/courses-client.tsx");
  // The only course links are the dynamic course.slug-driven ones.
  assert.doesNotMatch(client, /href="\/courses\/[a-z-]+"/);
});

// === 14. Semester labels stay language-neutral; copy follows existing ID conventions ===
test("semester labels are language-neutral and the page keeps its existing copy conventions", () => {
  const source = read("components/courses-client.tsx");
  assert.match(source, /SEM \{padSemester/);
  assert.match(source, /Semester \{selectedSemester\}/);
  assert.match(source, /Your course shelf\./);
  // /courses does not participate in the lesson language switcher system.
  assert.doesNotMatch(source, /lessonLanguageStorageKey/);
  assert.doesNotMatch(source, /shared-copy/);
});

// === 15. Programming remains fully accessible ===
test("programming course and lesson routes remain untouched by this phase", () => {
  const client = read("components/courses-client.tsx");
  assert.match(client, /course\.slug === "programming"/);
  // The programming course page and lesson pages are not modified by 13.2.
  const programmingPage = read("app/courses/programming/page.tsx");
  assert.match(programmingPage, /ProgrammingCourseClient/);
});

// === 16. Responsive semester navigation is horizontally scrollable ===
test("the semester selector scrolls horizontally on small screens", () => {
  const css = read("app/globals.css");
  assert.match(css, /\.switcher\.semester-nav \{[^}]*overflow-x: auto/);
  assert.match(css, /\.semester-nav button \{ flex: none; \}/);
  assert.match(css, /\.semester-empty/);
  assert.match(css, /\.data-notice/);
});

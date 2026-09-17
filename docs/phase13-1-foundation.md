# Phase 13.1 — Curriculum Expansion Foundation (Audit + Plan)

Phase 13 makes EDUBBA capable of representing multiple official courses and
semesters while preserving the mature Programming learning system. This first
pass is an audit plus the smallest safe structural foundation. No course content
was generated and no runtime behavior changed.

## Audit findings

### Current curriculum architecture

- Database hierarchy already exists: `courses -> modules -> lessons`
  (database/phase4-relations.sql) plus `lesson_sources -> sources`
  (database/phase5-sources.sql). Seven courses are seeded
  (database/seed.sql) as Semester 1 courses; only `programming` has modules
  and lessons seeded (database/phase4-seed.sql, 3 modules / 11 lessons).
- Static presentation lives in `data/courses.ts`: the course list,
  `coursePresentationBySlug` fallbacks, `implementedProgrammingLessonSlugs`,
  and the static `programmingLessonStateBySlug` fallback.
- The lesson registry (`lib/lessons/registry.ts`) is a flat, lesson-slug-keyed
  map of `LessonDefinition` objects (activities, content, loader, mastery,
  relevance, Robin Check config, feedback config). It is course-agnostic in
  contract but Programming-only in contents.
- Lesson loaders (`lib/lessons/*.ts`) read course/module/lesson rows from
  Supabase and hardcode `course_slug = "programming"` and
  `module_slug = "programming-building-blocks"`.
- Progress (`lesson_progress`) is keyed by `(course_slug, lesson_slug)`.
  Learning Log (`learning_logs`) carries `course_slug` + `lesson_slug`.
  Practice progress (`practice_progress`) is keyed by practice track slug
  (`python`, `thinking`), not by course.
- Mastery (`concept_mastery`) is keyed by `(lesson_slug, concept_key)`;
  Phase 9C already relaxed the lesson/concept CHECK constraints so any
  registered lesson can store concepts.
- Robin chat is lesson-scoped: grounding is `{ status, lesson }`, adaptation
  context is loaded per lesson, and the save-log preview currently hardcodes
  `courseSlug: "programming"` (app/api/robin/chat/route.ts).
- The courses page header hardcodes "Semester 01 · 7 courses"; the dashboard
  hardcodes the Programming path/breadcrumb; `useCurrentLesson` falls back to
  `courseSlug: "programming"`.

### Programming-specific assumptions

1. `app/api/learning/progress/route.ts` hardcodes `loadProgress("programming", ...)`
   on GET and rejects `courseSlug !== "programming"` on POST.
2. Lesson loaders hardcode the `programming` course and
   `programming-building-blocks` module.
3. `app/api/robin/chat/route.ts` hardcodes `courseSlug: "programming"` in the
   Learning Log preview.
4. Static fallbacks (`data/courses.ts`, `lib/progress/use-current-lesson.ts`,
   `lib/progress/server.ts`) hardcode the Programming course.
5. Lesson components pass `"programming"` as the course slug to `useProgress`.
6. Dashboard and courses pages hardcode Programming/Semester 1 presentation.
7. Practice Lab content is Python-shaped, but the architecture is track-based
   (`python`, `thinking`) and already non-Python tracks exist.

### Already generic / reusable

- `courses -> modules -> lessons` database hierarchy.
- `lesson_progress`, `learning_logs` already carry `course_slug`.
- The `LessonDefinition` registry contract is course-agnostic.
- The mastery engine, adaptation policy, Robin Check, Smart Feedback, and
  Learning Log flows are lesson-owned and course-agnostic.
- Practice architecture is track-based; Thinking Lab proves non-Python
  activity types already work.
- The App Shell sidebar navigation is course-agnostic.

## Phase 13 foundation (this change)

The intended long-term hierarchy is Curriculum -> Semester -> Course -> Module
-> Lesson -> Activity -> Concept. The repository already implements
Course -> Module -> Lesson -> Activity -> Concept. The only missing structural
piece is the semester layer, so this phase adds it in the smallest additive
way:

1. `database/phase13-semesters.sql` — idempotent, additive migration:
   a `semesters` table (number 1-8, title), a nullable `courses.semester_id`
   foreign key, eight neutral semester shells, and assignment of the seven
   already-seeded Semester 1 courses. No new courses are created; Semesters
   2-8 stay empty until the official course lists are supplied.
2. `data/curriculum.ts` — static presentation mirror of the semester layer
   (same pattern as `coursePresentationBySlug`: database is authoritative,
   static data is the offline fallback). Helpers: `getSemester`,
   `getCoursesForSemester`, `semesterNumberByCourseSlug`, and
   `currentSemesterNumber = 1`.
3. `tests/curriculum.test.mjs` — guards the foundation: eight semesters, only
   Semester 1 has courses, the course list matches the existing seeds, no
   invented courses, and the SQL migration stays additive and idempotent.

### Official curriculum rule

The official Semester 1-8 curriculum remains the authoritative WHAT and WHEN.
This foundation only adds the structural capability to represent it. Current
campus topics (Programming Fundamentals with Python, Web Client Development,
Software Development Fundamentals, Software Development Lifecycle) are study
context that maps onto existing seeded courses and modules — they do not
become new official courses.

## Proposed Phase 13 subphases

- 13.1 (this phase): semester foundation — semesters table, static mirror,
  tests, docs. Zero runtime behavior change.
- 13.2: curriculum-aware courses overview — group the courses list by semester
  using the static mirror with a database-backed follow-up; mark the current
  semester context; keep Programming as the only deep-linked course.
- 13.3: de-hardcode the course slug in the progress API and Robin chat
  log preview, driven by a course-aware lesson lookup (registry stays flat;
  a course->lesson mapping validates course+lesson pairs). Existing
  Programming rows and requests remain valid unchanged.
- 13.4: per-course overview page contract so a second course (when the
  official curriculum supplies one) can reuse the course map without Python
  assumptions.
- 13.5+: per-course content verticals, course-scoped Robin grounding
  (`course + lesson`), and practice content per course where appropriate
  (not all courses need Sandbox or Guided Practice).

## Compatibility strategy

- All existing tables and rows are untouched; the migration only adds a table
  and a nullable column.
- Programming progress, mastery, Learning Log, and Practice rows remain valid
  because their keys do not change.
- No API, component, or registry behavior changes in 13.1, so the Phase 12
  behavior and its tests are preserved as-is.

## Risks / deferred items

- The Supabase `courses` table must not be given a NOT NULL semester
  requirement until every official course is placed; the FK stays nullable.
- Registry-level course scoping (course + lesson keying) is deferred to 13.3
  to avoid touching the working registry and its tests in the same change as
  the curriculum foundation.
- Dashboard semester context is deferred to 13.2+ to keep this change purely
  structural.
- Authentication and Phase 14 remain out of scope.

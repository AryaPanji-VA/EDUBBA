# Phase 13.2 — Semester-aware Courses Overview

`/courses` no longer assumes every course belongs to Semester 1. The page now
navigates Semester 1–8 using the Phase 13.1 semester model (semesters table +
courses.semester_id), which the user has already applied in Supabase.

## Semester data architecture

- The database remains the source of truth. `GET /api/courses` now reads
  `semesters` (ordered by number) and `courses` including `semester_id`
  (ordered by created_at, the existing behavior) and groups them with a pure,
  exported helper `groupCoursesBySemester`.
- Response shape: `{ courses, count, semesters, unassignedCourses }`.
  `semesters` is `[{ number, title, courses }]` ordered 1–8; the flat
  `courses` list is preserved in the original database order for backward
  compatibility.
- Semesters come only from the database — the API never invents semester
  shells or courses. An empty semesters table is reported as a data problem
  (HTTP 500 pointing at database/phase13-semesters.sql), not faked.
- Legacy rows with a null (or unknown) `semester_id` are returned in
  `unassignedCourses`. The client shows a visible data notice naming the
  migration to re-run. Nothing is silently assigned in application code.

## Semester selector

- Compact `SEM 01 … SEM 08` segmented control using the existing `.switcher`
  visual language, rendered between the hero and the course list so it reads
  as contextual navigation that does not compete with the hero title.
- Buttons are natively keyboard-focusable, use `aria-pressed` for the selected
  state, and the selected control shows both a background and a marker dot in
  addition to color (existing `.on` styling).
- On narrow screens the selector scrolls horizontally
  (`.switcher.semester-nav { overflow-x: auto }`, non-shrinking buttons), so
  eight controls never break the mobile layout.

## Default semester and state

- Defaults to Semester 1. No academic-calendar inference, no onboarding, no
  learner preference persistence, no URL routing, no new state library —
  plain client state, reset to Semester 1 on each reload/retry.

## Hero and counts

- The hero eyebrow reflects the selected semester with its actual course count
  (`SEMESTER 02 · 0 COURSES`), and the stamp shows `SEM / 0N` with an overall
  percentage computed from the actual course progress values, or `—` for an
  empty semester. The previous hardcoded `38%` was replaced by this
  data-derived value. Course titles, slugs, and card markup are unchanged.

## Empty semester state

- Semesters without course rows render a calm empty state (no fake cards,
  no "Coming Soon"): "Belum ada course yang dimasukin ke semester ini." with
  supporting copy explaining that curriculum content appears here once it is
  officially added.

## Localization

- `/courses` does not participate in the lesson ID/EN language system (it
  never had a language switcher), so the page keeps its existing mixed
  convention: ID support copy, EN-flavored eyebrow, and language-neutral
  semester labels (`Semester 1`, `SEM 01`). Official course titles come from
  the database and are never translated.

## Compatibility

- Programming is untouched: `/courses/programming` and all lesson routes are
  unchanged, and the learning engine, Robin, mastery, memory, and progress
  systems were not modified. Non-programming cards keep their existing
  placeholder navigation (only Programming has a deep-linked course page),
  preserving the distinction between "course exists" and "course has mature
  lesson content".

## Files

- `app/api/courses/route.ts` — semester-aware read + pure grouping helper.
- `components/courses-client.tsx` — semester-aware shelf (hero, selector,
  list, empty state, data notice, loading/error states preserved).
- `app/courses/page.tsx` — simplified to AppShell + CoursesClient (the hero
  moved into the client so it can react to semester selection, matching the
  ProgrammingCourseClient pattern).
- `app/globals.css` — `.semester-nav`, `.semester-empty`, `.data-notice`.
- `tests/courses-overview.test.mjs` — 16 focused tests.

## Out of scope

Semester 2–8 course content, per-course pages for other courses, academic
calendar, current-semester inference, prerequisites, auth, enrollment, and
Phase 13.3 (de-hardcoding the remaining course-slug assumptions).

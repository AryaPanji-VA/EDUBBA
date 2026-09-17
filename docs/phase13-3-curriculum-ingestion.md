# Phase 13.3 — Curriculum Ingestion Foundation

ROBIN now has a safe, deterministic, provenance-aware way to ingest future
trusted curriculum structure — without inventing courses and without
endangering existing learning content. This phase adds developer/data
architecture only: no admin UI, no runtime behavior change, and no automatic
modification of the live Supabase database.

## Purpose

Future curriculum expansion must be controlled, traceable, and safe. Instead
of manually scattering seed SQL or hardcoding courses in frontend code,
curriculum structure flows through a typed manifest that is validated,
diffed against the known state, and only then turned into reviewable,
idempotent SQL.

## Manifest model

`data/curriculum-manifest.ts` defines the typed structure:

```
CurriculumManifest
└── SemesterManifest   (number 1-8, title, courses)
    └── CourseManifest (slug, title, description, totalLessons, modules)
        └── ModuleManifest (slug, title, description, position, lessons)
            └── LessonManifest (slug, title, summary, estimatedMinutes, position)
```

The manifest carries curriculum STRUCTURE only. It never carries lesson
learning content — activities, mastery configuration, Robin Check
configuration, explanations, and examples live in the lesson architecture and
are out of ingestion scope. The validator rejects unknown keys, so a manifest
that tries to smuggle learning content fails validation.

`currentCurriculumManifest` mirrors the current database state exactly:
eight semester shells, the seven official Semester 1 courses, and
Programming's 3 modules / 11 lessons. Tests cross-check it against
`database/seed.sql` and `database/phase4-seed.sql` so it cannot drift from
the real data.

## Provenance model

Every course, module, and lesson must declare where it came from:

```ts
type CurriculumProvenance = {
  sourceType: "official" | "instructor" | "study-context" | "robin";
  sourceLabel: string;      // human-readable origin
  sourceUrl?: string;       // optional http(s) reference
  verifiedAt?: string;      // optional verification date
};
```

- `official` — trusted university curriculum data.
- `instructor` — lecturer-provided material.
- `study-context` — useful material that is NOT itself an official course
  (campus topics, lecturer notes, personal study plans).
- `robin` — ROBIN-created learning structure or content.

A ROBIN-generated entry never automatically becomes official curriculum.
Official status comes only from explicitly trusted curriculum data. In the
current manifest this is applied honestly: the seven Semester 1 courses are
`official`; Programming's module/lesson learning structure is `robin`
(ROBIN's organization of the official course).

## Official vs ROBIN learning content

The official curriculum specifies WHAT the university requires (courses,
topics). ROBIN provides HOW the learner studies it (intuition, predictions,
practice, Robin Check, mastery, explanations, examples). Ingestion concerns
curriculum structure only and can never create, modify, or delete ROBIN
learning content.

## Validation

`lib/curriculum/validation.ts` — `validateCurriculumManifest(input: unknown)`
is deterministic and fail-closed (no AI, no silent repair), mirroring the
project's validator conventions. It rejects, with a path and code:

- non-object input, unknown keys (including learning-content keys)
- semester numbers outside 1-8, duplicate semester numbers
- duplicate course slugs (manifest-wide)
- duplicate module slugs or positions within a course
- duplicate lesson slugs within a module or within a course, duplicate
  positions within a module
- missing or malformed identifiers, slugs that are not lowercase kebab-case
- missing/invalid provenance (bad sourceType, empty label, non-http(s) URL,
  unparseable verifiedAt)
- malformed hierarchy (wrong types, lessons at course level, etc.)

## Diff behavior

`lib/curriculum/diff.ts` — `diffCurriculumManifest(incoming, snapshot)`
compares a validated manifest against a snapshot of the known state, keyed by
stable identifiers (semester number; course slug; course+module slug;
course+module+lesson slug):

- `add` — present in incoming, absent in snapshot (safe to apply)
- `unchanged` — identical structural metadata
- `conflict` — exists in both but structural metadata differs; the differing
  field names are reported
- `missing` — present in snapshot, absent in incoming (informational only;
  ingestion never deletes)

Incoming manifests must be complete for existing entries: omitting an
optional field where the snapshot has a value (e.g. `totalLessons`) counts
as a conflict, so nothing is silently dropped.

## Conflict handling & Programming protection

`lib/curriculum/apply-sql.ts` — `generateCurriculumApplySql(incoming,
snapshot)`:

1. Validates the incoming manifest (fail-closed).
2. Diffs against the snapshot. **Any conflict refuses SQL generation
   entirely** — existing curriculum, especially the mature Programming
   course, is never silently overwritten.
3. Only `add` entries generate statements. Every insert is idempotent
   (`ON CONFLICT DO NOTHING`); semester placement uses the same null-safe
   UPDATE pattern as `database/phase13-semesters.sql` and only touches new
   course slugs.
4. The generated SQL is data-only, wrapped in `begin;/commit;`, with single
   quotes escaped. It never contains DDL, DROP, DELETE, or TRUNCATE, and
   never references `lesson_progress`, `practice_progress`,
   `learning_logs`, `concept_mastery`, or `robin_memories`.

ROBIN never applies the SQL automatically; the developer reviews and runs it
manually in the Supabase SQL Editor.

## Future ingestion workflow

1. Obtain a trusted curriculum source.
2. Translate its structure into a typed manifest with honest provenance.
3. Run `validateCurriculumManifest` — fix every error; nothing is repaired
   automatically.
4. Run `diffCurriculumManifest` against a fresh snapshot of the known state.
5. Review ADD / UNCHANGED / CONFLICT (and informational MISSING).
6. Resolve conflicts deliberately (update the manifest or the database by
   explicit decision), then run `generateCurriculumApplySql`.
7. Review and manually apply the generated SQL in Supabase.
8. Verify through `/api/courses`.
9. Only then create ROBIN learning content for new lessons.

AI-generated content is never part of the trusted ingestion step.

## Illustrative example (NOT actual university curriculum)

The following shows how a future trusted semester could be represented. It
is a made-up fixture used by the tests — it is not real curriculum and is
never applied:

```ts
{
  number: 3,
  title: "Semester 3",
  courses: [{
    slug: "test-fixture-course",            // obviously fake
    title: "Test Fixture Course",
    description: "Fixture only, never real curriculum.",
    totalLessons: 2,
    provenance: {
      sourceType: "instructor",             // would be "official" for real data
      sourceLabel: "test fixture",
    },
    modules: [{ /* ...structure only... */ }],
  }],
}
```

Study-context material follows the same shape but with
`sourceType: "study-context"`, which keeps campus topics, lecturer notes,
and personal study plans from being promoted to official courses without
explicit trusted input.

## Database safety

- No schema changes in this phase; no migration file is needed.
- The generated SQL only inserts new rows and places new courses into
  semesters. Existing rows are never updated or deleted.
- Nothing in `lib/curriculum/` imports or references the learning systems
  (progress, mastery, memory, Robin), enforced by tests.

## Known limitations

- No UPDATE path: changing existing structural metadata is always a
  conflict that must be resolved by explicit human decision (documented
  workflow), not by generated SQL.
- The snapshot is currently the `currentCurriculumManifest` data file. Before
  real future ingestion, refresh it from the live database (an export script
  is a later-phase convenience).
- Lesson slug uniqueness is enforced per course (registry safety), which is
  stricter than the database's per-module uniqueness.
- The manifest validator caps semesters at 1-8 to match the official program
  structure.
- No admin UI, no upload, no CMS — by design for this phase.

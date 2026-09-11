# Phase 9C — Data Types v1

## Learning objectives

By the end of Data Types v1, the learner should be able to:
- explain that values have different types
- distinguish `int`, `float`, `str`, and `bool`
- predict the type of simple values
- understand the difference between `"42"` and `42`
- use `type()` conceptually
- explain why type affects what operations make sense

## Lesson structure

Nine steps: WHY → INTUITION → PREDICT (int) → PREDICT (string vs number) → PREDICT (boolean) → TRY (float) → FORMALIZE → ROBIN CHECK → CONNECT. Same step count as Variables by coincidence — the renderer reads `activities.length`, so any count works.

## Activities

| ID | Type | Concept | Grading |
|---|---|---|---|
| `why` | intro | data_type | — (no answer) |
| `intuition` | explain | data_type | — |
| `predict-type` | predict | integer | `answer === "int"` (options: int/float/str/bool) |
| `string-vs-number` | predict | string | `answer === "b"` (options: a/b/Both/Neither) |
| `boolean-recognition` | predict | boolean | `answer === "True only"` (options: True/"True"/False and "True"/True only) |
| `try` | practice | float | `checkAnswer: /^float$/i` — lesson-owned inline checker |
| `formalize` | formalize | data_type | — |
| `robin-check` | robin_check | data_type | AI evaluation via lesson rubric |
| `connect` | connect | type_inspection | — |

Misconception codes on predict activities: `decimal_confusion`, `quote_confusion`, `type_misidentification`, `type_indifference`, `partial_boolean_recognition`.

## Deterministic grading

All objective activities are graded deterministically. Predict activities compare against `correctAnswer`. The practice activity uses its own `checkAnswer` function (`/^float$/i`), not the Variables listeners regex. The shared `gradeActivity` in `lib/robin/quiz-feedback.ts` calls `activity.checkAnswer` — no lesson-specific branch exists in the shared grading path.

## Mastery concepts

Six concepts: `data_type`, `integer`, `float`, `string`, `boolean`, `type_inspection`. Each maps to activities via `data-types-mastery.ts`. Robin Check credits `data_type`, `string`, `integer`. `type_inspection` receives evidence only from the CONNECT step (none currently) — documented as UNSEEN until a future activity exists. State logic (UNSEEN/SHAKY/DEVELOPING/STRONG) and weights are unchanged from Phase 8E.

## Adaptation mappings

Defined in `data-types-relevance.ts`:
- `data_type` activity → data_type, string, integer
- `integer` activity → integer, data_type
- `float` activity → float, data_type
- `string` activity → string, integer, data_type
- `boolean` activity → boolean, data_type
- Robin Check → data_type, string, integer
- Chat: lexical matching for string-vs-number, int/integer, float/desimal, bool/boolean, type/tipe topics; unrelated messages get no adaptation context

## Robin Check rubric

Question: "Why are 42 and \"42\" different even though they look similar?" (ID: "Kenapa 42 dan \"42\" itu berbeda walaupun kelihatannya mirip?")

Concepts: `data_type`, `string`, `integer`. Misconceptions: `quote_confusion`, `type_indifference`, `decimal_confusion`, `type_misidentification`. Rubric in `data-types-check-instructions.ts` (server-only). Evaluator receives no mastery/adaptation context; adaptation may append a hint after evaluation (none registered for Data Types v1 — `adaptFeedback` is omitted).

**Parser change (shared infrastructure):** `parseCheckEvaluation` now accepts optional `allowedConcepts` and `allowedMisconceptions` parameters. The check route passes the lesson's vocabulary from the registry. Defaults remain the Variables tuples, so Variables behavior is unchanged. The strong-signal check uses `allowedConcepts.length` instead of hardcoded 3. The client `robin-check.tsx` no longer re-parses the server response (the server already validated); it trusts `data.evaluation` directly.

## Localization

Data Types owns its instructional copy in `content/lessons/programming/data-types-localization.ts`, composed from shared UI strings (`content/lessons/shared-copy.ts`) plus lesson-specific strings (prompt, module title, concept labels). Indonesian is natural and casual ("20 → integer (int). 172.5 → floating-point (float)."). Code is never translated. Language preference shares the same `robin.lessonLanguage` localStorage key as Variables.

**Shared copy extraction (the localization fix):** `shared-copy.ts` was extracted with global UI strings (step/next/previous/check/reveal/correct/incorrect, feedback, Robin Check, and mastery labels) in both languages. Data Types spreads these and overrides lesson-specific keys. Variables' own localization file remains untouched.

## Registry integration

`data-types` registered in `lib/lessons/registry.ts` with explicit static imports: activities, lesson content, loader (`lib/lessons/data-types.ts`), mastery config, relevance, check config (rubric, question, vocabulary), feedback rubric. The registry is still the only runtime authority — unknown slugs 400.

## Routing

- `app/courses/programming/data-types/page.tsx` → renders `DataTypesLesson`
- `app/api/lessons/data-types/route.ts` → GET lesson (Supabase metadata + content)
- Course page: `data/courses.ts` marks data-types as `"current"`; `programming-course-client.tsx` links both variables and data-types rows

## Shared infrastructure changes required by lesson 2

Only three, each the smallest fix:

1. **DB CHECK constraints** (`database/phase9c-relax-concept-constraints.sql`) — drops the `lesson_slug in ('variables')` and `concept_key in (...)` CHECKs so any registered lesson can store mastery. Manual migration. Variables rows preserved.
2. **`parseCheckEvaluation` parameterization** (`lib/robin/check.ts`) — accepts lesson-owned concept/misconception vocabularies; defaults unchanged.
3. **Shared UI copy extraction** (`content/lessons/shared-copy.ts`) — global UI strings moved out of variables-localization so a second lesson can compose its own copy without importing Variables.

## Database migration

Run `database/phase9c-relax-concept-constraints.sql` manually in Supabase SQL Editor. Drops two CHECK constraints; preserves all existing rows; no schema redesign.

## Limitations

- Data Types has no seed SQL for lesson metadata/sources yet — the loader returns a 404 until a `data-types` lesson row is inserted into Supabase (same pattern as Variables' phase4/5 seeds). The lesson page shows a retry error until seeded.
- No `adaptFeedback` hint adapter for Data Types Robin Check (omitted — v1 keeps evaluation output as-is).
- Chat relevance matching is lexical and conservative.
- Source Mode works identically to Variables (no AI requests); mastery panel is viewable.

## Manual test plan

1. Run `database/phase9c-relax-concept-constraints.sql` in Supabase SQL Editor
2. Seed the `data-types` lesson row (module: programming-building-blocks) or the loader 404s
3. Open `/courses/programming` — Data Types shows as "current" with a link
4. Open `/courses/programming/data-types` — nine-step flow renders in Indonesian
5. `predict-type`: choose `int` → correct; choose `float` → incorrect + misconception feedback
6. `string-vs-number`: choose `b` → correct
7. `boolean-recognition`: choose `True only` → correct
8. `try`: type `float` → correct; type `int` → incorrect
9. Robin Check: submit an explain-back answer → evaluation works
10. Robin Chat: "bin bedanya int sama float" → grounded in Data Types
11. Toggle EN/ID — language switches, no duplicate requests
12. Source Mode ON — deterministic activities work, no AI
13. Reload — mastery summary persists (after evidence recorded)
14. Variables lesson still works end-to-end

## Verification interpretation

CODE VERIFIED: TypeScript passes; 106 tests pass (87 pre-existing + 19 new). Unit tests use VM doubles and never call 9Inference or Supabase. LIVE DATA TYPES VERIFIED requires the SQL migration, a lesson seed row, and manual browser testing.

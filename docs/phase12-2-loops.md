# Phase 12.2 — Loops Content Expansion

## What this phase proves

The reusable lesson architecture absorbs a fourth complete lesson — Loops — as a pure content expansion: **zero architecture changes**. All integrations are registry/content additions following the per-lesson module pattern established by Variables, Data Types, and Conditionals.

## Files created

| File | Purpose |
|---|---|
| `content/lessons/programming/loops.ts` | LessonContent: intuitive (ID) + academic (EN) explanations, 4 code examples, 9 key terms, 7 common mistakes, 3 quick checks |
| `content/lessons/programming/loops-activities.ts` | 9 learning-flow activities (why → intuition → 3 predicts → try → formalize → Robin Check → connect) |
| `content/lessons/programming/loops-mastery.ts` | LessonMasteryConfig (concept vocabulary + activity mapping + Robin Check signal mapping) |
| `content/lessons/programming/loops-relevance.ts` | Adaptation relevance mappings (activity concepts → mastery concepts; chat concept detection) |
| `content/lessons/programming/loops-lesson-config.ts` | Robin Check retry reinforcement + mastery concept labels |
| `content/lessons/programming/loops-check-instructions.ts` | Robin Check rubric |
| `content/lessons/programming/loops-feedback-instructions.ts` | Smart Feedback rubric |
| `content/lessons/programming/loops-localization.ts` | ID/EN copy, Indonesian activity overrides, content localization |
| `lib/lessons/loops.ts` | Supabase-backed lesson loader |
| `app/api/lessons/loops/route.ts` | Lesson API |
| `app/courses/programming/loops/page.tsx` | Lesson page (thin shell) |
| `components/loops-lesson.tsx` | Lesson component (Source Mode, Robin Check, progress, Learning Log offer) |
| `content/practice/python/loops-exercises.ts` | 6 Guided Practice exercises |
| `database/phase12-loops-sources.sql` | Idempotent seed: 2 authoritative sources + lesson links (run manually) |
| `tests/loops-lesson.test.mjs` | Lesson registry/content/mastery/relevance/rubric tests |
| `tests/loops-practice.test.mjs` | Practice/thinking/sandbox/assist/progress/mastery-dedup tests |

## Files changed

| File | Change |
|---|---|
| `lib/lessons/registry.ts` | Registered `loops` (check config + rubrics) |
| `lib/practice/registry.ts` | Added the Loops topic to the python track |
| `content/practice/thinking/types.ts` | Extended lessonSlug unions with `"loops"` |
| `content/practice/thinking/activities.ts` | Added 4 loops thinking activities |
| `content/sandbox/python-starters.ts` | Relabeled `loop` → "For loop" (range(1, 6)); added the `while` starter |
| `data/courses.ts` | Static fallback map: conditionals completed, loops current |
| `components/programming-course-client.tsx` | Loops row is a semantic link when current; mastery panel shows the 4-lesson sequence |
| `tests/{lesson-registry,data-types,phase9d-hardening,practice-exercises,practice-assistance,practice-integration,python-sandbox,thinking-lab,conditionals-practice}.test.mjs` | Shim/count updates for the fourth lesson |

## Mastery concepts added

`loop_iteration`, `range_boundaries`, `while_condition`, `counter_accumulator` — snake_case, consistent with the existing vocabulary; no schema redesign. Dedup verified live (duplicate attemptId → evidence_count stays 1).

## Guided Practice inventory (6)

- `loops-predict-1` (Predict Output, range trace — multi-line 0/1/2) · `loops-predict-2` (Predict Output, while counter trace)
- `loops-fix-1` (Fix the Code, infinite while — missing increment) · `loops-fix-2` (Fix the Code, range boundary off-by-one)
- `loops-write-1` (Write Code, for loop printing 1–5) · `loops-write-2` (Write Code, accumulator summing 1–5)

The accumulator exercise's accumulation pattern is anchored to the loop body line, so a reset inside the loop fails grading and is diagnosed as `accumulator_reset`.

## Thinking activity inventory (4)

`thinking-loop-trace` (trace-program, accumulator + range) · `thinking-loop-order` (algorithm-ordering, the while cycle: set → check → print → increase) · `thinking-loop-debug` (debug-reasoning, why the while never stops) · `thinking-loop-pattern` (pattern-recognition, 2/4/6/8 rule)

## Sandbox starters

- `loop` — "For loop": `for i in range(1, 6): print(i)`
- `while` — "While loop": `count = 1; while count <= 5: print(count); count += 1`

## Adaptation, Robin, Progress, Learning Log

- Adaptation engine untouched; the loops relevance mapping drives chat concepts, feedback scaffolding, and shaky-first practice ordering.
- Robin chat / Robin Check / Smart Feedback / Practice Assistance all work for Loops via the registries — no new AI routes, no answer keys in assist context.
- Progress uses existing Phase 11A.5 lesson_progress (no new table); the practice progress registry persists loops exercise ids and offers the Learning Log on topic completion; Learning Log Save/Edit/Skip works on completion, grounded in loops mastery.

## Verification

- `pnpm exec tsc --noEmit` — clean
- `node --test tests/*.test.mjs` — 289/289
- `git diff --check` — clean
- Live: loops lesson page + API 200; course sequence correct (…variables, data-types, operators, conditionals, loops…); guided loops exercise deterministic check + mastery evidence + dedup verified; thinking activity check correct; Robin hint grounded in `loops`; both loop starters render in the sandbox; Conditionals page still loads.

## Manual setup

Run `database/phase12-loops-sources.sql` in the Supabase SQL Editor to link the lesson's reference sources (the lesson loads without them; it shows 0 sources until seeded).

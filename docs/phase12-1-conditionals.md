# Phase 12.1 — Conditionals Content Expansion

## What this phase proves

The existing reusable learning architecture (lesson registry → localized content/activities → mastery → adaptation → Robin Check/Feedback → Guided Practice → Thinking Lab → Sandbox → progress/Learning Log) absorbs a third complete lesson — Conditionals — with **zero architecture changes**. Every integration below is a registry/content addition following the established per-lesson module pattern.

## Files created

| File | Purpose |
|---|---|
| `content/lessons/programming/conditionals.ts` | LessonContent: intuitive (ID) + academic (EN) explanations, 4 code examples, 7 key terms, 6 common mistakes, 3 quick checks |
| `content/lessons/programming/conditionals-activities.ts` | 9 learning-flow activities (why → intuition → 3 predicts → try → formalize → Robin Check → connect) |
| `content/lessons/programming/conditionals-mastery.ts` | LessonMasteryConfig (concept vocabulary + activity mapping + Robin Check signal mapping) |
| `content/lessons/programming/conditionals-relevance.ts` | Adaptation relevance mappings (activity concepts → mastery concepts; chat concept detection) |
| `content/lessons/programming/conditionals-lesson-config.ts` | Robin Check retry reinforcement + mastery concept labels |
| `content/lessons/programming/conditionals-check-instructions.ts` | Robin Check rubric (explain-back evaluation contract) |
| `content/lessons/programming/conditionals-feedback-instructions.ts` | Smart Feedback rubric |
| `content/lessons/programming/conditionals-localization.ts` | ID/EN copy, Indonesian activity overrides, content localization |
| `lib/lessons/conditionals.ts` | Supabase-backed lesson loader (metadata + sources from DB, body from TS) |
| `app/api/lessons/conditionals/route.ts` | Lesson API |
| `app/courses/programming/conditionals/page.tsx` | Lesson page (thin shell) |
| `components/conditionals-lesson.tsx` | Lesson component (mirrors siblings: Source Mode, Robin Check, progress, Learning Log offer) |
| `content/practice/python/conditionals-exercises.ts` | 6 Guided Practice exercises |
| `database/phase12-conditionals-sources.sql` | Idempotent seed: 2 authoritative sources + lesson links (run manually) |
| `tests/conditionals-lesson.test.mjs` | Lesson registry/content/mastery/relevance/rubric tests |
| `tests/conditionals-practice.test.mjs` | Practice/thinking/sandbox/assist/progress/mastery-dedup tests |

## Files changed

| File | Change |
|---|---|
| `lib/lessons/registry.ts` | Registered `conditionals` (check config + rubrics) |
| `lib/practice/registry.ts` | Added the Conditionals topic to the python track |
| `content/practice/thinking/types.ts` | Extended the `lessonSlugs`/mastery-evidence lesson union with `"conditionals"` |
| `content/practice/thinking/activities.ts` | Added 4 conditionals thinking activities |
| `content/sandbox/python-starters.ts` | Added the `conditionals` starter (input + if/elif/else) |
| `data/courses.ts` | Static fallback map: data-types completed, conditionals current |
| `components/programming-course-client.tsx` | Conditionals row is a semantic link when current; mastery panel reflects the sequence |
| `tests/{lesson-registry,data-types,phase9d-hardening,practice-exercises,practice-assistance,practice-integration,python-sandbox,thinking-lab}.test.mjs` | Shim/count updates for the third lesson |

## Mastery concepts added

`conditional_flow`, `comparison_expression`, `branch_selection`, `input_conversion` — snake_case, consistent with the existing vocabulary; UNSEEN/SHAKY/DEVELOPING/STRONG, evidence types, and attempt-id deduplication are untouched and verified live (duplicate attemptId → evidence_count stays 1).

## Guided Practice inventory (6)

- `conditionals-predict-1` (Predict Output, if/else trace) · `conditionals-predict-2` (Predict Output, elif chain)
- `conditionals-fix-1` (Fix the Code, = vs ==) · `conditionals-fix-2` (Fix the Code, input conversion before compare)
- `conditionals-write-1` (Write Code, if/else) · `conditionals-write-2` (Write Code, if/elif/else)

## Thinking activity inventory (4)

`thinking-conditional-trace` (trace-program) · `thinking-conditional-order` (algorithm-ordering) · `thinking-conditional-debug` (debug-reasoning: input string vs number) · `thinking-conditional-pseudocode` (pseudocode fields: if/else)

## Sandbox

`conditionals` starter: `age = int(input("Umur kamu: "))` with if/elif/else — rides the existing input()/stdin bridge; no sandbox architecture changes.

## Adaptation, Robin, Progress, Learning Log

- Adaptation: generic engine untouched; the conditionals relevance mapping drives teaching context (shaky comparisons → concrete scaffolding; practice ordering surfaces shaky concepts first).
- Robin: lesson chat, Robin Check, Smart Feedback, and Practice Assistance are registry-driven and work for Conditionals with no new AI routes; assist context carries no answer keys.
- Progress: existing Phase 11A.5 lesson_progress (no new table); the practice progress registry persists conditionals exercise ids and offers the Learning Log on topic completion.
- Learning Log: the existing Save/Edit/Skip flow works on Conditionals completion; the summary is grounded in conditionals mastery.

## Verification

- `pnpm exec tsc --noEmit` — clean
- `node --test tests/*.test.mjs` — 271/271
- `git diff --check` — clean
- Live: lesson page + API 200; course sequence correct; guided conditionals exercise deterministic check + mastery evidence + dedup verified; thinking activity check correct; Robin hint grounded in `conditionals`; sandbox + practice topics render.

## Manual setup

Run `database/phase12-conditionals-sources.sql` in the Supabase SQL Editor to link the lesson's reference sources (the lesson loads without them; it just shows 0 sources until seeded).

# Phase 11B — Practice Lab v1

## Goal

A small coding gym for Python fundamentals: active practice of concepts already introduced in lessons, with deterministic checking first and Robin available as an optional explainer. Not a full IDE, not AI-graded.

## Files created

| File | Purpose |
|---|---|
| `content/practice/types.ts` | `PracticeExercise` definition model (data-only checker config) |
| `content/practice/python/variables-exercises.ts` | 6 Variables exercises (2 predict / 2 fix / 2 write) |
| `content/practice/python/data-types-exercises.ts` | 6 Data Types exercises (2 predict / 2 fix / 2 write) |
| `lib/practice/registry.ts` | Explicit static track/exercise registration (mirrors lesson registry) |
| `lib/practice/check.ts` | Deterministic checker: normalization, pattern matching, misconception detection |
| `lib/practice/types.ts` | Practice progress types + request validation (mirrors `lib/progress/types.ts`) |
| `lib/practice/state.ts` | Pure progress state transitions (mirror of `lib/progress/state.ts`) |
| `lib/practice/server.ts` | Practice progress persistence via the privileged server-only client |
| `lib/progress/use-practice.ts` | Client persistence hook (mirror of `use-progress`) |
| `database/phase11b-practice-progress.sql` | `practice_progress` migration — run manually in Supabase SQL Editor |
| `app/api/practice/check/route.ts` | Deterministic grading + best-effort mastery evidence (no AI) |
| `app/api/practice/progress/route.ts` | GET/POST practice progress (local dev guard, registry-validated) |
| `app/practice/page.tsx` | Practice hub |
| `app/practice/python/page.tsx` | Python track page (thin shell → `PracticeLab`) |
| `components/practice-lab.tsx` | Practice session UI (exercise, editor, check, hint, dots, Robin, log offer) |
| `tests/practice-exercises.test.mjs` | Registry/definition validity, pattern-vs-solution invariants |
| `tests/practice-check.test.mjs` | Deterministic grading: correct/incorrect/partial, misconceptions, normalization |
| `tests/practice-progress.test.mjs` | Validation, resume hydration, merge-no-regress, migration SQL |
| `tests/practice-integration.test.mjs` | Route-level grading + mastery evidence, AI independence, Learning Log handoff, shell wiring |

## Files changed

| File | Change |
|---|---|
| `components/app-shell.tsx` | Added Practice nav entry + dumbbell icon (`active === "practice"`); no nav architecture change |
| `app/globals.css` | Added Phase 11B `.practice-*` section using existing theme tokens; responsive rules kept local to the section |

## Exercise definition model

`PracticeExercise` (flat, following the `LessonActivity` convention — no plugin framework):

- `id` — stable (`variables-predict-1`); doubles as the resume anchor and as the mastery dedup scope per attempt
- `lessonSlug` — a registered lesson; grounds mastery vocabulary + Robin context
- `type` — `predict_output` / `fix_code` / `write_code`
- `language` — `python` (v1)
- `prompt`, `hint` (offline), `explanation` (offline), `concept` (display label)
- `masteryConcepts` — validated against the lesson's `LessonMasteryConfig.concepts`
- Checker config (data-only): `expectedOutput` + `misconceptionOutputs` (predict), `starterCode` + `requiredPatterns` + `misconceptionPatterns` (fix/write)
- `sampleSolution` — verification anchor; tests assert every pattern matches it and never tags it as a misconception

## Deterministic checker design

`lib/practice/check.ts` — pure functions, no AI, no code execution:

- `normalizeOutput` — trim edges + unify newlines; comparison stays case-sensitive (Python output is exact: `<class 'int'>`)
- `normalizeCode` — unify CRLF, trim trailing whitespace per line; inner order preserved so order-sensitive patterns distinguish "assign before print" from the reverse
- Precedence: **correct → recognized misconception → partial (write_code only) → incorrect**
- Invalid content patterns fail closed (compile failure → unmatched, never a false "correct")

## Mastery integration

- `/api/practice/check` records `correct_practice` / `incorrect_practice` per `masteryConcepts` entry with the learner's stable `attemptId` — same convention as Robin Feedback (evidence recorded before anything optional, best-effort, never blocks)
- Dedup: the engine's `last_attempt_id` check plus the persisted attempts map; a refreshed session restores attempts and only a new Check click (new `attemptId`) creates new evidence
- No second mastery system — `concept_mastery` rows stay lesson-scoped

## Progress persistence

- New minimal `practice_progress` table (mirrors Phase 11A.5 conventions): `user_id` nullable (future-ready), single row per `course_slug` (track), `current_exercise_id`, `completed_exercise_ids`, `progress_state` jsonb (`attempts` + per-topic `logStatus`), `completed_at`
- RLS enabled, no public policies, service_role only; `requireLocalPractice` dev-local guard
- Only meaningful state is persisted; submission text stays transient (attempt result + exercise id are enough to resume)

## Robin integration

- Practice UI embeds the existing `RobinCompanion` (lesson-grounded `/api/robin/chat`) for the active topic
- Hints are deterministic and stored with each exercise; Robin explains but never overrides grading
- AI failure never blocks: check, hints, and progress all work without the AI runtime

## Learning Log integration

- When a topic's exercises are all completed, the topic's Learning Log status becomes `pending` and the existing `LearningLogOffer` (Save/Edit/Skip) renders for that lesson
- Save reuses `/api/learning/logs` (single writer); Skip records only the decision; nothing auto-saves

## Adaptive behavior

- On topic load, Practice Lab reads the existing `GET /api/learning/mastery?lesson=` summary; exercises touching `shaky` concepts (with evidence) are ordered first; a failed read keeps the default order
- No recommendation engine in v1

## Migration

`database/phase11b-practice-progress.sql` must be run manually in the Supabase SQL Editor (same flow as Phase 11A/11A.5). Until then, progress persistence returns a graceful 503 and practice checking still works.

## Verification

- `pnpm exec tsc --noEmit` — clean
- `node --test tests/*.test.mjs` — 218/218 (189 existing + 29 new)
- `git diff --check` — clean

## Known v1 limitations

- Exercise content is English-only (like lesson code examples); ID localization can layer on later
- Predict Output is typed, not multiple choice; multi-line outputs are out of scope for v1
- Patterns are regex-structural, not an AST — they verify intended beginner shapes, not arbitrary correct code
- Practice exercises ship to the client bundle (static content), same trust model as lesson quick-checks; the server remains the grading authority
- No per-user scoping until authentication exists

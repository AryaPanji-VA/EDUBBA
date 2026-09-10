# Phase 9B — Reusable Lesson Extraction

## Registry design

`lib/lessons/registry.ts` maps a lesson slug to a `LessonDefinition` — everything shared infrastructure needs from a lesson. The registry uses explicit static imports (no dynamic loading, no filesystem discovery). Variables is the first registered lesson.

```ts
type LessonDefinition = {
  slug: string;
  activities: LessonActivity[];          // ordered step sequence
  lessonContent: LessonContent;          // authored lesson prose
  loadLesson: () => Promise<DeliveredLesson>;  // Supabase metadata + content join
  mastery: LessonMasteryConfig;          // concepts + activity→concept + check→evidence mappings
  relevance: LessonRelevance;            // activity/check/chat → relevant mastery concepts
  check: LessonCheckConfig;              // rubric, question, context, optional hint adapter
  feedback: LessonFeedbackConfig;        // feedback rubric
};
```

`getLessonDefinition(slug)` returns `null` for unknown slugs. Routes reject unregistered lessons with a 400 — they never silently fall back to Variables.

## Lesson-owned vs shared responsibilities

| Lesson-owned (in `content/lessons/programming/`) | Shared (in `lib/`) |
|---|---|
| `variables.ts` — lesson prose, examples, terms, mistakes, quick checks | `lib/robin/check.ts` — evaluation schema + validator (slug widened to string) |
| `variables-activities.ts` — 9-step activity sequence with `checkAnswer` | `lib/robin/quiz-feedback.ts` — grading + result parser (uses `activity.checkAnswer`) |
| `variables-mastery.ts` — concept list, activity→concept map, check→evidence mapping | `lib/mastery/engine.ts` — pure transition engine (accepts any lesson slug + concept string) |
| `variables-relevance.ts` — activity/check/chat → relevant mastery concepts | `lib/mastery/server.ts` — DB access (registry-driven concept lists) |
| Variables rubrics: `check-instructions.ts`, `quiz-feedback-instructions.ts` | `lib/adaptation/policy.ts` — pure policy over opaque concept keys |
| `adaptCheckFeedback` in `lib/adaptation/check-support.ts` (Variables hints) | `lib/adaptation/server.ts` — loader with localhost gate |
| `lib/lessons/variables.ts` — Supabase loader | `lib/lessons/registry.ts` — the registry itself |

## Deterministic checker extraction

`isListenersAnswerCorrect` previously lived in shared `content/lessons/activities.ts` and was called for **every** practice activity by both the shared renderer and the shared server grader. A second lesson's practice answers would have been graded against the `listeners = 150` regex.

Now: `LessonActivity` has an optional `checkAnswer?: (answer: string) => boolean` field. The `try` activity in `variables-activities.ts` owns its checker inline. The renderer (`lesson-activity-renderer.tsx`) and the server grader (`gradeActivity` in `quiz-feedback.ts`) call `activity.checkAnswer` — absent means the answer cannot be verified and is not counted as correct (fail-safe). `isListenersAnswerCorrect` no longer exists in shared code.

## API routing changes

All four lesson-aware API routes resolve lesson behavior through the registry:

- **`POST /api/robin/feedback`** — validates the request shape (any non-empty slug), looks up `getLessonDefinition(input.lessonSlug)`, finds the activity in `definition.activities`, maps concepts via `definition.mastery`, applies adaptation via `definition.relevance`, and uses `definition.feedback.rubric`.
- **`POST /api/robin/check`** — looks up the definition, uses `definition.check.rubric` / `question` / `contextLabel` / `lessonContext`, records evidence via `definition.mastery.robinCheckSignalToEvidence`, and applies `definition.check.adaptFeedback` (optional).
- **`POST /api/robin/chat`** — looks up the definition, calls `definition.loadLesson()`, applies adaptation via `definition.relevance.chatConcepts(message)`. The old `lessonSlug !== "variables"` guard is gone; unregistered slugs get a 400.
- **`GET /api/learning/mastery`** — checks registry membership, returns the lesson's concept summary from `definition.mastery.concepts`.

Client components (`SmartFeedback`, `RobinCheck`, `RobinCompanion`) now receive `lessonSlug` as a prop from the lesson page instead of hardcoding `"variables"`.

## Mastery ownership

Generic (in `lib/mastery/`): `ConceptMastery`/`MasterySummary` types, `masteryStates`, `evidenceTypes`, the `applyEvidence` engine (accepts `lessonSlug` and `concept` as strings — no global concept tuple), `recordEvidence` (no lesson guard), `loadMasterySummary` (gets the concept list from the registry).

Lesson-owned (in `content/lessons/programming/variables-mastery.ts`): the 6 Variables concept keys, the activity-concept→mastery-concept map, and the Robin Check signal→evidence mapping. The engine never needs to know what "reassignment" means.

## Adaptation ownership

Generic (unchanged): `lib/adaptation/policy.ts` (pure policy over opaque concept keys/states) and `lib/adaptation/server.ts` (loader with localhost gate, error-safe).

Lesson-owned: `content/lessons/programming/variables-relevance.ts` (activity/check/chat concept mappings — the file `lib/adaptation/relevance.ts` was deleted as dead code) and `lib/adaptation/check-support.ts` (the `x = 5` hint text, wired into the registry as `check.adaptFeedback`). Routes access relevance through `definition.relevance`, never importing lesson modules directly.

## Unknown lesson behavior

`getLessonDefinition` returns `null`; every route returns a deterministic 400 (`QUIZ_FEEDBACK_UNAVAILABLE` / `CHECK_UNAVAILABLE` / Indonesian chat message / mastery error). No silent fallback to Variables. The registry is the single runtime authority for lesson existence.

## Testing approach

- `tests/lesson-registry.test.mjs` (new, 9 tests): registry resolves Variables with the full contract; unknown slugs rejected; `CheckRequest`/`QuizFeedbackRequest` accept non-Variables slugs; a test-only second lesson's practice answer is NOT graded by the Variables regex; Variables predict/practice grading unchanged; `isListenersAnswerCorrect` absent from shared code; a fake second-lesson definition satisfies the contract shape.
- Existing tests updated: route stubs now provide registry doubles; the mastery engine test uses the new `applyEvidence(current, lessonSlug, concept, ...)` signature; practice fixtures carry `checkAnswer`.
- All 87 tests pass (78 pre-existing + 9 new).

## Known remaining Variables coupling (safe to defer)

- `components/variables-lesson.tsx` and `app/courses/programming/variables/page.tsx` — the Variables page (correctly lesson-specific)
- `content/lessons/variables-localization.ts` — all ID/EN copy in one file (CAN WAIT per 9A; components still import it directly)
- `components/robin-check.tsx` client `reinforcement()` — Variables-specific retry prompts
- `lib/robin/instructions.ts` — chat prompt mentions "the current Variables lesson" once
- `lib/memory/commands.ts` / `lib/memory/types.ts` — a `variables` learning-state memory key
- `components/programming-course-client.tsx` — links only `slug === "variables"` lessons
- `data/courses.ts` — presentation mock with Variables as `"current"`
- Robin Check parser (`parseCheckEvaluation`) still validates against the Variables concept/misconception vocabularies in `lib/robin/check.ts` — a second lesson with different check vocabularies would need this parameterized (deferred: no second check exists yet)
- The `concept_mastery` DB CHECK constraints hardcode the Variables concept list and `lesson_slug in ('variables')` — schema change deferred per spec

## Intentionally deferred to later phases

- Localization split (global UI strings vs. lesson content translations)
- Cross-lesson navigation, curriculum/semester/course models
- Per-lesson Robin Check vocabulary parameterization
- Database schema relaxation for multiple lessons
- Consolidation of the two Robin Check hint producers (client `reinforcement` + server `adaptCheckFeedback`)

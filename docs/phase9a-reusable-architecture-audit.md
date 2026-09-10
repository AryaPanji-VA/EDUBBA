# Phase 9A — Reusable Learning Architecture Audit

## Current architecture map

The ROBIN learning system for Variables is organized into the following layers, tracing the actual code:

```
CONTENT (lesson-specific TypeScript modules)
  content/lessons/programming/variables.ts          — lesson prose, code examples, terms, mistakes, quick checks
  content/lessons/programming/variables-activities.ts — 9-step activity sequence with concept + misconception metadata
  content/lessons/variables-localization.ts          — ID/EN UI copy, localized activity prose, content localizer
  content/lessons/activities.ts                      — LessonActivity type + isListenersAnswerCorrect (Variables-specific)
  content/lessons/types.ts                           — LessonContent, LessonSource, DeliveredLesson types

LESSON MODEL (loader + delivery)
  lib/lessons/variables.ts                           — loadVariablesLesson(): joins Supabase metadata + hardcoded content
  app/api/lessons/variables/route.ts                 — GET endpoint returning the delivered lesson
  components/variables-lesson.tsx                    — page component: owns sourceMode, language, loads lesson, renders shell

ACTIVITY RENDERER (UI)
  components/lesson-activity-renderer.tsx            — step navigation, answer forms, gates, SmartFeedback + RobinCheck + MasterySummary
  components/smart-feedback.tsx                      — client feedback panel (abort-aware, attemptId dedup)
  components/robin-check.tsx                          — explain-back UI (submit/retry/skip, client reinforcement prompts)
  components/mastery-summary.tsx                     — collapsible concept mastery panel at CONNECT step

DETERMINISTIC EVALUATION
  content/lessons/activities.ts:isListenersAnswerCorrect — regex checker for the "try" practice activity
  lib/robin/quiz-feedback.ts:gradeActivity           — server-side predict/practice grading
  lib/robin/quiz-feedback.ts:parseQuizFeedbackResult  — strict AI result validation
  lib/robin/check.ts:parseCheckEvaluation             — strict Robin Check result validation

AI SUPPORT
  lib/ai/server.ts                                    — 9Inference client construction (provider, baseURL, model, timeout)
  lib/robin/instructions.ts                           — Robin chat personality system prompt
  lib/robin/check-instructions.ts                     — Robin Check rubric (x = 5 explain-back)
  lib/robin/quiz-feedback-instructions.ts             — Smart Feedback rubric
  lib/robin/parse-reply.ts                            — chat reply parser (JSON + plain-text fallback)
  lib/robin/feedback-request.ts                       — client-side request lifecycle manager for Smart Feedback
  app/api/robin/chat/route.ts                         — chat endpoint (lesson context + memory + adaptation context)
  app/api/robin/check/route.ts                        — Robin Check endpoint (evaluator + evidence + adaptation hint)
  app/api/robin/feedback/route.ts                     — Smart Feedback endpoint (grading + evidence + adaptation context + AI)

MASTERY (deterministic engine + persistence)
  lib/mastery/types.ts                                — 6 concept keys, evidence types, activity→mastery concept map
  lib/mastery/engine.ts                               — applyEvidence(): pure state transition (counters → state)
  lib/mastery/server.ts                               — recordEvidence(), loadMasterySummary(), loadMasteryContext()
  app/api/learning/mastery/route.ts                   — GET mastery summary endpoint
  database/phase8e-concept-mastery.sql                — concept_mastery table (RLS, service_role only)

ADAPTATION (deterministic policy + lesson-owned mappings)
  lib/adaptation/policy.ts                            — buildAdaptation(): pure policy over opaque concept keys/states
  lib/adaptation/relevance.ts                         — Variables concept relevance mapping (activity→mastery, chat→mastery)
  lib/adaptation/check-support.ts                     — adaptCheckFeedback(): deterministic hint appended to Robin Check
  lib/adaptation/server.ts                            — loadAdaptation(), loadAdaptationContext() (server-only, best-effort)

PERSISTENCE
  lib/supabase/server.ts                              — publishable-key client (lesson metadata + sources)
  lib/supabase/memory-server.ts                       — secret-key client (memory + mastery, 4s timeout)
  lib/memory/types.ts                                 — 5 memory keys (2 preferences, 3 learning)
  lib/memory/commands.ts                              — deterministic parseMemoryCommand()
  lib/memory/server.ts                                — memory CRUD + requireLocalMemory guard
  app/api/robin/memory/route.ts                       — memory list + save
  app/api/robin/memory/[id]/route.ts                  — memory delete

TESTS (80 total)
  tests/lesson-activities.test.mjs                    — 3 tests (golden lesson structure + practice checker)
  tests/lesson-localization.test.mjs                 — 2 tests (ID/EN identity + code/answer preservation)
  tests/robin-reply.test.mjs                          — 8 tests (chat reply parser)
  tests/robin-check.test.mjs                          — 5 tests (check validation + route behavior)
  tests/quiz-feedback.test.mjs                       — 14 tests (feedback validation + grading + route behavior)
  tests/memory.test.mjs                              — 8 tests (memory commands + validation + client)
  tests/mastery.test.mjs                             — 19 tests (engine transitions + concept mapping)
  tests/mastery-server.test.mjs                      — 2 tests (server safety + GET summary)
  tests/adaptation.test.mjs                           — 11 tests (policy + relevance + check support + route integration)
  tests/smart-feedback.test.mjs                       — 4 tests (Strict Mode + language + Source Mode + retry)
```

Data flow for a learner answering a predict activity:

```
Browser (lesson-activity-renderer)
  → learner selects an answer, clicks submit
  → updateAnswer generates attemptId via crypto.randomUUID()
  → deterministic correctness shown immediately (answer.value === activity.correctAnswer)
  → SmartFeedback component fires (if !sourceMode && activity.learningPurpose)
    → POST /api/robin/feedback { activityId, lessonSlug, language, learnerAnswer, attemptId }
      → validateQuizFeedbackRequest (rejects unknown keys, pins lessonSlug="variables")
      → variablesActivities.find(id === activityId) — activity lookup
      → gradeActivity() — deterministic grading
      → activityConceptToMastery() — map activity concept to mastery concept
      → recordEvidence("variables", masteryConcept, evidenceType, attemptId) — persist before AI
      → relevantActivityConcepts("variables", grading.concept) — lesson-owned mapping
      → loadAdaptationContext() — mastery states → teaching guidance
      → createServerAIClient().chat.completions.create() — 9Inference call
      → parseQuizFeedbackResult() — validate AI output
    ← { result: { feedback, followUp, diagnosedMisconception } }
  → SmartFeedback renders .mock-feedback panel below deterministic result
```

## Reusable already

These modules could support another lesson with little or no modification:

| Module | Why it's reusable |
|---|---|
| `lib/ai/server.ts` | Provider-agnostic AI client construction. No lesson knowledge. |
| `lib/robin/parse-reply.ts` | Generic JSON/plain-text reply parser. No lesson knowledge. |
| `lib/robin/instructions.ts` | Robin personality prompt. References "Variables" once in a grounding instruction, but the personality rules are generic. |
| `lib/robin/feedback-request.ts` | Generic request lifecycle manager. Knows the endpoint path but not the lesson. |
| `lib/mastery/engine.ts` | Pure state-transition engine over opaque concept keys. The `switch` on `EvidenceType` is generic. The only coupling is `lesson_slug: "variables"` defaults (2 lines). |
| `lib/adaptation/policy.ts` | Pure policy over opaque concept keys and states. Zero lesson coupling by design. |
| `lib/adaptation/server.ts` | Passes `lesson` and `concepts` through. The localhost gate is shared infrastructure. No lesson coupling. |
| `lib/memory/server.ts` | Memory CRUD. Generic over `(category, key)` pairs. The `requireLocalMemory` guard is shared. |
| `lib/supabase/server.ts` | Publishable-key Supabase client. No lesson knowledge. |
| `lib/supabase/memory-server.ts` | Secret-key Supabase client. No lesson knowledge. |
| `components/app-shell.tsx` | Visual shell. No lesson knowledge. |
| `components/signal-background.tsx` | Animated background. No lesson knowledge. |
| `components/mastery-summary.tsx` | Structurally generic (fetches, renders concepts). Coupling is only the `variables-localization` import for labels. |
| `components/smart-feedback.tsx` | Structurally generic. Coupling is `lessonSlug: "variables"` and the `variables-localization` import. |
| `content/lessons/types.ts` | `LessonContent`, `LessonSource`, `DeliveredLesson` type definitions. Generic. |

## Reusable with extraction

These modules contain a reusable pattern but are currently coupled to Variables:

| Module | Coupling | What to extract |
|---|---|---|
| `lib/robin/types.ts` | `RobinReply.grounding.lesson: "variables"` literal type | Widen to `string` |
| `lib/robin/check.ts` | `CheckRequest.lessonSlug: "variables"` literal type + validator guard | Widen to `string` + accept any registered lesson slug |
| `lib/robin/quiz-feedback.ts` | `QuizFeedbackRequest.lessonSlug: "variables"` literal type + validator guard | Widen to `string` |
| `lib/mastery/types.ts` | `masteryConcepts` is a fixed 6-element tuple of Variables concepts; `activityConceptMap` maps only Variables activity concepts; `robinCheckConcepts` is Variables-specific | Split into a generic concept-key type + per-lesson concept registries |
| `lib/mastery/server.ts` | `recordEvidence` early-returns unless `lessonSlug === "variables"`; `loadMasteryContext` hardcodes `"variables"` | Remove the lesson guard (trust the caller); remove `loadMasteryContext` or parameterize it |
| `lib/mastery/engine.ts` | `lesson_slug: "variables"` default in `applyEvidence` and `emptyMasteryRow` | Pass `lesson_slug` from the caller instead of defaulting |
| `lib/adaptation/relevance.ts` | Entire module is Variables-specific: `variablesConcepts` map, `lesson === "variables"` gates, chat keyword regexes | This is correctly lesson-specific. The extraction is to make it a per-lesson registry that the generic policy/server layers call into. |
| `lib/adaptation/check-support.ts` | Hint text hardcodes `x = 5`, `x = 8`, `print(x)`, and Variables misconception codes | This is correctly lesson-specific. The extraction is to make it a per-lesson adapter. |
| `content/lessons/activities.ts` | `isListenersAnswerCorrect` — a Variables exercise checker living in shared code, called for ALL practice activities | Extract a per-activity `checkAnswer?` function on `LessonActivity`; move `isListenersAnswerCorrect` into the Variables lesson content |
| `components/lesson-activity-renderer.tsx` | Imports `variables-localization` for all UI copy; calls `isListenersAnswerCorrect` for practice grading | Accept copy and practice checker as props or from a lesson context |
| `components/smart-feedback.tsx` | `lessonSlug: "variables"` hardcoded; imports `variables-localization` | Accept `lessonSlug` as a prop; accept copy from a lesson context |
| `components/robin-check.tsx` | `lessonSlug: "variables"` hardcoded; imports `variables-localization`; client `reinforcement()` hardcodes Variables misconceptions | Accept `lessonSlug` as a prop; move `reinforcement()` to lesson-specific config |
| `components/mastery-summary.tsx` | Imports `variables-localization` for labels | Accept copy from a lesson context |
| `app/api/robin/feedback/route.ts` | Imports `variablesActivities` directly; looks up activity only in that array | Need a per-lesson activity registry or a lesson-scoped loader |
| `app/api/robin/check/route.ts` | Imports `variablesLessonContent` directly; hardcoded `x = 5` question | Need a per-lesson check configuration (question, context, rubric) |
| `app/api/robin/chat/route.ts` | `lessonSlug !== "variables"` guard; `loadVariablesLesson()` | Need a per-lesson loader dispatch |
| `app/api/learning/mastery/route.ts` | `lesson !== "variables"` guard; ignores query param | Remove the guard or make it a registered-slug check |
| `data/courses.ts` | `programmingLessonStateBySlug` hardcodes Variables as `"current"` | Progress mock — temporary by design |
| `components/programming-course-client.tsx` | Only renders a link for `lesson.slug === "variables"` | Drop the slug check; render any `"current"` lesson as a link |

## Correctly lesson-specific

These should remain Variables-local and are healthy:

- `content/lessons/programming/variables.ts` — lesson prose, code examples, terms, mistakes, quick checks
- `content/lessons/programming/variables-activities.ts` — the 9-step activity sequence with concept and misconception metadata
- `content/lessons/variables-localization.ts` — ID/EN UI copy, localized activity prose, content localizer
- `lib/lessons/variables.ts` — `loadVariablesLesson()` Supabase loader
- `components/variables-lesson.tsx` — the Variables page component
- `app/courses/programming/variables/page.tsx` — the Variables route
- `lib/robin/check-instructions.ts` — the `x = 5` Robin Check rubric (lesson-specific prompt)
- `lib/robin/quiz-feedback-instructions.ts` — the Smart Feedback rubric (references Variables quiz concepts)
- `lib/adaptation/relevance.ts` — the Variables concept relevance mapping (correctly lesson-owned)
- `lib/adaptation/check-support.ts` — the Robin Check adaptation hints (correctly lesson-owned)

## Variables coupling audit

### GOOD coupling (belongs to the lesson)

| Location | What | Why it's good |
|---|---|---|
| `content/lessons/programming/variables.ts:4` | `slug: "variables"` | The lesson's own slug in its content file |
| `content/lessons/programming/variables-activities.ts` | All activity IDs and concept strings | Lesson content |
| `lib/lessons/variables.ts` | `loadVariablesLesson()` | Explicitly lesson-specific loader |
| `lib/robin/check-instructions.ts` | `x = 5` rubric | Lesson-specific prompt content |
| `lib/adaptation/relevance.ts` | `variablesConcepts` map | Correctly lesson-owned mapping |

### TEMPORARY coupling (fine for now, must change before adding many lessons)

| Location | What | Risk |
|---|---|---|
| `app/api/robin/chat/route.ts:46` | `lessonSlug !== "variables"` guard | Lesson 2 chat would 400 |
| `app/api/learning/mastery/route.ts:9` | `lesson !== "variables"` guard | Lesson 2 mastery GET would 400 |
| `components/robin-check.tsx:59` | Client hardcodes `lessonSlug: "variables"` | Lesson 2 check UI would send wrong slug |
| `components/robin-companion.tsx:56` | Client hardcodes `lessonSlug: "variables"` | Lesson 2 chat would send wrong slug |
| `components/smart-feedback.tsx:24` | Client hardcodes `lessonSlug: "variables"` | Lesson 2 feedback would send wrong slug |
| `components/programming-course-client.tsx:146` | Only links `slug === "variables"` | Lesson 2 wouldn't be clickable |
| `data/courses.ts:39` | `variables: "current"` | Progress mock — lesson 2 needs its own entry |
| `lib/memory/commands.ts:26` | `variables` memory key + regex | Lesson 2 memory would need its own keys |
| `lib/mastery/engine.ts:44,55` | `lesson_slug: "variables"` defaults | Lesson 2 rows would be mislabeled |
| `lib/mastery/server.ts:69` | `loadMasteryContext` hardcodes `"variables"` | Dead code for chat, but still coupled |

### ARCHITECTURAL coupling (would make lesson 2 difficult or unsafe)

| Location | What | Why it blocks lesson 2 |
|---|---|---|
| `lib/robin/types.ts:6` | `RobinReply.grounding.lesson: "variables"` literal type | Forces literals in chat route and companion client; root type constraint |
| `lib/robin/check.ts:10` | `CheckRequest.lessonSlug: "variables"` literal type | Rejects lesson 2 check requests at the type level |
| `lib/robin/quiz-feedback.ts:13` | `QuizFeedbackRequest.lessonSlug: "variables"` literal type | Rejects lesson 2 feedback requests at the type level |
| `lib/mastery/server.ts:22` | `if (lessonSlug !== "variables") return;` | Silently swallows all non-variables evidence; lesson 2 mastery would never persist |
| `lib/mastery/types.ts:4` | `masteryConcepts` is a fixed `as const` tuple | Global concept set can't grow per-lesson without polluting this tuple |
| `lib/mastery/types.ts:36-41` | `activityConceptMap` maps only Variables concepts | Lesson 2 activities return `null` from `activityConceptToMastery` and produce no evidence |
| `lib/mastery/types.ts:50` | `robinCheckConcepts` is Variables-specific | Lesson 2 Robin Check would credit the wrong concepts |
| `lib/adaptation/relevance.ts:11,19` | `lesson === "variables"` gates | Adaptation is a no-op for any other lesson |
| `content/lessons/activities.ts:17` | `isListenersAnswerCorrect` in shared code | Called for ALL practice activities; lesson 2 practice would be graded against the `listeners` regex |
| `app/api/robin/feedback/route.ts:2,37` | Imports `variablesActivities` directly | Lesson 2 activities would not be found; no lesson-agnostic registry |

## Lesson model audit

**What defines a lesson?** A lesson is currently assembled from scattered pieces across multiple modules. There is no single `LessonDefinition` object. Instead:

| Aspect | Where it's defined | How it's found |
|---|---|---|
| Slug | `content/lessons/programming/variables.ts:4` | Hardcoded in content module |
| Title | Supabase `lessons.title` column | Loaded via `loadVariablesLesson()` from `lib/lessons/variables.ts` |
| Translations | `content/lessons/variables-localization.ts` | A standalone module imported by 5 components |
| Ordered steps | `content/lessons/programming/variables-activities.ts` | A standalone array of 9 `LessonActivity` objects |
| Activities | Same file | Each activity has `id`, `type`, `concept`, `content`, `code`, `options`, `correctAnswer`, `explanation`, `learningPurpose`, `misconceptionsByAnswer` |
| Concepts | `lib/mastery/types.ts:4` (6 global concepts) + `variables-activities.ts` (activity `concept` strings) | Split between a global tuple and per-activity fields |
| Robin Check config | `lib/robin/check-instructions.ts` (rubric) + `lib/robin/check.ts:1-2` (concept/misconception vocab) + `lib/mastery/types.ts:50` (mastery mapping) | Three separate files |
| Mastery relevance | `lib/mastery/types.ts:36-41` (activity→mastery map) + `lib/adaptation/relevance.ts` (concept relevance) | Two separate files |
| Adaptation relevance | `lib/adaptation/relevance.ts` | Standalone module |
| Navigation (step count) | `variablesActivities.length` (9) — hardcoded in content | No navigation config; the renderer reads the array length |

**The problem:** The lesson definition is scattered across 6+ files. Adding lesson 2 means creating parallel files for each of these modules, with the lesson slug as the only connector. There is no single place that says "this is what the Data Types lesson needs." The risk is not a giant config object — it's that the connection between these pieces is implicit (import paths and hardcoded slugs), not explicit.

However, the scattering is not severe for v1. The pieces are well-named and the boundaries are clear. The problem becomes acute only when lesson 2 arrives and you need to create `data-types-activities.ts`, `data-types-localization.ts`, a mastery concept set, a relevance map, a check rubric, and wire them all into the right routes without any registry to tell you what's needed.

## Activity architecture audit

**Generic activity components:**
- The `LessonActivity` type (`content/lessons/types.ts` + `activities.ts`) is a clean data model with `type` union (`intro | explain | example | predict | practice | formalize | robin_check | connect`) and optional fields (`code`, `options`, `optionLabels`, `correctAnswer`, `explanation`, `learningPurpose`, `misconceptionsByAnswer`). This type is reusable as-is.
- The activity-type branching in `lesson-activity-renderer.tsx` (lines 28-69) uses generic `activity.type` checks — no activity IDs are used as architecture. The renderer would work for any lesson using the same activity types.
- The `canContinue` gate logic is generic: interactive activities require a submitted answer; `robin_check` requires `robinCheckComplete`; everything else allows free navigation.

**Generic evaluation logic:**
- Predict grading (`answer === activity.correctAnswer`) is generic and lives in the activity type definition.
- Practice grading is **not generic** — it calls `isListenersAnswerCorrect`, a Variables-specific regex.

**Activity IDs used as architecture:**
- Activity IDs (`"why"`, `"intuition"`, `"predict"`, `"assignment"`, `"reassignment"`, `"try"`, `"formalize"`, `"robin-check"`, `"connect"`) are used only as content identifiers — they key the `answers` state in the renderer and are sent to the feedback route for activity lookup. They are not used as architecture (no `if (activity.id === "predict")` branching exists). This is healthy.
- The feedback route looks up activities by ID in `variablesActivities.find(item => item.id === input.activityId)`. This is the single point where a per-lesson activity registry is needed.

**Could Data Types reuse the renderer without branching?**
Yes, if: (a) the practice checker is extracted from shared code, (b) the copy source is parameterized, and (c) the `SmartFeedback` component receives `lessonSlug` as a prop. The renderer's step navigation, gate logic, and activity-type branching are all generic.

**Would a new activity type require modifying a giant switch?**
No. There is no switch statement on activity type. The renderer uses a chain of `if`/ternary checks, but they are flat and small. Adding a new activity type would require adding one more `if` branch in the renderer (and to the `LessonActivity["type"]` union), but this is expected and manageable.

**Smallest useful abstraction boundary:**
The boundary is: `LessonActivity` data (generic) + `LessonCopy` (per-lesson) + `PracticeChecker` (per-activity, currently `isListenersAnswerCorrect`). The renderer should receive all three as inputs, not import them from a specific lesson's modules.

## Smart Feedback audit

**How Smart Feedback currently knows each thing:**

| What it needs | Where it comes from | Generic? |
|---|---|---|
| Lesson | `lessonSlug: "variables"` hardcoded in client + validated to literal type | No — architectural coupling |
| Activity | `variablesActivities.find(id === activityId)` in the route | No — Variables-specific lookup |
| Learner answer | Client sends `learnerAnswer` | Yes |
| Expected answer | `activity.correctAnswer` (from content) or `isListenersAnswerCorrect` | Partially — correctAnswer is generic; practice checker is not |
| Activity concept | `activity.concept` field (from content) | Yes (the field is generic; the values are lesson-specific) |
| Grading result | `gradeActivity()` in `lib/robin/quiz-feedback.ts` | Partially — predict grading is generic; practice grading calls `isListenersAnswerCorrect` |
| Language | Client sends `language` | Yes |
| Relevant mastery | `relevantActivityConcepts(lesson, concept)` → `loadAdaptationContext()` | No — relevance map is Variables-only |
| Adaptive policy | `loadAdaptation()` → `buildAdaptation()` | Yes — policy is generic; the mapping that feeds it is not |

**Variables-specific logic inside the feedback path:**
1. The `lessonSlug` literal type on `QuizFeedbackRequest`
2. The `variablesActivities` import in the route
3. The `isListenersAnswerCorrect` call in `gradeActivity` for practice activities
4. The `activityConceptToMastery` map (only maps Variables concepts)
5. The `relevantActivityConcepts` function (only returns arrays for `"variables"`)
6. The `recordEvidence("variables", ...)` call (hardcoded slug)

**Goal for future architecture:**
The Smart Feedback infrastructure (`feedback-request.ts`, `quiz-feedback.ts` parser, `quiz-feedback-instructions.ts` rubric template, the route's body-bounding/config-gate/error-safe pattern) is generic. Lesson-specific information should come from a per-lesson activity registry that provides: the activity array, the practice checker, the concept mapping, and the relevance mapping. The route should look up the lesson by slug, get its registry, and use it.

## Robin Check audit

**Generic Robin Check engine:**
- `CheckEvaluation` type: structurally generic (signal, recognizedConcepts, misconceptions, feedback, recommendedAction). The signal/action pairing and the strict parser are reusable.
- The evaluator independence guarantee (no mastery/adaptation context enters the evaluator call) is a generic principle.
- The evidence recording from a valid evaluation is generic in structure (signal → evidence type → concepts).

**Lesson-specific Robin Check content:**
- `checkConcepts = ["name", "value", "assignment"]` — Variables-specific concept vocabulary
- `checkMisconceptions = ["equality", "identity", "printing", "immutable_binding"]` — Variables-specific misconception vocabulary
- `check-instructions.ts` — the entire rubric is about `x = 5`
- `robinCheckConcepts = ["assignment", "name_binding", "variable"]` — the mastery mapping is Variables-specific
- `adaptCheckFeedback()` in `check-support.ts` — hints reference `x = 5`, `x = 8`, `print(x)`, and Variables misconceptions
- `reinforcement()` in `robin-check.tsx` — client-side retry prompts reference Variables misconceptions

**Smallest extraction:**
The Robin Check *engine* (validation, parsing, evidence recording, adaptation hint insertion) is generic. The *content* (concept/misconception vocabulary, rubric prompt, mastery concept mapping, hint text) is lesson-specific. The extraction is to make the route accept a per-lesson check configuration that provides: the concept vocabulary, the misconception vocabulary, the rubric prompt, the mastery concept mapping, and optionally a hint adapter.

## Mastery + adaptation audit

**Curriculum-independent (generic):**
- `lib/mastery/engine.ts` — the transition engine. `applyEvidence` takes opaque `concept: string` and `evidenceType`. The `switch` on `EvidenceType` is a generic enum. State derivation rules (counters → state) are generic.
- `lib/adaptation/policy.ts` — `buildAdaptation` takes opaque concept keys and `TeachingState`. The scaffolding levels and guidance templates are generic.
- `lib/adaptation/server.ts` — passes lesson and concepts through. No lesson knowledge.
- The evidence weight system (objective: ±1, Robin Check: ±2) is generic.
- The dedup mechanism (`last_attempt_id`) is generic.

**Lesson-specific:**
- `masteryConcepts` tuple — 6 Variables concepts as a global `as const`. This is the single most architectural piece: a global concept registry that can't grow per-lesson without polluting this tuple or refactoring to per-lesson sets.
- `activityConceptMap` — maps Variables activity concepts to mastery concepts. Lesson 2 activities return `null`.
- `robinCheckConcepts` — the three concepts Robin Check credits. Variables-specific.
- `variablesConcepts` in `relevance.ts` — the activity→mastery relevance map. Variables-only.
- The chat keyword regexes in `relevance.ts` — Variables-specific topic matching.

**The key principle:** A lesson should own its concepts and mappings. The global mastery engine should not need to know what "reassignment" means. The current architecture almost achieves this — the engine and policy are already generic — but the concept *registry* is a single global tuple, not a per-lesson registry. The extraction is to move `masteryConcepts` and the two mapping tables from a global module into per-lesson modules, keeping the engine and policy generic.

## Localization audit

**Current structure:**
`content/lessons/variables-localization.ts` is a single 131-line file containing:
- `lessonCopy.en` and `lessonCopy.id` — all UI copy (step navigation, answer feedback, Robin Check, Smart Feedback, mastery labels) in both languages
- `indonesianActivities` — localized activity prose (9 entries)
- `getVariablesActivities(language)` — merges English activity definitions with localized prose
- `localizeVariablesContent(content, language)` — localizes academic explanation, code examples, terms, mistakes, quick checks
- `localizeSourceNote(note, language)` — translates 4 known source relevance notes

Five components import this file directly: `lesson-activity-renderer.tsx`, `smart-feedback.tsx`, `robin-check.tsx`, `mastery-summary.tsx`, and `variables-lesson.tsx`.

**Adding Data Types would require:**
- Creating `content/lessons/data-types-localization.ts` with its own `lessonCopy`, `indonesianActivities`, `get DataTypesActivities`, `localizeDataTypesContent`, `localizeSourceNote`
- Changing 4 of the 5 importing components to import from the new file instead of `variables-localization`

**Global UI translations vs. lesson content translations:**
Currently mixed. Some copy is global UI (step/of/previous/next, correct/incorrect, loading/error states); some is lesson-specific (the Robin Check prompt text, the mastery concept labels). A clean split would:
1. Keep global UI strings in a shared module (or in the component as defaults)
2. Let each lesson provide its own `lessonCopy` that overrides/extends the global defaults
3. Let each lesson provide its own activity localization and content localization

But this split is not urgent. The current single-file approach works and is easy to understand. The extraction can wait until lesson 2 actually needs its own localization file — at which point the global strings can be extracted as a small shared module.

## Progress/navigation audit

**Current assumptions:**
- The renderer reads `activities.length` for step count — no hardcoded 9. This is generic.
- The `step` state is a simple integer bounded by `activities.length - 1`. Generic.
- Navigation (Previous/Continue/Finish) uses `step` and `activities.length`. Generic.
- `canContinue` gates are per-activity-type, not per-step-position. Generic.
- The `answers` state is keyed by `activity.id` (a string), not by step index. This survives reordering and is generic.

**Future requirement:**
Lessons with 6, 8, or 11 steps would work without any navigation change. The renderer already supports this. The only assumption is that the activity array is finite and ordered, which is inherent to the step-flow model.

**No cross-lesson progression exists** — there is no concept of "what lesson comes after Variables" in the code. The course list (`data/courses.ts`) is a presentation mock. This is correct for Phase 9A; cross-lesson progression is explicitly out of scope.

## Minimum reusable lesson contract

Derived from the actual code, the smallest contract a future lesson should provide:

```
A lesson provides:
  slug: string                                    — unique lesson identifier
  content: LessonContent                          — prose, code examples, terms, mistakes, quick checks
  activities: LessonActivity[]                    — ordered step sequence
  localization: {
    copy: { en: LessonCopy, id: LessonCopy }      — UI strings for this lesson
    activities: (language) => LessonActivity[]    — localized activity prose (IDs/code/answers unchanged)
    content: (content, language) => LessonContent — localized academic content
    sourceNote: (note, language) => string       — localized source relevance notes
  }
  practiceChecker: (activityId, answer) => boolean — deterministic practice grading (replaces isListenersAnswerCorrect)
  concepts: string[]                              — this lesson's mastery concept keys
  activityToConcept: (activityConcept) => string|null — maps activity concept strings to mastery concept keys
  robinCheck: {
    question: string                             — the explain-back question
    rubric: string                               — server-only system prompt
    concepts: string[]                           — mastery concepts credited by Robin Check
    misconceptions: string[]                     — allowed misconception codes
    hintAdapter?: (evaluation, policy, language) => CheckEvaluation  — optional adaptation hint
  }
  relevance: {
    activityConcepts: (concept) => string[]      — mastery concepts relevant to an activity concept
    checkConcepts: () => string[]                 — mastery concepts relevant to Robin Check
    chatConcepts: (message) => string[]          — mastery concepts relevant to a chat message
  }
```

This is **not** a giant config object. It is a description of what the reusable learning engine needs from a lesson. The contract can be satisfied by composed small modules (a content file, an activities file, a localization file, a mastery module, a relevance module, a check module) as long as there is a registry that connects them by slug.

The key insight: most of these pieces already exist as separate modules for Variables. The missing piece is the **registry** — a single place that maps a lesson slug to its modules. Without it, every route and component must hardcode the import.

## Phase 9B proposal

### MUST EXTRACT BEFORE LESSON 2

These are architectural couplings that would require copy-paste or unsafe branching if left as-is:

1. **Widen lesson slug literal types** — Change `"variables"` to `string` in `RobinReply.grounding.lesson`, `CheckRequest.lessonSlug`, and `QuizFeedbackRequest.lessonSlug`. This unblocks all three API routes and the companion/check/feedback clients from the type-level Variables constraint. Small, safe, no behavior change for Variables.

2. **Extract `isListenersAnswerCorrect` from shared code** — Add an optional `checkAnswer?: (answer: string) => boolean` field to `LessonActivity`. Move `isListenersAnswerCorrect` into the Variables lesson content. The renderer and quiz grader use `activity.checkAnswer` when present, falling back to `answer === activity.correctAnswer` for predict. This prevents lesson 2 practice activities from being graded against the `listeners` regex.

3. **Create a lesson registry** — A single module (`lib/lessons/registry.ts`) that maps lesson slugs to their content modules, activity arrays, practice checkers, and concept/mastery/relevance/check configurations. Each route and component looks up the lesson by slug from the registry instead of importing `variablesActivities` or `variablesLessonContent` directly. The registry is the connector that makes the scattered pieces addressable.

4. **Parameterize the feedback route** — Look up the activity by slug + ID from the registry instead of importing `variablesActivities` directly. Pass `input.lessonSlug` to `recordEvidence` instead of the hardcoded `"variables"`.

5. **Parameterize the check route** — Look up the check configuration (question, rubric, concepts, misconceptions) from the registry instead of hardcoding `variablesLessonContent` and the `x = 5` question.

6. **Remove the `lessonSlug !== "variables"` guards** — In the chat route, mastery route, and `recordEvidence`. Replace with a registry lookup that rejects unregistered slugs. This allows lesson 2 to be registered and supported without code changes.

7. **Move mastery concept definitions to per-lesson modules** — `masteryConcepts` becomes a per-lesson array, not a global tuple. `activityConceptMap` and `robinCheckConcepts` move into the lesson's mastery module. The engine and server layers take `concepts: string[]` as a parameter.

8. **Move adaptation relevance to per-lesson modules** — `relevance.ts` becomes a per-lesson module (or a registry of per-lesson relevance maps). The generic `policy.ts` and `server.ts` layers already accept opaque concept keys.

### CAN WAIT

These are slightly messy but do not block lesson 2:

- Localization split (global UI strings vs. lesson content) — lesson 2 can have its own `data-types-localization.ts` with duplicated global strings; extract the shared ones later.
- `components/robin-check.tsx` client-side `reinforcement()` — lesson 2 can override it; extract to a prop later.
- `components/programming-course-client.tsx` slug check — lesson 2 can be added to the `variables` check or the check can be dropped.
- `data/courses.ts` progress mock — temporary by design.
- `lib/memory/commands.ts` `variables` memory key — lesson 2 can add its own keys to `memoryOptions`.
- `lib/mastery/server.ts` `loadMasteryContext` (dead code for chat) — remove when convenient.
- Two parallel misconception hint producers (client `reinforcement` + server `adaptCheckFeedback`) — merge when the duplication causes confusion; not blocking.

### DO NOT GENERALIZE

These should stay Variables-specific:

- `content/lessons/programming/variables.ts` — lesson content
- `content/lessons/programming/variables-activities.ts` — activity content
- `content/lessons/variables-localization.ts` — localization content
- `lib/lessons/variables.ts` — lesson loader
- `lib/robin/check-instructions.ts` — Robin Check rubric prompt
- `lib/robin/quiz-feedback-instructions.ts` — Smart Feedback rubric prompt
- `lib/robin/instructions.ts` — Robin personality prompt (the one "Variables" reference can be parameterized, but the personality rules stay)
- `components/variables-lesson.tsx` — lesson page component
- `app/courses/programming/variables/page.tsx` — lesson route
- All Variables-specific test fixtures

## Reference lesson checklist

Every future interactive lesson should preserve these behaviors where relevant:

1. **Deterministic correctness is authoritative** — the application grades objective activities; AI never decides correctness
2. **AI feedback is optional enhancement** — the lesson works without AI; Source Mode remains fully usable
3. **Source Mode is AI-light** — no Smart Feedback, no Robin Check, no adaptation context; deterministic activities and explanations remain
4. **Language toggle does not duplicate attempts** — `attemptId` is stable across rerenders; the server deduplicates evidence
5. **Mastery evidence uses explicit concepts** — the lesson owns its concept keys and mappings; the engine never guesses
6. **Adaptation is deterministic** — `buildAdaptation` is a pure function; no AI decides scaffolding level
7. **Navigation supports the lesson's own step count** — the renderer reads `activities.length`; no hardcoded step count
8. **AI failure does not destroy deterministic state** — evidence is recorded before the AI call; deterministic grading and explanation remain on failure
9. **Mastery failure does not block learning** — `recordEvidence` is best-effort; `loadAdaptation` returns empty on failure
10. **One mistake does not destroy strong mastery** — the engine's transition rules preserve accumulated evidence
11. **One correct answer does not create strong mastery** — STRONG requires multiple successful evidence events
12. **Robin Check evaluator is independent** — no mastery or adaptation context enters the evaluator call; adaptation may only append to feedback, never change signal/concepts/actions
13. **Mastery and memory are separate** — `concept_mastery` and `robin_memories` are different tables; deleting a memory does not affect mastery
14. **No raw JSON/scores/percentages shown to the learner** — mastery is categorical (unseen/shaky/developing/strong); feedback is plain text
15. **The lesson is single-user local-only** — no auth; document this; do not expose publicly

## Verification

```
npx tsc --noEmit       → exit 0
node --test tests/*.test.mjs  → 80 pass, 0 fail
git diff --check      → exit 0 (clean)
```

## Files changed

- `docs/phase9a-reusable-architecture-audit.md` — this audit document (new)

No production code was modified. No tests were added or changed. The baseline remains 80 tests passing.

## Risks

1. **The lesson registry is the critical extraction.** Without it, every route and component must hardcode lesson-specific imports. The registry must be simple (a map from slug to modules) and not become a god-object. The risk is under-extracting (too little registry) or over-genericizing (too much config in the registry). Start with the minimum: slug → activities, content, practice checker, concepts, relevance map, check config.

2. **The `isListenersAnswerCorrect` extraction has a test-coverage gap.** The existing tests assert this function's behavior directly (`tests/lesson-activities.test.mjs`). When it moves to a per-lesson module, the tests must move with it. If the extraction changes the function signature (e.g., to `activity.checkAnswer(answer)`), all callers must be updated atomically.

3. **Widening literal types may let invalid slugs through silently.** Currently the literal type `"variables"` provides compile-time safety. Widening to `string` loses that. The runtime validators (`validateQuizFeedbackRequest`, `validateCheckRequest`) already check the slug, but the check is against the literal. After widening, the validators must check against the registry. A slug that passes the type check but isn't registered would 400 — this is acceptable, but the registry must be the single source of truth.

4. **Per-lesson mastery concept sets may fragment the `concept_mastery` table.** Currently the table has a CHECK constraint on `concept_key` limited to 6 values. Lesson 2's concepts would need to be added to this constraint or the constraint removed. This is a schema migration, which the spec says not to do in 9A — but 9B will need to address it. The safest approach: make the constraint per-lesson (add lesson-specific concept keys) or remove the enum constraint and rely on application-level validation.

5. **The adaptation relevance mapping for chat uses lexical keyword matching.** This is inherently lesson-specific and fragile. A new lesson would need its own regex set. The risk is that this pattern doesn't scale: lesson 3, 4, 5 each add more regexes. The mitigation is to keep the matching conservative and per-lesson, not to build a generic intent classifier.

6. **Two parallel misconception hint producers exist** (client `reinforcement()` in `robin-check.tsx` and server `adaptCheckFeedback` in `check-support.ts`). They use the same misconception keys but produce different text. A learner who gets a SHAKY evaluation and then retries sees hint-style text from the server, then similar but different text from the client. This is not a bug, but it's a maintenance risk: if one is updated and the other isn't, the hints become inconsistent. The mitigation is to eventually consolidate, but this can wait.

## Git

No commit was made. If the audit document is to be committed, suggested message:

```
docs: Phase 9A reusable learning architecture audit
```

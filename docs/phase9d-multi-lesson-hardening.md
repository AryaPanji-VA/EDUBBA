# Phase 9D — Multi-Lesson Hardening

## Audit

Systematic search for remaining `variables`/`data-types` coupling in shared infrastructure found:

| # | Location | Finding | Classification |
|---|---|---|---|
| 1 | `lib/robin/instructions.ts:29` | Shared Robin chat instructions said "current Variables lesson" | **MUST FIX** — shared infra |
| 2 | `components/lesson-activity-renderer.tsx:3` | Imported `lessonCopy` from `variables-localization` | **MUST FIX** — shared infra |
| 3 | `components/smart-feedback.tsx:4` | Same | **MUST FIX** — shared infra |
| 4 | `components/robin-check.tsx:4` | Same | **MUST FIX** — shared infra |
| 5 | `components/mastery-summary.tsx:4` | Same, plus hardcoded Variables concept labels and `?lesson=variables` fetch URL | **MUST FIX** — shared infra |
| 6 | `components/robin-check.tsx:8-25` | `reinforcement()` function hardcoded Variables misconception prompts (equality, printing, immutable_binding, identity) in the shared component | **MUST FIX** — shared infra |
| 7 | `lib/memory/types.ts:5` | `variables` learning-state memory key | SAFE TO DEFER |
| 8 | `lib/memory/commands.ts:26` | Regex matching "variables" for the memory key | SAFE TO DEFER |
| 9 | `components/programming-course-client.tsx:146` | Slug check for clickable lesson links | SAFE TO DEFER |
| 10 | `data/courses.ts` | Progress mock with Variables/Data Types as current | SAFE TO DEFER |
| 11 | All `content/lessons/programming/*` lesson files | Lesson-specific content | DO NOT GENERALIZE |

## Fixed now

### 1. Robin instructions (shared → lesson-neutral)

Changed "this goes beyond the current Variables lesson" to "this goes beyond the current lesson" in `lib/robin/instructions.ts`. No personality or teaching philosophy changed.

### 2. Shared components accept `copy` prop

Four shared components (`LessonActivityRenderer`, `SmartFeedback`, `RobinCheck`, `MasterySummary`) previously imported `lessonCopy` from `variables-localization` for generic UI strings. They now accept a `copy: Record<string, string>` prop. Each lesson page passes its own copy object.

`LessonLanguage` type and `lessonLanguageStorageKey` moved from `variables-localization.ts` to `shared-copy.ts` (the shared home for cross-lesson UI strings). `variables-localization.ts` re-exports them for backward compatibility.

### 3. Robin Check reinforcement → lesson-owned prop

The Variables-specific `reinforcement()` function (retry prompts for equality/printing/immutable_binding/identity misconceptions) moved from the shared `robin-check.tsx` to `content/lessons/programming/variables-lesson-config.ts` as `variablesReinforcement`. The `RobinCheck` component accepts an optional `reinforcement` prop; when absent, it falls back to a generic lesson-neutral prompt. Data Types passes no reinforcement (uses the generic fallback).

### 4. MasterySummary lesson-awareness

`MasterySummary` previously hardcoded `?lesson=variables` in its fetch URL and hardcoded Variables concept labels (`masteryVariable`, `masteryAssignment`, etc.). It now accepts `lessonSlug`, `copy`, and `conceptLabels` props. Each lesson passes its own labels via a lesson config file (`variables-lesson-config.ts` / `data-types-lesson-config.ts`).

### 5. Lesson config files created

- `content/lessons/programming/variables-lesson-config.ts` — `variablesReinforcement` + `variablesMasteryConceptLabels`
- `content/lessons/programming/data-types-lesson-config.ts` — `dataTypesMasteryConceptLabels`

## Deferred

### Memory: `variables` key (items 7-8)

The Phase 7 memory system has an optional `variables` learning-state key in `memoryOptions` and a regex in `parseMemoryCommand` that matches "variables" in chat. This is:
- Separate from mastery (`concept_mastery` table) and adaptation (reads mastery, not memory)
- Scoped to explicit user commands ("bin inget variables = understood") — never automatic
- Not read by Data Types adaptation (adaptation reads `concept_mastery`, keyed by lesson_slug)

Lesson 3 would not accidentally inherit Variables memory. Adding a `data-types` memory key when wanted is a one-line change in each file. Deferred.

### Course client slug check (item 9)

`programming-course-client.tsx` renders a clickable link only for `slug === "variables" || slug === "data-types"`. Adding lesson 3 means adding to the `||` chain. A trivial one-line change. Deferred until more lessons exist to justify a data-driven approach.

### Progress mock (item 10)

`data/courses.ts` is a presentation-layer mock for lesson ordering. Temporary by design. Deferred.

## Lesson 3 readiness

To add a third lesson after Phase 9D, create only lesson-owned files:

1. `content/lessons/programming/<slug>.ts` — lesson content (prose, examples, terms, mistakes, quick checks)
2. `content/lessons/programming/<slug>-activities.ts` — activity sequence with `checkAnswer` on practice activities
3. `content/lessons/programming/<slug>-mastery.ts` — mastery concepts + activity→concept mapping
4. `content/lessons/programming/<slug>-relevance.ts` — adaptation relevance mapping
5. `content/lessons/programming/<slug>-check-instructions.ts` — Robin Check rubric
6. `content/lessons/programming/<slug>-feedback-instructions.ts` — Smart Feedback rubric
7. `content/lessons/programming/<slug>-localization.ts` — bilingual copy (composes from `shared-copy.ts`)
8. `content/lessons/programming/<slug>-lesson-config.ts` — mastery concept labels + optional reinforcement
9. `lib/lessons/<slug>.ts` — Supabase loader
10. `components/<slug>-lesson.tsx` — lesson page component (pass `copy`, `lessonSlug`, `masteryConceptLabels`)
11. `app/courses/programming/<slug>/page.tsx` — route
12. `app/api/lessons/<slug>/route.ts` — lesson API
13. Register in `lib/lessons/registry.ts` — one entry with explicit static imports
14. Seed SQL for the lesson metadata row

**No shared infrastructure changes required.** The AI routes, mastery engine, adaptation policy, renderer, Smart Feedback, Robin Check, and MasterySummary are all lesson-agnostic.

## Architecture boundary

**Shared (lesson-agnostic):**
- `lib/robin/feedback/route.ts`, `check/route.ts`, `chat/route.ts` — resolve through registry
- `lib/mastery/engine.ts`, `server.ts` — generic state engine, registry-driven concept lists
- `lib/adaptation/policy.ts`, `server.ts` — pure policy over opaque concept keys
- `lib/robin/check.ts` — parser parameterized by lesson vocabulary
- `lib/robin/quiz-feedback.ts` — parser parameterized by lesson vocabulary
- `lib/lessons/registry.ts` — the lesson registry
- `components/lesson-activity-renderer.tsx`, `smart-feedback.tsx`, `robin-check.tsx`, `mastery-summary.tsx` — accept copy/labels as props
- `content/lessons/shared-copy.ts` — shared UI strings + `LessonLanguage` type

**Lesson-owned:**
- All `content/lessons/programming/*` files (content, activities, mastery, relevance, rubrics, localization, lesson config)
- `lib/lessons/variables.ts`, `lib/lessons/data-types.ts` — per-lesson loaders
- `components/variables-lesson.tsx`, `data-types-lesson.tsx` — per-lesson pages
- `app/courses/programming/<slug>/` routes

## Phase 10 readiness

Yes — the architecture is stable enough for UI/UX integration. The shared shell (renderer, feedback, check, mastery summary) accepts lesson-provided copy and config through props. A UI redesign would change the shared components' rendering without touching lesson content, mastery, adaptation, or AI routes. The registry contract is stable and tested. No known coupling remains that would complicate either UI work or lesson 3.

## Verification

```
npx tsc --noEmit → exit 0
node --test tests/*.test.mjs → 128 pass, 0 fail (115 pre-existing + 13 new hardening tests)
git diff --check → exit 0
```

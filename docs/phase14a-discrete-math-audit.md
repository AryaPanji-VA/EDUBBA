# Phase 14A — Discrete Mathematics Second Golden Course Audit

Phase 14A is an architecture + pedagogy audit. No production code was changed:
the goal is to know exactly how ROBIN can teach one Discrete Mathematics
lesson with the existing learning engine and the smallest justified
generalization.

## 1. Current Discrete Math state

What exists for `discrete-math` today (verified against `database/seed.sql`,
`data/courses.ts`, `data/curriculum-manifest.ts`, and the absence of any
content/lib files):

- Official course record (seeded, Semester 1): title "Discrete Mathematics",
  code MA-105, description "Logic, sets, relations, and the mathematical
  language of computing.", `total_lessons = 12` (presentation fallback only).
- Curriculum manifest: `modules: []`, provenance `official` (from the
  official Semester 1 course list).
- **No modules, no lessons, no lesson content, no practice, no routes.** The
  database contains only the course shell. No study-context topics exist
  either. Nothing is invented in this audit.

The `16%` progress shown on `/courses` is presentation-fallback data, not
persisted progress (documented in `data/courses.ts`).

## 2. Reusable learning primitives (classification)

### A. Already generic — reuse as-is

| Primitive | Evidence |
| --- | --- |
| Activity step model | `LessonActivity.type`: `intro / explain / example / predict / practice / formalize / robin_check / connect` — none are code-execution concepts. `formalize` is literally a formal-definition stage, ideal for mathematics. |
| Multiple-choice + misconceptions | `predict` activities: `options` + `correctAnswer` + `misconceptionsByAnswer` (per-answer misconception mapping lives in lesson content, not global). |
| Free-text deterministic checking | `practice` activities: lesson-owned `checkAnswer(answer)` predicate; absent checker = never correct. Booleans, normalized text, and numeric answers are all expressible. |
| Deterministic grading | `gradeActivity` (lib/robin/quiz-feedback.ts): exact-match for predict, lesson-owned predicate for practice. Zero Programming assumptions. |
| Misconception taxonomy | Lesson-owned via `misconceptionsByAnswer` + lesson feedback rubric (`definition.feedback.misconceptions`). No global hardcoded math taxonomy needed. |
| Lesson registry | `LessonDefinition` (slug, activities, lessonContent, loadLesson, mastery, relevance, check, feedback) is course-agnostic in contract. |
| Mastery engine | `(lesson_slug, concept_key)` with lesson-owned `LessonMasteryConfig`; deterministic evidence application; AI never sets state. Phase 9C already relaxed lesson CHECK constraints. |
| Progress persistence | DB keyed by `(course_slug, lesson_slug)` — multi-course by design; `useProgress(lessonSlug, activities, courseSlug)` already parameterizes course. |
| Robin Check | Lesson rubric via `definition.check.rubric` (every lesson after Variables supplies its own); signal schema strong/developing/shaky + recognizedConcepts + misconceptions is domain-neutral. |
| Smart Feedback | AI explains after deterministic grading; lesson rubric + allowed misconceptions; AI cannot change correctness. |
| Learning Log | `course_slug` + `lesson_slug` columns; offer flow is lesson-scoped. |
| Localization | Per-lesson ID/EN copy modules; `LessonLanguage` = "id" | "en". |
| Source Mode | Already AI-independent: formal definitions (`academicExplanation`), examples, deterministic activities with `checkAnswer`, sources list. Quiet signal mode. Exactly what a no-AI math lesson needs. |
| Notation display | `codeExamples` and the activity `code` field render in monospace blocks as plain text; `language` is a free-form display string ("python" → "notation" is fine). Unicode symbols render as-is. |
| Adaptation, memory, Robin companion | Lesson-scoped via registry + lesson-owned relevance; domain-neutral. |

### B. Programming-specific but easy to generalize (14B candidates)

1. **Progress API course guard** — `app/api/learning/progress/route.ts`:
   GET hardcodes `loadProgress("programming", lesson)`; POST rejects
   `courseSlug !== "programming"`. The DB layer is already multi-course.
   Generalization: resolve course from the lesson registry (add a
   `courseSlug` to `LessonDefinition`, or a course→lesson map) and validate
   `input.courseSlug === definition.courseSlug`.
2. **Robin chat log preview** — `app/api/robin/chat/route.ts:217` hardcodes
   `courseSlug: "programming"` in `logPreview`, so a Discrete Math lesson
   would mislabel its saved Learning Log. Same registry-driven fix.
3. **Static fallbacks** — `useCurrentLesson` / `loadCurrentLesson` fall back
   to the Programming course; acceptable to keep (Programming stays the
   default landing course), but worth deriving from data when 14B lands.
4. **Course overview** — `ProgrammingCourseClient` hardcodes CS-101 copy,
   `/api/courses/programming`, programming mastery rows, and
   `implementedProgrammingLessonSlugs` state logic. A second course needs
   either a parameterized course client or a parallel one; decide in 14B
   (keep it honest — no premature abstraction).
5. **Default Robin Check rubric** — `lib/robin/check.ts` exports
   Variables-specific defaults (`checkConcepts`, `checkMisconceptions`) used
   only by the Variables definition. Every other lesson already overrides
   via its own rubric; a Discrete Math lesson does the same. No change
   needed, just noted.

### C. Programming-specific and should remain so

- Python Sandbox, Guided Practice (python track), `python-starters`.
- Practice Lab's code-oriented framing and Robin Practice Assistance
  instructions.
- Thinking Lab `lessonSlugs` typing limited to the six programming lessons
  (may generalize later if math thinking activities are wanted — not needed
  for the golden lesson).
- Sandbox handoff mechanics.

Discrete Math must not be forced into Python-shaped practice. Its lesson
uses the lesson flow only; Practice/Sandbox integration is optional and
deferred.

### D. Missing capabilities genuinely needed

**Almost none.** The nine-stage flow covers the proposed math lesson with
the existing eight activity types. Two honest gaps, both avoidable for the
golden lesson:

1. Truth-table display: no table renderer exists, but the activity `code`
   field renders pre-formatted monospace text — a Unicode truth table
   (`p │ q │ p ∧ q`) displays cleanly. No new primitive required.
2. Multi-field interactions (like Thinking Lab's `fields`): not required;
   single predict/practice steps suffice. Defer.

One real constraint discovered: the **lesson registry is flat (keyed by
lesson slug only)**, while the DB uniqueness for lessons is per-module and
the Phase 13.3 manifest validator enforces lesson-slug uniqueness per
course. Lesson slugs must therefore be chosen to be globally unique across
courses (e.g. `propositions`, not a generic `logic`).

## 3. Selected golden lesson

**"Propositions and Connectives"** (candidate slug: `propositions`) —
proposition, truth value, negation (¬), conjunction (∧), disjunction (∨).

- **Provenance: `robin`.** The official curriculum specifies the course
  ("Logic, sets, relations, ..."), and the description's first word is
  "Logic" — propositional logic is the canonical opening topic of Discrete
  Mathematics and matches the course's official scope. But no official
  module/lesson structure exists in the repository, so this is a ROBIN
  learning lesson under the official course, declared
  `sourceType: "robin"` and ingested through the Phase 13.3 workflow. It is
  not labeled official.
- **Why it is a good architecture test:**
  - foundational and first-semester appropriate;
  - reasoning-oriented rather than code-oriented — genuinely different from
    Programming, so it proves generality instead of a clone;
  - objective practice with deterministic boolean answers ("what is
    p ∧ q when p is true and q is false?" → exact-match options
    true/false with `misconceptionsByAnswer`);
  - free-text deterministic checking ("Is ¬p true or false when p is
    false?" → lesson-owned `checkAnswer` accepting benar/salah/true/false);
  - explain-back is natural ("Jelasin pakai bahasa lu sendiri kenapa
    p ∧ q bernilai false kalau salah satu proposition false.");
  - mastery concepts are crisp: `proposition`, `truth_value`, `negation`,
    `conjunction`, `disjunction`;
  - notation requirements (¬ ∧ ∨ T F) are plain Unicode.

## 4. Candidate learning flow (mapped to existing primitives)

```
WHY        intro      why precise statements matter (arguments, conditions)
INTUITION  explain    everyday claims that are true or false; "p" as a name
                      for a claim
REPRESENT  example    natural language → proposition symbols
                      (p: "Jakarta is the capital of Indonesia")
PREDICT    predict    truth value of a single proposition (MC, deterministic)
SEE        example    worked example: truth conditions of ∧ with a small
                      truth table (monospace code block)
PREDICT    predict    "p true, q false → p ∧ q?" (MC; misconception:
                      and_requires_one_true → "true")
TRY        practice   "¬p when p is false — true or false?" (free text,
                      lesson-owned checkAnswer, ID/EN accepted)
FORMALIZE  formalize  formal definitions: proposition, truth value, truth
                      conditions of ¬, ∧, ∨
ROBIN CHECK robin_check  explain-back: why p ∧ q is false when q is false
CONNECT    connect    → implications (→) later, conditionals in Programming,
                      sets/relations later in the course
```

Nine stages, same shape as Variables, zero new activity types. The
difference is content: representation and reasoning replace code reading and
writing.

## 5. Strategy summaries

- **Deterministic grading:** predict = exact match on finite options
  (true/false/ Error-style distractors as needed) with per-answer
  misconceptions; practice = lesson-owned regex/normalizing predicate
  (accept "true"/"benar", "false"/"salah", case-insensitive, trimmed).
  AI never decides correctness. No CAS, no symbolic algebra — none needed
  for truth-functional logic.
- **Smart Feedback:** lesson-owned rubric + misconception vocabulary (e.g.
  `and_requires_one_true`, `negation_flips_persistence`, `or_exclusive`
  — final taxonomy belongs to the lesson content, defined in 14B). AI
  explains the diagnosed misconception after deterministic grading.
- **Robin Check:** reuse the schema and the flow; the lesson supplies its
  own rubric (like operators/data-types do) with concepts
  `proposition / truth_value / conjunction` and math misconceptions.
  Conceptual understanding judged, not writing quality; beginner wording
  accepted.
- **Mastery:** lesson-owned config mapping activity concepts
  (e.g. `evaluating_conjunction` → `conjunction`); Robin Check signal maps
  to evidence types exactly like the existing lessons. Deterministic
  evidence only.
- **Source Mode:** works as-is — `academicExplanation` carries the formal
  definitions, `codeExamples` (language: "notation") carry truth tables,
  predict/practice activities remain deterministic, sources list carries
  textbook references. AI-off remains a complete lesson.
- **Notation:** plain Unicode (¬ ∧ ∨ → ↔ T F) in existing text/monospace
  blocks. **No KaTeX/LaTeX dependency.** Revisit only if a later lesson
  needs genuinely complex typeset math (fractions, aligned derivations).

## 6. Course identity

Discrete Math reuses the whole design system (AppShell, lesson grid, panels,
switchers, Source Mode). The lesson feels mathematical through its
*content* — truth tables as focal artifacts, notation in the activity code
blocks, reasoning prompts — not through a separate theme. No visual
redesign; no `if course === "discrete-math"` engine logic. Course-specific
content only, exactly like the Programming lessons are course-specific
content.

## 7. Minimal generalization plan for Phase 14B

### REUSE AS-IS
- Activity type system, `LessonActivity`, activity renderer
- Deterministic grading (`gradeActivity`), misconceptions-by-answer
- Lesson registry contract, mastery engine, adaptation
- Progress hook + DB (already course-keyed), Learning Log flow
- Robin Check schema/flow, Smart Feedback pipeline, Robin companion
- Localization architecture, Source Mode, shell, theme

### GENERALIZE
- Progress API course resolution: derive course from the lesson registry
  (add `courseSlug` to `LessonDefinition`; validate POST against it; GET
  uses it) — removes both hardcoded `"programming"` checks in
  `app/api/learning/progress/route.ts` without changing Programming
  behavior.
- Robin chat `logPreview.courseSlug` from the same registry field.
- Implemented-lesson presentation data: add a Discrete Math implemented
  list/state map alongside the Programming one (same pattern, per-course
  data, no shared abstraction forced).

### ADD
- The golden lesson vertical slice, following the Operators slice pattern
  exactly: content (propositions.ts, -activities, -mastery, -relevance,
  -check-instructions, -feedback-instructions, -localization,
  -lesson-config), `lib/lessons/propositions.ts` loader, registry entry,
  API route `app/api/lessons/propositions/route.ts`, page
  `app/courses/discrete-math/propositions/page.tsx`, lesson component,
  tests (mirror operators-lesson/operators-practice tests).
- Curriculum structure for the lesson via the **Phase 13.3 ingestion
  workflow**: manifest entry (`sourceType: "robin"`), validate, diff,
  generate SQL, manual review/apply. First real use of the ingestion
  foundation.
- A minimal Discrete Math course overview route (decision in 14B:
  parameterize vs. parallel client — prefer the smallest honest option).

## 8. Risks

- Flat registry requires globally unique lesson slugs (constraint noted;
  `propositions` is safe).
- Progress API generalization touches a validated, working endpoint — must
  keep all 378 tests green and Programming behavior identical.
- Robin Check rubric quality for math explain-back needs the same care as
  the operators rubric (ID phrasing, beginner-friendly acceptance).
- The `16%` presentation progress for discrete-math is fake fallback data —
  14B should not let the course page present it as real progress (same
  honest-data rule as Phase 13.2).
- Truth tables in monospace blocks are adequate but not beautiful; if the
  learner experience suffers, a dedicated table style is a small CSS-only
  addition later — not a dependency.

## 9. Next implementation scope (14B)

One vertical slice: the `propositions` lesson + the two registry-driven
generalizations (progress API, logPreview) + curriculum ingestion for the
lesson's structure + tests. Nothing more. No bulk modules, no other lessons,
no practice/sandbox for math, no Phase 14C.

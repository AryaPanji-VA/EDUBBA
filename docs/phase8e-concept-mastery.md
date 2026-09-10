# Phase 8E — Concept Mastery v1

## What concept mastery means

Concept mastery answers: "What does the learner currently appear to understand?" It does not answer "How much of the page did the learner view?" Lesson completion (reaching the CONNECT step) is not understanding. A concept is learned when the learner can recognize, use, and explain it.

## Evidence vs mastery state

Evidence is a learning event: a correct prediction, an incorrect practice, a Robin Check signal. Mastery state is the derived summary: unseen, shaky, developing, strong. Multiple evidence events accumulate into a state. One event does not instantly determine the state.

## Why mastery is deterministic

The application decides mastery transitions using fixed rules. AI never decides mastery. Robin Check AI evaluates the learner's explain-back answer, but the signal (strong/developing/shaky) is just evidence — the engine converts it to counters, not to a mastery state directly.

## Why AI does not decide mastery

AI can misjudge meaning. A model might call a shaky answer "strong" or miss a subtle misconception. Deterministic evidence (correct/incorrect) is reliable. Robin Check is weighted evidence, not a mastery verdict. The engine's fixed thresholds are auditable and explainable.

## Counters

- `evidence_count`: total number of evidence events recorded for this concept.
- `success_count`: weighted sum of positive evidence (correct prediction/practice = +1; Robin Check strong = +2; Robin Check developing = +1).
- `struggle_count`: weighted sum of negative evidence (incorrect prediction/practice = +1; Robin Check shaky = +2).

## State derivation

```
if evidence_count === 0: unseen
else if struggle_count >= 2 && struggle_count >= success_count: shaky
else if success_count >= 3 && success_count >= struggle_count + 2: strong
else: developing
```

## Why one mistake does not destroy strong

STRONG requires `success_count >= 3` and `success_count >= struggle_count + 2`. A single incorrect prediction adds 1 struggle, making the gap `success_count >= struggle_count + 1` — not enough to maintain strong, so it drops to developing. But it does not jump to shaky (which requires `struggle_count >= 2`). The learner keeps their accumulated success evidence.

## Why one correct answer is not enough for strong

STRONG requires at least 3 successful evidence events with a 2-point gap over struggle. One correct prediction gives `success_count = 1`, which yields DEVELOPING. This prevents a single lucky guess from creating false confidence.

## How Robin Check contributes

A Robin Check evaluation produces a signal that maps to three concepts (assignment, name_binding, variable). A strong signal gives +2 success to each; developing gives +1 success; shaky gives +2 struggle. Robin Check carries more weight than a single objective activity because it tests the integrated mental model, not a single prediction.

## Why mastery and memory are separate

Phase 7 `robin_memories` stores explicit learner preferences and notes ("I prefer analogies"). Concept mastery stores evidence-generated states ("assignment: developing"). These are different data: preferences are subjective and learner-controlled; mastery is objective and engine-derived. Merging them would let a learner claim "I understand assignment" by saving a memory, bypassing evidence. The `concept_mastery` table is separate from `robin_memories`.

## How persistence works

Mastery rows live in PostgreSQL (`public.concept_mastery`), accessed through the server-only privileged Supabase client (`SUPABASE_SECRET_KEY` or legacy `SUPABASE_SERVICE_ROLE_KEY`). RLS is enabled with no anonymous policies; only `service_role` can read/write. The `updated_at` trigger mirrors Phase 7. Mastery survives browser reloads. The system is single-user local-only; no authentication exists yet.

## Why auth will eventually require user_id

The current schema has no `user_id` column because there is one learner. When authentication is added, `user_id` must be added to the unique constraint `(user_id, lesson_slug, concept_key)` and to all queries. The current design is forward-compatible: the unique constraint is on `(lesson_slug, concept_key)`, which becomes a per-user composite key with `user_id` prepended. Do not expose this system publicly without auth.

## How Phase 8F will later use mastery adaptively

Phase 8F (not implemented) may use mastery states to adapt the lesson: route shaky concepts to reteaching, skip strong concepts, or suggest review. Mastery is the input; adaptive routing is the consumer. Phase 8E only produces the evidence and states — it does not act on them.

## Files

Created:

- `database/phase8e-concept-mastery.sql` — table, constraints, trigger, RLS
- `lib/mastery/types.ts` — concept vocabulary, evidence types, concept mappings
- `lib/mastery/engine.ts` — deterministic transition engine
- `lib/mastery/server.ts` — server-only DB access, evidence recording, context
- `app/api/learning/mastery/route.ts` — GET mastery summary endpoint
- `components/mastery-summary.tsx` — learner-facing mastery panel
- `tests/mastery.test.mjs` — engine and mapping tests
- `docs/phase8e-concept-mastery.md` — this guide

Changed:

- `lib/robin/quiz-feedback.ts` — `attemptId` field added to request validation
- `app/api/robin/feedback/route.ts` — records evidence after deterministic grading, before AI call
- `app/api/robin/check/route.ts` — records evidence after valid Robin Check evaluation
- `app/api/robin/chat/route.ts` — mastery context added as optional system message
- `content/lessons/variables-localization.ts` — mastery UI copy in both languages
- `components/lesson-activity-renderer.tsx` — `attemptId` generation, `MasterySummary` at CONNECT step
- `components/smart-feedback.tsx` — `attemptId` prop, dedup fix, separate source-mode effect
- `app/dev/page.tsx` — mastery diagnostic panel and endpoint listing
- `database/queries.sql` — Phase 8E educational query examples

## Manual browser test plan

Use the Variables lesson on your local development server after running `database/phase8e-concept-mastery.sql` in Supabase SQL Editor. Reload between independent scenarios.

A. Answer the first predict correctly (92). Expected: `variable` moves UNSEEN → DEVELOPING. Not STRONG.

B. Answer the reassignment predict wrong (92). Expected: `reassignment` receives struggle evidence. Likely DEVELOPING or SHAKY.

C. Retry the reassignment predict correctly (110). Expected: success evidence added. Mastery reflects mixed evidence.

D. Complete additional correct activities. Expected: eventually → STRONG for the relevant concept.

E. Robin Check: submit "x itu nama yang di-bind ke value 5 lewat assignment". Expected: positive evidence for assignment, name_binding, variable.

F. Robin Check: submit "= ngecek apakah x sama dengan 5". Expected: struggle evidence for the three concepts.

G. Reload the page. Expected: mastery states persist.

H. Save and delete an explicit Robin memory. Expected: mastery is unaffected.

I. Turn Source Mode ON and answer a predict activity. Expected: deterministic evidence still records without AI feedback.

## Verification interpretation

Implementation verification: unit tests pass; TypeScript passes. Unit tests use the engine directly and never call Supabase or 9Inference. They check state transitions, weighting, dedup, concept mapping, and invalid input rejection. Existing Phase 8B/8C/8D tests remain intact.

CODE VERIFIED does not mean LIVE MASTERY VERIFIED. Actual mastery accumulation and persistence require a live database (run the SQL) and manual browser testing. The transition thresholds (3 for STRONG, 2 for SHAKY) are v1 heuristics that may need tuning.

## Database setup

1. In Supabase SQL Editor, paste `database/phase8e-concept-mastery.sql` and run it.
2. No new environment variables needed. Reuses `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`).
3. Run `pnpm dev --hostname 127.0.0.1`.
4. Open `/dev` and confirm the Concept Mastery panel shows the setup note.
5. Open `/courses/programming/variables` and complete activities.
6. Check the mastery summary at the CONNECT step.

CODE VERIFIED: TypeScript + tests pass.
DATABASE SETUP REQUIRED: run `phase8e-concept-mastery.sql` manually.
LIVE MASTERY VERIFIED: requires your manual browser testing after SQL setup.

# Phase 11B.4 — Robin Practice Assistance

## Assistance architecture

One shared assistance layer for all three Practice modes — not three AI systems:

- `components/practice-assist.tsx` — one compact contextual card (actions → one response), reused by Guided Practice, Sandbox, and Thinking Lab. Not a chat window; response is temporary UI state only.
- `lib/practice/assistance.ts` — shared request model, validation (mode/action consistency, size clamps), and the deterministic Python-error sanitizer.
- `lib/practice/assistance-instructions.ts` — practice addendum on top of the existing `robinInstructions` personality (checker authority, beginner level, staged hint disclosure, mode behavior).
- `app/api/practice/robin/route.ts` — narrow practice-specific route. Justification: `/api/robin/chat` is lesson-coupled (registered-lesson lookup, lesson sources, memory/log intents, lesson grounding contract); extending it would entangle lesson and practice concerns. Provider code is NOT duplicated — the route reuses `createServerAIClient`/`getAIConfig` (lib/ai/server.ts) and `parseRobinReply`.

The temporary 9Inference diagnostics in `app/api/robin/chat/route.ts` are preserved untouched.

## Context payload design

Client sends a minimal, task-specific payload; the server builds authoritative context:

| Field | Guided | Sandbox | Thinking |
|---|---|---|---|
| `exerciseId` | ✓ | — | — |
| `learnerAnswer` | ✓ (re-graded server-side) | — | — |
| `activityId` | — | — | ✓ |
| `submission` (serialized) | — | — | ✓ (validated + re-graded) |
| `sandboxCode` | — | ✓ | — |
| `sandboxError` | — | ✓ (sanitized) | — |
| `hintStage` (1/2) | hint actions | — | hint actions |

Server-side context enrichment: exercise/activity prompt, concept, stored hint, and the deterministic result come from the registries — never from the client. Answer keys (`expectedOutput`, `sampleSolution`, `requiredPatterns`, `correctOptionIds`, `correctOrder`, misconception metadata) never leave the server.

## Actions implemented

- **Guided**: `hint` ("Give me a hint", staged), `explain-result` ("Explain why this is wrong", enabled after an incorrect/partial check). `explain-concept` is supported by the model/route for later surfacing.
- **Sandbox**: `explain-code`, `explain-error` (enabled only when an error exists), `next-step`.
- **Thinking**: `hint` ("One hint"), `break-down-problem` ("Break it down"), `explain-reasoning` (enabled after a check).

## Hint leakage prevention

- Stage 1: one small nudge; the exercise explanation is withheld from the provider context entirely on hint requests (`explanation: null`), so the model cannot reveal what it was not given.
- Stage 2 (explicit "More help"): deeper step-by-step guidance, still no ready-to-submit answer.
- Answer-key fields are excluded from all provider contexts by construction.

## Deterministic authority + fallback

- Guided/thinking results are **re-graded server-side** in the assistance route; Robin is instructed to defer to the deterministic result and never re-grade.
- AI failure: route returns a friendly 502/503/504; the assist card shows a small non-blocking error with the request intact; static hints, Check/Run, navigation, and deterministic feedback are unaffected.
- No live AI in tests; the provider is stubbed.

## Mastery / persistence impact

None. No `recordEvidence`, no `concept_mastery`, no Learning Log writes, no new tables, no chat history. Sandbox remains non-mastery. Assistance responses are component state only.

## Verification

- `pnpm exec tsc --noEmit` — clean
- `node --test tests/*.test.mjs` — 253/253 (218 previous + 11 new assistance tests + 24 from 11B.3/11B.3.1 work already on disk)
- `git diff --check` — clean
- Live (localhost): all three mode pages render with their assistance markers; guided hint (stage 1 + stage 2), guided explain-result (defers to checker), sandbox explain-error, thinking break-down all returned grounded 200s; deterministic guided/thinking check endpoints unchanged; malformed assist request → 400; SSR `data-theme` marker present (theme system untouched).

## Deliberately deferred

- `explain-concept` surface button (model + route support it; UI keeps the spec's two guided actions)
- Sandbox stdout in assist context (kept minimal: code + error)
- Persistent practice chat history, AI grading, code rewriting — out of scope

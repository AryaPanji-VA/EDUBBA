# Phase 8C — Lesson Localization + Robin Check AI v1

## Localization

Variables defaults to Indonesian. The ID / EN buttons store only a language preference in browser localStorage under `robin.lessonLanguage`. Storage failure leaves the session usable. No language database table or learning-memory entry is created.

`content/lessons/variables-localization.ts` holds bilingual UI copy and Indonesian lesson prose. The existing English activity sequence remains the shared exercise definition. Localized activities preserve IDs, code, canonical option values, correct answers, and concept IDs. Option labels may change without changing stored answers. Supplemental academic notes, code-example descriptions, terms, common mistakes, and Quick Checks are localized too. Source titles, publisher names, and URLs remain original. Known source relevance notes have reviewed Indonesian translations; unknown future notes retain their original text until reviewed.

Indonesian uses natural explanations with recognizable CS terms such as assignment, value, binding, and object. English stays beginner-friendly without literal slang translations. Source Mode stays neutral and hides companion banter.

Language changes do not remount the flow or Robin Check. The current step, submitted predictions/practice, explain-back text, and current completion state survive switching languages and Previous navigation. Reload resets lesson/check progress but retains language preference. Robin chat receives no lesson-language setting and continues responding to the learner's message/register independently. Generated Robin Check feedback also follows the answer's language; it is not translated or regenerated when the toggle changes.

## Robin Check architecture

Browser → POST `/api/robin/check` → request validation → server-owned Variables content + rubric → existing 9Inference client → validated JSON evaluation → natural feedback.

The endpoint accepts only `lessonSlug: "variables"`, `answer` (1–2000 characters), and `language` (`id` or `en`, used only as a fallback when answer language is unclear). The actual streamed JSON body is bounded to 12,000 bytes. Client-supplied rubrics, signals, and other fields are rejected.

The rubric lives in the server-only `lib/robin/check-instructions.ts`. Grounding uses the existing reviewed Variables content directly on the server. No source-page browsing, database dependency, chat history, or learner memory is needed for this focused check.

The provider configuration is unchanged: existing 9Inference package endpoint, model configuration, server-only key, and SDK. The only request-body fields are `model` and `messages`; cancellation is an SDK transport option, not another body field.

## Rubric and validation

Essential evidence: x is a name; 5 is the involved value/object; assignment binds/associates them. Exact academic wording is not required. "x stores 5" or a box metaphor is not automatically wrong; feedback may gently refine it. Advanced binding vocabulary is helpful, not required.

Recognized-concept codes are limited to `name`, `value`, and `assignment`. Misconception codes are limited to `equality`, `identity`, `printing`, and `immutable_binding`.

The result contains exactly signal, recognizedConcepts, misconceptions, feedback, and recommendedAction. The parser rejects unknown fields/codes, duplicate concepts, oversized/malformed output, contradictory signal/action pairs, strong without all essential concepts, major misconceptions with a non-shaky signal, percentages, and links. There is no permissive plain-text fallback. Structural validation cannot guarantee the AI's conceptual judgment is correct.

- Strong → concise feedback and Continue.
- Developing → one focused reinforcement prompt and revised explanation.
- Shaky → misconception-focused feedback, another representation, and one targeted retry.

After one successful retry response, Continue is available even if the signal stays shaky. No recursive tutoring loop or adaptive route is created. Failure retries retry the request; they do not create extra successful pedagogical cycles. The UI renders plain feedback and text signal labels, never a JSON dump or numeric score.

## Failure, Source Mode, and boundaries

Provider failure, missing configuration, invalid output, or timeout gives a generic error. Provider error objects, credentials, and headers are never logged or returned. Typed answers are retained, retry stays available, and the learner can explicitly continue without AI evaluation. Skipping gives no mastery signal.

Source Mode cancels pending evaluation and prevents new evaluation requests. It offers a self-review prompt and an explicit no-AI continuation. Switching language does not cancel or re-run an evaluation. Existing deterministic Quick Checks stay deterministic.

There are no memory reads/writes in this endpoint, no automatic remember commands, no result persistence, no schema changes, and no provider changes. Explicit Phase 7 memory behavior is untouched. This does not make the existing unauthenticated personal-development app safe for public exposure. No authentication, public-deployment hardening, or Phase 8D work is included.

## Files

Created:

- `content/lessons/variables-localization.ts`
- `components/robin-check.tsx`
- `lib/robin/check.ts`
- `lib/robin/check-instructions.ts`
- `app/api/robin/check/route.ts`
- `tests/lesson-localization.test.mjs`
- `tests/robin-check.test.mjs`
- `docs/phase8c-localization-robin-check.md`

Changed:

- `content/lessons/activities.ts` — optional display labels, unchanged answer values.
- `components/lesson-activity-renderer.tsx` — localized controls and mounted check state.
- `components/variables-lesson.tsx` — language preference/selector and new check component.

## Manual browser test plan

Use the Variables lesson on your normal local development server. Reload between independent check scenarios because check attempts are intentionally session-only. Never paste credentials into the lesson or chat.

A. With no saved language preference, verify Indonesian is shown. Walk through all nine steps; check code, deterministic feedback, and references.

B. At a prediction, submit an answer, switch ID → EN, and verify the same step, selected answer, feedback, and Continue state remain. At practice, verify both `listeners = 150` and `listeners = listeners + 30` still pass.

C. Switch EN → ID and verify the same state. Enter Robin Check text and switch languages and steps; it must stay present. Reload: language should persist, lesson progress should reset.

D. Submit: "x is a name that is bound to the integer object with value 5 by assignment." Expect recognition of all essential concepts, a strong signal, and Continue. Also try the beginner explanation "x stores 5": it must not be automatically wrong solely for using beginner vocabulary.

E. Reload, return to Robin Check, and submit an incomplete explanation such as "5 is a value in the program." Expect feedback on what is missing, reinforcement/reteaching, and one targeted retry. After that retry succeeds as a request, Continue must be available regardless of the signal.

F. Reload and submit: "= ngecek apakah x sama dengan 5". Expect the equality misconception, a shaky signal, and a different representation distinguishing assignment from comparison. Test one revised explanation.

G. Make the provider unavailable in an isolated test environment, or interrupt the request using browser network controls. Do not change real credentials just for this test. Verify calm error, preserved text, request retry, and explicit no-AI continuation. Source Mode must also cancel an in-flight request without losing text.

H. Switch Source Mode ON: companion hidden, neutral academic copy/references/Quick Checks work in ID and EN, no new Robin Check AI request, explicit continuation available.

I. With lesson ID, ask the normal companion an English question; with lesson EN, ask in Indonesian. It should follow your actual message, not the lesson selector.

J. Using only an intentional test preference, verify an explicit Phase 7 remember command still works. Inspect LAB before and after Robin Check: evaluations must not create learning memories. Remove only your test preference when finished.

## Verification interpretation

Implementation verification: 25 tests pass; TypeScript passes in the isolated validation copy. Browser checks confirmed Indonesian default, ID/EN state preservation, practice feedback, retained explain-back text across Previous/language switches, original source links, Source Mode, no-AI continuation, and mobile layout without horizontal overflow. The saved EN preference was restored after reload.

The preview's check request returned a sanitized 503 because AI was not configured there; the typed answer and retry/skip controls remained available. No successful live provider evaluation occurred. Strong/developing/shaky provider responses were tested with doubles, not claimed as live model-quality verification. Normal chat and explicit memory implementations were unchanged, not re-tested against live services in this phase.

Root `pnpm build` remains blocked by the existing Windows EPERM dependency-access problem. The isolated `work/phase6` copy passed `pnpm build --webpack` when run without the development server. An earlier concurrent validation build failed inside Webpack. No dependency or environment changes were used to resolve it.

Unit tests use provider doubles and never call 9Inference. They check request validation, bounded bodies, result validation, safe failure, minimal provider payload, and absence of memory dependencies. Localization tests compare canonical exercise identity across both languages. Existing activity/memory/reply tests remain intact.

CODE VERIFIED does not mean LIVE ROBIN CHECK VERIFIED. Actual provider rubric quality for correct, partial, and misconception answers requires live requests and human review. AI can misjudge meaning, and the short fixed retry prompts are not a complete adaptive learning system.

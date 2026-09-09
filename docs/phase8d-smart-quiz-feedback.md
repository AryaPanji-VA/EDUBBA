# Phase 8D — Smart Quiz Feedback v1

## Architecture

Browser → POST `/api/robin/feedback` → request validation → server-side activity lookup → **server-owned deterministic grading** → quiz context + rubric → existing 9Inference client → validated JSON feedback → natural learner-facing explanation.

The endpoint accepts only `activityId`, `lessonSlug` (`"variables"`), `language` (`id`/`en`), and `learnerAnswer` (1–2000 characters). The streamed JSON body is bounded to 12,000 bytes. Client-supplied correctness, concepts, or rubrics are rejected — the server reconstructs all of these from the reviewed activity definitions in `variables-activities.ts`.

Correctness is never determined by AI. The server uses the existing deterministic checkers (`answer === correctAnswer` for predict, `isListenersAnswerCorrect` for practice) before calling the provider. The AI only receives the result and generates pedagogical feedback.

## Rubric and grading

Server-owned grading lives in `lib/robin/quiz-feedback.ts`. The `gradeActivity` function looks up the activity by ID, applies the deterministic checker, and maps the wrong answer to a misconception code via `misconceptionsByAnswer`. Correct answers always map to `null` misconception.

Misconception codes are limited to `first_assignment_persists`, `assignment_history`, `reassignment_invalid`, `prints_name_text`, and `declaration_required`.

The rubric lives in the server-only `lib/robin/quiz-feedback-instructions.ts`. It tells Robin: correctness is already determined; confirm briefly when correct (no over-celebration, `followUp` must be null); when incorrect, target the likely misconception, use a different representation, and optionally return one follow-up question for predict activities only. Practice activities never return a follow-up. Never say "Incorrect" or "The correct answer is...".

The result contains exactly `feedback`, `followUp` (null or `{ prompt, code, options }`), and `diagnosedMisconception`. The parser rejects unknown fields, bad codes, oversized feedback (1200 chars), oversized follow-up fields, duplicate options, URLs, secrets, percentages, and — critically — any `followUp` when `isCorrect` is true. There is no permissive plain-text fallback.

## Failure, Source Mode, and boundaries

Provider failure, missing configuration, invalid output, or timeout gives a generic `QUIZ_FEEDBACK_UNAVAILABLE` error. Provider error objects, credentials, and headers are never logged or returned. The deterministic result and explanation remain visible above the feedback area. Continue never blocks on AI.

Source Mode prevents the `SmartFeedback` component from fetching: it renders null. Deterministic correct/incorrect feedback, explanations, academic notes, and Quick Checks remain fully usable. Switching language or navigating Previous cancels any in-flight feedback request via `AbortController`.

There are no memory reads/writes in this endpoint, no automatic remember commands, no result persistence, no schema changes, and no provider changes. Robin Check (Phase 8C) remains a separate feature: Robin Check evaluates open-ended explain-back; Smart Quiz Feedback explains a deterministically graded result. They do not merge.

## Files

Created:

- `lib/robin/quiz-feedback.ts` — request validation, server-owned grading, result parser
- `lib/robin/quiz-feedback-instructions.ts` — server-only feedback rubric
- `app/api/robin/feedback/route.ts` — POST endpoint
- `components/smart-feedback.tsx` — client feedback component
- `tests/quiz-feedback.test.mjs` — validation, grading, parser, and route tests
- `docs/phase8d-smart-quiz-feedback.md` — this guide

Changed:

- `content/lessons/activities.ts` — `learningPurpose` and `misconceptionsByAnswer` optional fields on `LessonActivity`
- `content/lessons/programming/variables-activities.ts` — metadata on three objective activities
- `content/lessons/variables-localization.ts` — smart-feedback UI copy in both languages
- `components/lesson-activity-renderer.tsx` — `SmartFeedback` rendered after deterministic result
- `app/dev/page.tsx` — Phase 8D status panel and endpoint listing

## Misconception mapping

| Activity | Wrong answer | Misconception code | Likely misunderstanding |
|---|---|---|---|
| predict (tempo print) | `tempo` | `prints_name_text` | print outputs the name text |
| predict (tempo print) | `Error` | `declaration_required` | name must be declared separately |
| predict (reassignment) | `92` | `first_assignment_persists` | first assignment remains active |
| predict (reassignment) | `92 and 110` | `assignment_history` | variable stores assignment history |
| predict (reassignment) | `Error` | `reassignment_invalid` | reassignment is not allowed |
| practice (listeners) | *(free text)* | null | general guidance, no pre-mapping |

## Manual browser test plan

Use the Variables lesson on your normal local development server. Reload between independent scenarios. Never paste credentials.

A. At `tempo = 92; print(tempo)`, choose `92`. Expected: deterministic correct, concise Robin reinforcement, no follow-up question.

B. At `tempo = 92; tempo = 110; print(tempo)`, choose `92`. Expected: deterministic incorrect, Robin targets `first_assignment_persists`, explains reassignment with a different representation, optional follow-up.

C. Same question, choose `92 and 110`. Expected: deterministic incorrect, different misconception feedback (`assignment_history`).

D. Switch Source Mode ON. Expected: no AI feedback request, deterministic explanation only, Continue available.

E. Make the provider unavailable (isolated test environment or browser network controls). Expected: lesson still works, deterministic explanation visible, Continue remains available, no error spam.

F. Repeat A–E in English (EN). Expected: natural English feedback with CS terms preserved.

G. At the listeners practice activity, submit `listeners = 150`. Expected: deterministic correct, Robin explains why the direct assignment works, no follow-up question.

H. Submit `listeners = 120` (wrong). Expected: deterministic incorrect, Robin gives general guidance (no misconception code), no follow-up question (practice activities).

## Verification interpretation

Implementation verification: unit tests pass; TypeScript passes. Unit tests use provider doubles and never call 9Inference. They check request validation, deterministic grading integrity, misconception lookup, result validation, route body bounding, safe failure, minimal provider payload, and absence of memory dependencies. Existing Phase 8B/8C tests remain intact.

CODE VERIFIED does not mean LIVE SMART FEEDBACK VERIFIED. Actual rubric quality — whether the AI correctly diagnoses misconceptions and gives useful feedback for correct, partial, and wrong answers — requires live 9Inference requests and human review.

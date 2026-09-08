# ROBIN AI v1 — 9Inference migration

## SDK, provider and model

- SDK: the existing official openai npm package.
- Provider: 9Inference, the service receiving the request.
- Model: DeepSeek V4 Pro, exact default ID deepseek-v4-pro.
- API method: client.chat.completions.create(), without streaming.

An SDK is client software: it builds HTTP requests and reads responses. A provider
is the service at the destination. A model generates the answer.
The openai package can communicate with 9Inference because 9Inference implements
a compatible API. The package name does not determine the destination.

baseURL is the starting address for requests. Setting it to
https://9inference.cloud/v1/package sends Chat Completions to
https://9inference.cloud/v1/package/chat/completions.
This account uses a purchased package; the standard endpoint returned HTTP 403
with code package_endpoint_required. ROBIN LAB displays the package endpoint,
and the temporary sanitized diagnostic logger was removed in Phase 6.2 after
the user confirmed successful live operation.

Provider reference: https://9inference.cloud/en (JavaScript compatibility example
and model catalog). No additional SDK or provider framework was added.

## Manual setup

Add these entries to your existing project-root .env.local, keeping all Supabase
values unchanged:

```env
NINEINFERENCE_API_KEY=my-real-key
ROBIN_AI_MODEL=deepseek-v4-pro
```

Use your own 9Inference key. Never paste it into chat, commit it, or prefix it with
NEXT_PUBLIC_. .env.example contains an empty key placeholder. OPENAI_API_KEY and
OPENAI_MODEL are legacy and unused by ROBIN; this migration does not remove or
modify any values in your real .env.local.

1. Save .env.local.
2. Stop the current Next.js development server.
3. Restart with pnpm dev.
4. Open /dev.
5. Confirm 9Inference, OpenAI-compatible, deepseek-v4-pro and CONFIGURED.
6. Open /courses/programming/variables.
7. Press "jelasin lebih goblok".
8. Ask "bin kenapa = sama == beda?".
9. Follow up with "trus reassignment nyambungnya dimana?".
10. Enable Source Mode.
11. Confirm the AI panel is hidden while sources and objective Quick Checks work.

CONFIGURED means a nonempty key is present, not that the provider accepted it.
No SQL changes, additional dependency installation or browser API keys are needed.
The pre-existing primary dependency-folder permission issue still needs to be
resolved if pnpm dev cannot start on this machine.

## One request

Browser → POST /api/robin/chat → validation → shared Variables loader →
Robin instructions + lesson context + source metadata + bounded conversation →
openai SDK → 9Inference → DeepSeek V4 Pro → backend parsing → browser.

The browser contract is unchanged:
```json
{
  "reply": "Robin's explanation",
  "grounding": { "status": "grounded", "lesson": "variables" },
  "sourceCount": 4
}
```
sourceCount comes from actual backend data; four is only an example.

System messages contain Robin's existing personality/teaching rules and clearly
labeled lesson context. Previous user/assistant messages and the current user
question follow. History cannot supply system roles.
The server shares the lesson loader with GET /api/lessons/variables; it does not
call itself over HTTP. Source metadata does not include source page bodies or URLs.
The model receives no credentials, unrelated courses, stored quiz answers or UI state.

## Parsing and grounding

We ask for {"grounding":"grounded" or "general","reply":"..."} in the instructions.
We do not assume support for OpenAI Responses or strict JSON-schema output.

The small parser:
- Parses valid JSON, stripping an enclosing Markdown JSON fence when present.
- Uses a nonempty reply and accepts grounded/general classification.
- Treats unknown or absent grounding as general.
- Falls back to useful plain text with general grounding if JSON parsing fails.
- Rejects empty/non-answer results safely and bounds replies to 3000 characters.
- Downgrades truncated replies to general.

The endpoint also rejects incomplete/refused provider completions safely.
Only message.content is used, never a separate reasoning-content field.

Grounding is still the model's conservative self-assessment, not sentence-level
citation verification. Questions materially outside Variables must be labeled
general. Database references remain the only clickable source links; replies
render as plain text. Source metadata is not evidence that the model read a page.
This remains LESSON CONTEXT V1, not RAG: no retrieval search is implemented.

## Session, cost and failures

The last eight conversational messages remain in React memory. Reloading clears
them. Source Mode hides the mounted panel, preserves page memory, cancels pending
browser requests, and never automatically calls AI. Lesson content, references,
Quick Checks and non-AI Bin Check remain independent of the provider.

Questions remain capped at 2000 characters, history entries at 3000, and request
bodies at 40 KB. The compatible request body contains only model and messages.
The SDK timeout is 30 seconds with no retries; the browser timeout remains 45 seconds.
No extra reasoning features are enabled. Model-side defaults and provider support
must be confirmed in a live test; no provider retention guarantee is implied.

Missing configuration, invalid keys/permissions, payment errors, unavailable models,
rate limits, timeout/network failures and empty/malformed responses return safe
errors. Raw provider errors, headers, stack traces and keys are never returned or logged.

## Files touched by the migration

- lib/ai/server.ts: renamed from lib/openai/server.ts; provider, base URL, model,
  configuration status and server-only SDK construction.
- lib/robin/parse-reply.ts: small defensive parser.
- lib/robin/instructions.ts: existing personality retained; explicit JSON request.
- app/api/robin/chat/route.ts: Chat Completions call, parsing and safe errors.
- app/dev/page.tsx: provider, compatibility, model and key-presence diagnostics.
- .env.example: new variables and legacy-variable note.
- tests/robin-reply.test.mjs: parser tests using Node's built-in test runner.
- docs/phase6-robin-ai.md: this guide.

React components, browser contracts, Supabase code, lesson content, source links,
stored checks and the visual system are unchanged by this provider migration.

## Verification

Run parser tests with Node 24 or another version supporting TypeScript stripping:
node --test tests/robin-reply.test.mjs

CODE VERIFIED and LIVE 9INFERENCE VERIFIED are different:
local compilation, validation and fallback tests cannot prove successful inference.
Migration checks passed: eight parser tests, TypeScript, production webpack build
in the clean work/phase6 installation, all existing page/API route HTTP 200 checks,
and a safe missing-key 503. Browser verification confirmed Source Mode hides the
AI input while retaining the lesson, four database sources and a working local quiz.
The production browser bundles contained no provider base URL or key-like secrets.
.env.local remains ignored and was not modified.
Direct pnpm build in the primary project still fails with the pre-existing Windows
EPERM dependency access error. Initial browser inspection timed out during compile;
retrying after load succeeded.
No 9Inference key was configured during the original migration checks.
The user has since confirmed Phase 6 is live on the package endpoint.
Phase 6.2 personality quality still requires the user's own live review.

Variables only. No authentication, RAG, persistent memory or AI grading was added.
The existing public endpoint has no access control/rate limiting; public calls can
consume provider balance once configured.

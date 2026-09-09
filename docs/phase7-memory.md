# Phase 7: Persistent Learning Memory v1

Memory v1 assumes one personal ROBIN user. **Local development only; not safe for public deployment.** Authentication and per-user authorization are required before exposing persistent memory publicly. Do not expose your development server through tunnels or on a shared network. Start it bound to localhost.

## What is stored?

Persistent means the data lives in PostgreSQL and survives a browser reload. React's last eight conversation messages remain session-only and disappear on reload. ROBIN never archives those messages.

Instead, five supported keys describe two preferences (explanation style and answer length) and three learning states (variables, name binding, assignment versus comparison). Values are a fixed vocabulary. Arbitrary personal text, secrets, transcripts, and automatic learning assessments are not accepted. Confidence is nullable and is not inferred.

Structured key/value rows are easier to inspect and query than transcripts: one row answers “what explanation style should Robin prefer?” without reading a conversation.

## CRUD and UPSERT

- CREATE: add a preference such as `explanation_style = analogy-first`.
- READ: list the rows in ROBIN LAB.
- UPDATE: change an existing learning state from `shaky` to `understood`.
- DELETE: remove exactly one selected memory.
- UPSERT: create a row if absent, otherwise update it. The unique `(category, key)` pair prevents duplicate preferences/concepts.

Each row has a UUID identity, category, key, value, optional learning status/confidence, explicit source, and creation/update timestamps. A PostgreSQL trigger sets `updated_at` on every update; the original `created_at` stays unchanged.

## Where the code runs

Browser → Next.js memory route → separate server-only Supabase client → PostgreSQL → JSON → browser.

`lib/memory/types.ts` defines the shared safe vocabulary and validation. `commands.ts` deterministically recognizes explicit remember/forget intent. Ambiguous, quoted, negative, unsupported, or sensitive requests ask for clarification or decline; there is no model-driven extraction. Successful commands return a deterministic confirmation without calling 9Inference. Ask a separate teaching question afterward.

`lib/memory/server.ts` contains bounded reads, upserts, exact deletions, safe errors, and compact prompt context. Before ordinary AI generation, at most five validated rows and 1,000 characters enter a standard system message. Current requests override stored preferences. Memories can be stale: they are context, not truth. Provider payload remains only `model` and `messages`.

`components/robin-memory.tsx` manages inspection/edit/delete in ROBIN LAB. The existing companion shows a status only after a successful memory operation. Source Mode keeps the companion inactive and academic learning independent.

## Access boundaries

RLS stays enabled with **no anon or authenticated policies**. SQL revokes public/anon/authenticated table privileges and grants CRUD only to `service_role`. That privileged role bypasses RLS; RLS is not authorization for our server routes.

The separate `lib/supabase/memory-server.ts` uses `import "server-only"` and reads `SUPABASE_SECRET_KEY` first, then `SUPABASE_SERVICE_ROLE_KEY` only if the preferred key is missing or blank, plus the existing `SUPABASE_URL`. Both credentials are server-only. It never falls back to the lesson/publishable client. Browser code imports only safe types/options, not that module. Never use a `NEXT_PUBLIC_` credential or log/return either key. A rejected preferred key does not trigger a retry with the legacy key.

Routes reject production mode, non-loopback hosts and cross-origin browser requests. This is defense in depth, **not authentication**. Anyone able to reach an allowed local route has the same user's memory access. Future public deployment requires authenticated ownership (`user_id`), per-user authorization, and ownership-aware constraints/policies; those are not implemented here.

Missing key/schema or a database failure gives a sanitized memory error. Ordinary AI chat catches memory failures and continues without stored context. Neither setup nor fake memories are created automatically.

## Manual setup

1. In the correct Supabase project, open SQL Editor, paste `database/phase7-memory.sql`, and run it. This is the only setup SQL. It seeds nothing. If existing policies cause an exception, the transaction rolls back: inspect them manually rather than weakening RLS.
2. Open project **Settings → API Keys**. Use a server **secret** key (recommended by Supabase) or the legacy **service_role** key, not a publishable/anon key. See https://supabase.com/docs/guides/getting-started/api-keys .
3. Locally add `SUPABASE_SECRET_KEY=your-server-secret-key` to your own `.env.local`. Existing `SUPABASE_SERVICE_ROLE_KEY` configuration remains a legacy fallback when the preferred variable is missing or blank. Keep the existing URL/provider configuration. Never paste credentials into chat or commit them. ROBIN LAB checks availability through the memory API, so either supported credential works; the key is never sent to LAB.
4. Stop your development process with Ctrl+C, then run `pnpm dev --hostname 127.0.0.1` from the project root. Open `http://127.0.0.1:3000/dev` (use the printed port if different).
5. Refresh ROBIN MEMORY: expect zero rows initially, not “unavailable.”

## Live tests (manual)

In the Variables lesson with Robin ON:

1. Say “bin inget ya gue lebih gampang ngerti kalau lu kasih analogi dulu”. Expect MEMORY SAVED; reload, ask “bin jelasin variable scope”, and check analogy preference.
2. Say “bin catet gue masih suka ketuker assignment sama comparison”. Inspect the new shaky learning row in LAB.
3. Say “bin assignment sama comparison sekarang udah aman, inget ya”. Expect MEMORY UPDATED, same row count, understood status, newer timestamp.
4. Say “bin lupain preference analogi gue”. Only that matching preference should disappear.
5. Say “bin function apaan?”. No new memory should appear.
6. Reload: the remaining learning row persists. Test LAB edit and delete for one selected row. Switch Source Mode ON: academic content/checks remain usable without memory writes.
7. Ask “jangan analogi dulu, jelasin formal” while an analogy preference exists: the current request should win. Ambiguous “hapus memory gue” must not delete anything.

`database/queries.sql` has optional educational examples; it is not required setup. SQL mutation examples are rolled back by default.

## Verification and limitations

Implementation files created:

- `database/phase7-memory.sql`
- `lib/supabase/memory-server.ts`
- `lib/memory/types.ts`, `lib/memory/commands.ts`, `lib/memory/server.ts`
- `app/api/robin/memory/route.ts`, `app/api/robin/memory/[id]/route.ts`
- `components/robin-memory.tsx`
- `tests/memory.test.mjs`
- `docs/phase7-memory.md`

Existing files changed:

- `.env.example` (empty credential placeholder only)
- `app/api/robin/chat/route.ts` (explicit commands and optional context)
- `lib/robin/instructions.ts` (memory context rules; existing personality preserved)
- `lib/robin/types.ts` (optional action metadata)
- `components/robin-companion.tsx` (subtle confirmation)
- `app/dev/page.tsx` (memory panel and endpoints)
- `database/queries.sql` (optional exercises)

Code checks do not verify a live database or model preference behavior. DATABASE SETUP REQUIRED and LIVE MEMORY VERIFIED are separate milestones. No live database changes are performed by implementation tooling. Deterministic language parsing intentionally supports a small vocabulary, not arbitrary facts. Concurrent saves may race on the saved/updated label, but the unique constraint prevents duplicate rows.

After you verify the live tests, this is a good checkpoint for `feat: add persistent learning memory to Robin`. No automatic commit or later phase is included.

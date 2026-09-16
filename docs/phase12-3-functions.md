# Phase 12.3 — Functions Content Expansion

## Scope

Functions is the fifth complete lesson slice after Variables, Data Types, Conditionals, and Loops. It uses the existing lesson registry, deterministic activities, mastery engine, adaptation, Robin Check, Smart Feedback, progress persistence, Learning Log, Practice Lab, Thinking Lab, and browser-only Python Sandbox.

The beginner scope covers why functions exist, `def`, calls, parameters and arguments, return values, print versus return, basic local variables, reuse, and common mistakes. Recursion, lambda, decorators, generators, closures, advanced scope, variadic arguments, and higher-order functions remain out of scope.

## Mastery concepts

- `function_definition`
- `function_call`
- `parameters_arguments`
- `return_values`

Evidence reuses the existing mastery schema and stable attempt-id deduplication.

## Guided Practice

Six deterministic exercises are registered under the Functions topic:

- 2 Predict Output: define/call tracing; print versus return.
- 2 Fix the Code: missing definition colon; replace print with return.
- 2 Write Code: greeting function; two-parameter function with a returned sum.

## Thinking Lab

Four structured activities cover decomposition, algorithm ordering, call/return tracing, and debugging a missing function call. Correctness remains deterministic and AI-independent.

## Sandbox

- `Simple function`: define `greet(name)` and call it with `"Panji"`.
- `Parameters + return`: define `add(a, b)`, return the sum, and print `add(3, 4)`.

Both run in the existing browser worker; no server-side Python execution was added.

## Manual source setup

Run `database/phase12-functions-sources.sql` in Supabase SQL Editor. The lesson row already exists in `database/phase4-seed.sql`; this script only upserts two authoritative sources and links them to Functions. The lesson can load before this step, but its references remain empty until the script is applied.

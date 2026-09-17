# Phase 12.4.1 — Operators Full Vertical Slice

Operators is now the third implemented lesson in Programming Building Blocks:

1. Variables
2. Data Types
3. Operators
4. Conditionals
5. Loops
6. Functions

The lesson bridges stored, typed values to decisions. It teaches arithmetic, comparison, and basic logical operators; expressions; beginner precedence; assignment versus equality; and boolean results without duplicating Conditionals' control-flow scope.

## Reused architecture

Operators uses the existing lesson registry, lesson API pattern, shared nine-stage activity renderer, Source Mode, Robin Check, Smart Feedback, progress persistence, mastery engine, adaptation relevance contract, Learning Log offer, Guided Practice registry, Thinking registry, Sandbox, and generic Robin Practice Assistance. No new state system, table, or AI provider behavior was introduced.

## Existing progress compatibility

Existing completion rows for Conditionals, Loops, and Functions are left untouched. The course overview resolves every implemented lesson independently from persisted progress. If there is no unfinished persisted current lesson, it selects the first implemented incomplete lesson. This makes Operators available to an existing learner without deleting or rewriting later history.

## Sources

Run `database/phase12-operators-sources.sql` manually in the Supabase SQL Editor to attach the two official Python references. The migration is idempotent. The lesson API remains usable with an empty references list before the source rows are seeded.

## Deliberately out of scope

Advanced boolean algebra, bitwise/identity/membership operators, the walrus operator, Phase 13 curriculum work, authentication, and architecture redesign remain outside this phase.

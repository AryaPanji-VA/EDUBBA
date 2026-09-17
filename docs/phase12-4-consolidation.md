# Phase 12.4 — Programming Fundamentals Consolidation

## Final sequence

The curriculum order remains:

1. Variables
2. Data Types
3. Operators
4. Conditionals
5. Loops
6. Functions

Variables, Data Types, Conditionals, Loops, and Functions are complete vertical slices. Operators keeps its third position because arithmetic and comparison expressions logically bridge values/types into decision-making.

## Operators decision at the time of Phase 12.4

Operators currently exists only as seeded curriculum metadata. It has no page, API route, lesson registry entry, activity flow, localization, mastery configuration, relevance mapping, Guided Practice topic, or persisted lesson progress.

Building those pieces would be a content expansion comparable to Conditionals, Loops, or Functions, not a consolidation fix. Phase 12.4 therefore keeps Operators visible and intentionally locked. Existing lessons provide small prerequisite bridges: Data Types demonstrates how `+` behaves across types, Variables distinguishes `=` from `==`, and Conditionals explicitly teaches comparison operators.

Phase 12.4 recommended a scoped vertical slice instead of exposing a partial page. Phase 12.4.1 has since implemented that complete slice; see `docs/phase12-4-1-operators.md`.

## Consolidation changes

- Course overview states now prefer persisted lesson progress and retain the static map only as a failure fallback.
- Completed implemented lessons remain semantic links so learners can revisit them.
- A partially completed module stays expanded even when the last-opened lesson is already complete.
- The course mastery summary uses the same resolved lesson states as the curriculum list.
- Guided Practice remains balanced at six deterministic exercises per active topic: two predict, two fix, and two write.
- Thinking Lab keeps all seven reasoning modes across the full bank; individual lessons do not need identical activity patterns.
- Sandbox adds a compact Data Types starter and distinguishes the simple conditional starter from the input-driven conditional starter.
- Existing mastery concept names remain unchanged to protect persisted evidence.

## Future curriculum context

Programming Fundamentals with Python, Web Client Development, Software Development Fundamentals, and Software Development Lifecycle may later map to broader learning modules. They do not replace or rename the official semester courses in this phase. Broader curriculum organization belongs to Phase 13.

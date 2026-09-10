# Phase 8F — Adaptive Learning v1

Phase 8F adapts teaching support, not curriculum progression.

## Purpose and product philosophy

Mastery is evidence, not truth. Robin can offer more concrete help or a shorter reminder without telling the learner they are weak, scored, or permanently proficient. Current success must never be undermined by older struggles. Difficulty must never lock content. No lesson order, activity, progression rule, mastery threshold, schema, or provider configuration changes in this phase.

## Architecture

Concept mastery → explicit relevance mapping → pure deterministic policy → teaching guidance → existing assistance.

- `lib/adaptation/policy.ts`: pure policy; accepts concept/state pairs and relevant concepts, with an optional server-graded current answer. It does not know semesters, courses, databases, users, or providers.
- `lib/adaptation/relevance.ts`: reviewed lesson-scoped mappings. No model selects database keys.
- `lib/adaptation/server.ts`: server-only, best-effort mastery loading using the existing local-development access restriction. No memory operations.
- `lib/adaptation/check-support.ts`: deterministic bilingual feedback support after Robin Check evaluation.

Before this phase, normal chat included raw concept mastery labels. Smart Feedback and Robin Check recorded evidence but did not adapt help. Chat now uses teaching guidance instead of the old raw context; it does not include both. The older mastery-context helper remains for compatibility but has no chat caller.

## Adaptation policy

| Evidence state | Teaching behavior |
| --- | --- |
| UNSEEN / absent | Default teaching; no historical guidance or assumptions. |
| SHAKY | Concrete scaffolding: one small example, explicit mental model, one reasoning step at a time. No long repeat lecture. |
| DEVELOPING | Moderate scaffolding: short reinforcement and one reasoning step when useful. |
| STRONG | Light scaffolding: concise reminder, connection to the current problem, room for reasoning. Full explanations remain available. |

Mixed states produce separate guidance per relevant concept, in the mapping's order. There is no global learner score. Duplicate concepts are removed. Unrelated concepts are excluded from the model context.

## Relevance mapping

The current reviewed mappings are scoped to the Variables lesson:

| Interaction / topic | Relevant concepts |
| --- | --- |
| Reading a name / named values | variable, name_binding |
| Reassignment prediction / practice | reassignment, variable, name_binding |
| Assignment | assignment, name_binding, variable |
| Name binding | name_binding, variable, assignment |
| Robin Check (`x = 5`) | assignment, name_binding, variable |

Chat uses explicit topic phrases in the latest message: reassignment/reassign/assignment ulang/assign ulang, name binding/binding nama, assignment/penugasan variabel, or variable/variabel. More specific phrases win. A greeting, unrelated networking question, or ambiguous “still confused” gets no adaptation context and causes no adaptation storage read. History is not mined for concept keys. Unknown lessons/topics fall back to neutral behavior.

## Precedence

Current learner evidence > current activity context > mastery evidence > broader memory/context.

For objective answers, the server's correctness decision overrides the tested concept's historical policy: a current mistake gets concrete targeted help even after STRONG; current success gets concise conceptual confirmation even after SHAKY. Existing Smart Feedback rules still forbid remedial follow-ups for correct answers. Supporting concepts may receive different guidance, but cannot override the current result. Accuracy and the original response schema always apply.

## Smart Feedback integration

The route validates the request and attempt ID, reconstructs the activity, deterministically grades, and records evidence before inference. It then loads scoped guidance and inserts one private system message when applicable. The request still contains only `model` and `messages`. The original answer, activity context, misconception, output parser, and frontend lifecycle remain intact. Adaptation creates no additional request or evidence event.

## Robin Check integration

Evaluation and adaptation are separate by construction, not just a prompt instruction:

1. The existing evaluator receives the original rubric, lesson context, and current explanation only. No mastery or adaptation enters this call.
2. The response is validated; its original signal produces the unchanged Phase 8E evidence weights.
3. Relevant mastery is loaded and a small deterministic hint may be appended to `feedback`.

Signal, recognized concepts, misconceptions, and recommended action cannot be changed by the feedback adapter. Current STRONG receives no extra reteaching. Current SHAKY keeps concrete help even if history was STRONG. Other results use concrete support when relevant history warrants it, otherwise one reasoning prompt. Hints target current misconceptions first and use the selected ID/EN lesson language. There is no second model call. If the combined text would exceed the existing 1200-character limit, the original feedback is retained.

## Robin Chat integration

The existing raw mastery message is replaced with actionable guidance only when the latest message maps to a reviewed topic. Bounded history, lesson grounding, provider, personality, and memory commands are unchanged. Persistent memory remains its own context message and its own table; the adaptation loader only reads Concept Mastery.

## Source Mode

No frontend behavior changes. Source Mode still prevents Smart Feedback and Robin Check requests and cancels pending requests. Deterministic lesson interactions and the mastery display remain usable. The adaptation layer has no timers, effects, frontend imports, or independent AI requests. It runs only inside existing server request paths. Source Mode is a UI behavior, not an authorization boundary for directly calling endpoints.

## Failure behavior

Missing/unavailable mastery produces neutral historical guidance. Access failures, invalid data, or policy exceptions return an empty policy/context. Current server grading remains authoritative even without stored mastery. Feedback evaluation failures retain the existing sanitized browser error; recorded objective evidence is not rolled back. Robin Check support failures retain the original evaluation. No credentials, raw database errors, or learner profile are logged by adaptation.

## Privacy and limitations

- Internal mastery labels, scaffolding levels, and prompts are not returned as API fields. Chat/Smart Feedback prompts instruct Robin not to expose them; model compliance is not a security guarantee.
- Only relevant concept guidance reaches the provider, not the whole mastery profile or counters. The existing mastery summary query still reads the lesson's six rows server-side before filtering.
- This remains single-user local/personal development architecture. Authentication and per-user authorization are required before public deployment; this phase does not add them.
- Chat matching is deliberately conservative and lexical, not a complete intent classifier. Ambiguous follow-ups get default teaching; explicit keywords can have unrelated meanings.
- Robin Check hints use the selected lesson language; the original AI evaluation can follow the answer's language. Mixed-language answers can therefore produce mixed-language feedback.
- Existing storage deduplication and concurrent-write limitations are unchanged. No schema migration is needed.
- Support wording from AI is still probabilistic. The policy and Check hint selection are deterministic, not a guarantee of learning outcomes.
- Loading mastery adds an existing bounded database read; no extra inference call is added.

## Future curriculum compatibility

The intended hierarchy remains Curriculum → Semester → Course → Module → Lesson → Concept / Mastery, eventually following Cakrawala University's official CS curriculum. The generic policy accepts concept keys and states, while reviewed mappings are scoped by lesson. New lessons can add reviewed mappings without assuming Variables is the only lesson forever. Existing Variables-specific routes and storage identifiers remain v1 constraints; globally unique curriculum-aware identifiers can be addressed when that architecture is actually built. This phase creates no semester navigation, prerequisite graph, recommendation engine, or adaptive curriculum.

## Verification and manual checks

Automated coverage includes all four states, mixed relevance, current-answer precedence, storage/policy failure, real route integration with simulated services, evaluator independence, separate memory context, unrelated chat, and existing Source Mode/lifecycle tests. No live provider or database mutation is required for automated tests.

Locally, use existing evidence rather than editing mastery rows: try a reassignment question, submit a wrong objective answer, then a corrected answer. Check that help targets the current answer and never labels the learner. Toggle ID/EN and Previous/Next without a new feedback request. Explain `x = 5` in Robin Check; verify natural support and unchanged signal/action behavior. Enable Source Mode and confirm no feedback/check requests. Ask an unrelated chat question and confirm a normal response. No steps should be skipped, locked, or reordered.

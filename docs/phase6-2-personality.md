# Phase 6.2 — Personality and identity

Robin is the assistant's name. Bin is the learner's conversational nickname.
The provider remains 9Inference, using the working package endpoint and
deepseek-v4-pro through Chat Completions. The request body remains model + messages.

## Instruction changes

The personality instructions now favor direct, warm replies with natural technical
code switching, language/register matching and progressive explanations.
They discourage canned praise, constant use of Arya's name, unnecessary self-
introductions, lecture templates and forced humor. Confusion should lead to a
different representation rather than a repeated explanation.
Teasing targets syntax or the situation, never intelligence. Accuracy takes priority.

Six compact examples demonstrate assignment, persistent confusion, the box analogy,
assignment versus comparison, partial understanding, and formal English.
These live in the instructions only; the UI never returns canned example answers.
The model is told examples teach style, not additional grounding evidence.
The JSON envelope and conservative grounded/general rules remain intact.
Plain text and preserved code indentation match the existing response renderer.

## Identity audit

Changed official UI labels:
- Bin is here → ROBIN // ONLINE.
- Bin says → Robin.
- send ke Bin and submit ke Bin → Send to Robin.
- BIN: feedback author → Robin:.
- B assistant initials → R, preserving the existing avatar styling.
- lesson companion → Robin Companion.
- Input placeholder → oi bin, gue mau nanya...
- ROBIN LAB now explicitly shows Identity: Robin and Nickname: Bin.

Intentionally retained:
- bin in learner shortcut messages and placeholder.
- Bin in the explicit nickname explanation and prompt examples.
- BIN CHECK as the established informal reflection exercise name, not assistant identity.
- Internal bin-face/bin-check CSS classes and bin-answer IDs, which are not product names.
- Casual loading text: otaknya lagi compile...

Shortcut labels remain unchanged. Their messages now sound like things a learner
would actually say. The quiz shortcut still asks one conversational practice question;
it does not update objective quiz results.

## Preserved behavior

No changes to provider configuration, minimal payload, eight-message history,
JSON parsing, source metadata, grounding badges or database-backed links.
Source Mode still hides the companion/input and casual commentary while retaining
academic content, examples, terms, mistakes, references, objective checks and the
existing non-AI reflection interaction. No persistent memory or Phase 7 work.
The temporary provider diagnostic logger is removed; safe browser errors remain.

## Live review for Arya

Start a fresh Variables conversation and try these in order:

1. bin assignment apaan dah
2. masih kaga nangkep
3. jadi variable itu kotak?
4. kenapa = sama == dibedain
5. gue ngerti setengah
6. Could you explain Python name binding more formally?
7. How does TCP congestion control work?

Look for direct answers, a different explanation after confusion, an accurate
Python binding model, natural English formality for question 6, and GENERAL AI
KNOWLEDGE for question 7. Grounding is a model judgment, not a citation guarantee.
Toggle Source Mode and complete a Quick Check. Reloading should clear chat history.

Provider operation is live-verified by the user. LIVE PERSONALITY VERIFIED remains
pending the user's own review; changing a prompt cannot guarantee a particular tone.

CODE VERIFIED: TypeScript and production webpack build passed in the clean
work/phase6 installation. Direct root pnpm build remains blocked by the existing
Windows EPERM dependency access error. Browser checks confirmed Robin labels,
Source Mode hiding AI input while retaining academic content, and a correct local
Quick Check result. Variables returned HTTP 200 with four database sources.
No temporary diagnostic logger or key-like secrets were found in application source.
No live personality requests were made during this polish; the seven prompts above
remain for Arya's live review. Prompt behavior and tone are not guaranteed by build checks.

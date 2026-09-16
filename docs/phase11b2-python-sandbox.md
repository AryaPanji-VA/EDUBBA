# Phase 11B.2 — Beginner Python Sandbox

## Runtime architecture

The Sandbox runs pinned Pyodide `v314.0.7` inside a browser module Web Worker.
The worker is created only after the learner presses **Run**, so opening Guided
Practice or the Sandbox route does not download the Python runtime immediately.
No Python code is sent to or executed by the Next.js server.

The worker is reused between normal runs, while each script receives a clean
Python globals dictionary. Standard output and standard error are captured with
Pyodide's `setStdout` and `setStderr` handlers. Python exceptions return their
real error type/message and traceback from `main.py` without crashing React.

## Interactive input

`input()` is replaced inside the isolated Python runtime with a small controlled
bridge. Pyodide's `run_sync()` pauses the synchronous Python call while a
Promise asks the React UI for one text value. Submitting the in-app form resolves
that request and Python continues normally, so `int(input(...))` and
`float(input(...))` remain real Python conversions. Each call receives a unique
request ID, allowing multiple sequential prompts while ignoring stale responses
from an older run.

Interactive values live only in React and the active worker. They are not added
to draft storage, Learning Log, mastery evidence, or server requests.

## Beginner safety boundary

- One execution at a time; Run is disabled while loading or running.
- A five-second active-computation timer terminates and discards the worker,
  including an accidental infinite loop. The timer pauses while the learner is
  answering an input request and restarts after each submission. The following
  run creates a fresh worker.
- Output is capped at 50,000 characters.
- Imports and dynamic `__import__` calls are rejected in this beginner phase.
- There is no package UI, pip, server execution, shell, terminal, mounted native
  filesystem, environment-variable UI, or exposed application credential.

This is an educational browser runtime, not a hardened hostile-code security
sandbox. Authentication, shared execution, and untrusted multi-user code are
outside Phase 11B.2.

The synchronous-to-asynchronous input bridge depends on WebAssembly JavaScript
Promise Integration (JSPI), so interactive `input()` requires a current browser
with JSPI support. Ordinary Sandbox programs continue to use the same Pyodide
worker path.

## Drafts and Guided Practice handoff

The current code, selected starter, and update timestamp are validated and kept
in browser `localStorage`. Runtime state and output are transient. No database
migration is needed, and Sandbox runs never create mastery evidence.

Guided Practice can place a bounded, validated exercise starter in
`sessionStorage` before navigating to `/practice/python/sandbox`. The Sandbox
consumes that one-time handoff, then continues normal local draft persistence.

## Deliberately deferred

- Logic & Computational Thinking Lab
- deeper Robin actions such as explain-code and explain-error
- packages/imports and advanced Python environments
- multiple files, terminal, debugger, autocomplete, Git, or deployment
- Learning Log and mastery awards for free-form Sandbox activity

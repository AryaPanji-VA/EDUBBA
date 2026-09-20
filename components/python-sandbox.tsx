"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { TopBar } from "@/components/top-bar";
import { PracticeModeNav } from "@/components/practice-mode-nav";
import { PracticeAssist } from "@/components/practice-assist";
import { pythonStarters } from "@/content/sandbox/python-starters";
import {
  createSandboxDraft, deserializeSandboxDraft, resetSandboxDraft,
  SANDBOX_DRAFT_STORAGE_KEY, serializeSandboxDraft, updateSandboxDraft,
  type SandboxDraft,
} from "@/lib/sandbox/draft";
import {
  deserializeSandboxHandoff, SANDBOX_HANDOFF_STORAGE_KEY,
} from "@/lib/sandbox/handoff";
import {
  acceptSandboxStdinRequest, createSandboxStdinResponse, isSandboxRunResult,
  type SandboxRunResult, type SandboxRuntimeStatus, type SandboxStdinRequest,
} from "@/lib/sandbox/runtime";
import { useUiCopy } from "@/lib/i18n/language-provider";
import type { SandboxRuntimeStatus as RuntimeStatus } from "@/lib/sandbox/runtime";

// Runtime status chrome follows the product language (Settings → Language);
// the lib label stays for tooling/tests.
function runtimeLabel(status: RuntimeStatus, copy: Record<string, string>): string {
  if (status === "loading") return copy["sbox.status.loading"];
  if (status === "running") return copy["sbox.status.running"];
  if (status === "waiting-input") return copy["sbox.status.waiting"];
  if (status === "ready") return copy["sbox.status.ready"];
  if (status === "error") return copy["sbox.status.error"];
  return copy["sbox.status.idle"];
}

const EXECUTION_LIMIT_MS = 5_000;

type PendingRun = {
  id: string;
  resolve: (result: SandboxRunResult) => void;
  reject: (error: Error) => void;
  timeoutId: number | null;
};

export function PythonSandbox() {
  const copy = useUiCopy();
  const [draft, setDraft] = useState<SandboxDraft>(() => createSandboxDraft());
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftWarning, setDraftWarning] = useState<string | null>(null);
  const [runtimeStatus, setRuntimeStatus] = useState<SandboxRuntimeStatus>("idle");
  const [result, setResult] = useState<SandboxRunResult | null>(null);
  const [stdinRequest, setStdinRequest] = useState<SandboxStdinRequest | null>(null);
  const [stdinValue, setStdinValue] = useState("");
  const workerRef = useRef<Worker | null>(null);
  const readyRef = useRef(false);
  const draftInitializationRef = useRef(false);
  const initializationRef = useRef<Promise<Worker> | null>(null);
  const pendingRef = useRef<PendingRun | null>(null);
  const stdinRequestRef = useRef<SandboxStdinRequest | null>(null);

  useEffect(() => {
    if (draftInitializationRef.current) return;
    draftInitializationRef.current = true;
    let next = createSandboxDraft();
    try {
      next = deserializeSandboxDraft(window.localStorage.getItem(SANDBOX_DRAFT_STORAGE_KEY)) ?? next;
      const handoff = deserializeSandboxHandoff(window.sessionStorage.getItem(SANDBOX_HANDOFF_STORAGE_KEY));
      if (handoff) {
        next = { code: handoff.code, starterId: null, updatedAt: handoff.createdAt };
        window.sessionStorage.removeItem(SANDBOX_HANDOFF_STORAGE_KEY);
      }
    } catch {
      setDraftWarning(copy["sbox.warnUnavailable"]);
    }
    setDraft(next);
    setDraftLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-time copy only
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    try {
      window.localStorage.setItem(SANDBOX_DRAFT_STORAGE_KEY, serializeSandboxDraft(draft));
      setDraftWarning(null);
    } catch {
      setDraftWarning(copy["sbox.warnCantSave"]);
    }
  }, [draft, draftLoaded, copy]);

  useEffect(() => () => {
    const pending = pendingRef.current;
    if (pending?.timeoutId !== null && pending?.timeoutId !== undefined) window.clearTimeout(pending.timeoutId);
    pending?.reject(new DOMException("Sandbox closed.", "AbortError"));
    pendingRef.current = null;
    stdinRequestRef.current = null;
    workerRef.current?.terminate();
  }, []);

  function disposeWorker() {
    workerRef.current?.terminate();
    workerRef.current = null;
    readyRef.current = false;
    initializationRef.current = null;
  }

  function clearStdinRequest() {
    stdinRequestRef.current = null;
    setStdinRequest(null);
    setStdinValue("");
  }

  function armExecutionTimeout(pending: PendingRun) {
    if (pending.timeoutId !== null) window.clearTimeout(pending.timeoutId);
    pending.timeoutId = window.setTimeout(() => {
      if (pendingRef.current !== pending) return;
      pendingRef.current = null;
      clearStdinRequest();
      disposeWorker();
      pending.reject(new Error("Execution stopped after 5 seconds. Check for an infinite loop, then try again."));
    }, EXECUTION_LIMIT_MS);
  }

  function cancelActiveExecution() {
    const pending = pendingRef.current;
    if (!pending) return false;
    if (pending.timeoutId !== null) window.clearTimeout(pending.timeoutId);
    pendingRef.current = null;
    clearStdinRequest();
    disposeWorker();
    pending.reject(new DOMException("Execution cancelled.", "AbortError"));
    return true;
  }

  function ensureWorker(): Promise<Worker> {
    if (workerRef.current && readyRef.current) return Promise.resolve(workerRef.current);
    if (initializationRef.current) return initializationRef.current;

    setRuntimeStatus("loading");
    const worker = new Worker("/workers/python-sandbox.mjs", { type: "module" });
    workerRef.current = worker;
    const initialization = new Promise<Worker>((resolve, reject) => {
      worker.onmessage = (event: MessageEvent<unknown>) => {
        const message = event.data as { type?: unknown; error?: unknown };
        if (message?.type === "ready") {
          readyRef.current = true;
          setRuntimeStatus("ready");
          resolve(worker);
          return;
        }
        if (message?.type === "init-error") {
          const error = new Error(typeof message.error === "string" ? message.error : copy["sbox.errRuntimeLoad"]);
          reject(error);
          disposeWorker();
          setRuntimeStatus("error");
          return;
        }
        const pending = pendingRef.current;
        const stdin = pending ? acceptSandboxStdinRequest(stdinRequestRef.current, message, pending.id) : null;
        if (stdin && pending) {
          if (pending.timeoutId !== null) window.clearTimeout(pending.timeoutId);
          pending.timeoutId = null;
          stdinRequestRef.current = stdin;
          setStdinRequest(stdin);
          setStdinValue("");
          setRuntimeStatus("waiting-input");
          return;
        }
        if (isSandboxRunResult(message) && pendingRef.current?.id === message.id) {
          const pending = pendingRef.current;
          pendingRef.current = null;
          if (pending.timeoutId !== null) window.clearTimeout(pending.timeoutId);
          clearStdinRequest();
          pending.resolve(message);
        }
      };
      worker.onerror = () => {
        const error = new Error(copy["sbox.errRuntimeLoadNet"]);
        if (pendingRef.current) {
          if (pendingRef.current.timeoutId !== null) window.clearTimeout(pendingRef.current.timeoutId);
          pendingRef.current.reject(error);
          pendingRef.current = null;
        }
        clearStdinRequest();
        reject(error);
        disposeWorker();
        setRuntimeStatus("error");
      };
    });
    initializationRef.current = initialization;
    return initialization;
  }

  async function runCode() {
    if (!draft.code.trim() || runtimeStatus === "loading" || runtimeStatus === "running") return;
    setResult(null);
    try {
      const worker = await ensureWorker();
      setRuntimeStatus("running");
      const id = crypto.randomUUID();
      const runResult = await new Promise<SandboxRunResult>((resolve, reject) => {
        const pending = { id, resolve, reject, timeoutId: null };
        pendingRef.current = pending;
        armExecutionTimeout(pending);
        worker.postMessage({ type: "run", id, code: draft.code });
      });
      setResult(runResult);
      setRuntimeStatus("ready");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setResult({
        type: "result",
        id: "runtime-error",
        stdout: "",
        stderr: "",
        error: error instanceof Error ? error.message : copy["sbox.errRuntimeUse"],
      });
      setRuntimeStatus("error");
    }
  }

  function chooseStarter(starterId: string) {
    setDraft(createSandboxDraft(starterId));
    setResult(null);
  }

  function resetEditor() {
    const cancelled = cancelActiveExecution();
    setDraft((current) => resetSandboxDraft(current));
    setResult(null);
    if (cancelled) setRuntimeStatus("idle");
  }

  function submitStdin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request = stdinRequestRef.current;
    const pending = pendingRef.current;
    const worker = workerRef.current;
    if (!request || !pending || !worker || request.runId !== pending.id) return;
    worker.postMessage(createSandboxStdinResponse(request, stdinValue));
    clearStdinRequest();
    setRuntimeStatus("running");
    armExecutionTimeout(pending);
  }

  const outputText = result
    ? [result.stdout, result.stderr, result.error].filter(Boolean).join("\n") || copy["sbox.ranNoOutput"]
    : copy["sbox.noOutputYet"];

  return (
    <AppShell active="practice">
      <TopBar breadcrumb={<><Link href="/practice">Practice</Link><span className="sep">/</span><Link href="/practice/python">Python</Link><span className="sep">/</span><b>Sandbox</b></>} />
      <div className="content">
        <header className="page-header sandbox-header">
          <div>
            <span className="eyebrow">{copy["sbox.eyebrow"]}</span>
            <h1>{copy["sbox.title"]}</h1>
            <p>{copy["sbox.sub"]}</p>
          </div>
        </header>

        <PracticeModeNav active="sandbox" />

        <section className="sandbox-starters" aria-label={copy["sbox.ariaStarters"]}>
          <span className="practice-count">{copy["sbox.startFrom"]}</span>
          <div className="sandbox-starter-list">
            {pythonStarters.map((starter) => (
              <button key={starter.id} type="button" className={draft.starterId === starter.id ? "on" : ""}
                title={starter.description} onClick={() => chooseStarter(starter.id)}>{starter.label}</button>
            ))}
          </div>
        </section>

        <div className="sandbox-grid">
          <section className="panel sandbox-panel" aria-label={copy["sbox.ariaEditor"]}>
            <div className="sandbox-panel-head">
              <div><span className="eyebrow">Editor</span><strong>main.py</strong></div>
              <span className={`sandbox-runtime-status is-${runtimeStatus}`}>{runtimeLabel(runtimeStatus, copy)}</span>
            </div>
            <label className="sr-only" htmlFor="sandbox-code">{copy["sbox.codeLabel"]}</label>
            <textarea id="sandbox-code" className="sandbox-editor" spellCheck={false} autoComplete="off"
              value={draft.code} maxLength={20_000}
              onChange={(event) => setDraft((current) => updateSandboxDraft(current, event.target.value))} />
            <div className="sandbox-actions">
              <button className="button button-primary" type="button" disabled={!draft.code.trim() || runtimeStatus === "loading" || runtimeStatus === "running" || runtimeStatus === "waiting-input"}
                onClick={() => void runCode()}>{runtimeStatus === "loading" ? copy["sbox.loading"] : runtimeStatus === "running" ? copy["sbox.running"] : copy["sbox.run"]}</button>
              <button className="practice-ghost" type="button" disabled={runtimeStatus === "loading"} onClick={resetEditor}>{runtimeStatus === "running" || runtimeStatus === "waiting-input" ? copy["sbox.stopReset"] : copy["sbox.reset"]}</button>
              <span className="sandbox-save-state">{draftWarning ?? (draftLoaded ? copy["sbox.saveState"] : copy["sbox.loadingDraft"])}</span>
            </div>
            {stdinRequest && (
              <form className="sandbox-stdin" onSubmit={submitStdin} aria-label={copy["sbox.ariaInput"]}>
                <span className="eyebrow">{copy["sbox.stdinNeed"]}</span>
                <label htmlFor="sandbox-stdin-value">{stdinRequest.prompt || copy["sbox.stdinFallback"]}</label>
                <div>
                  <input id="sandbox-stdin-value" type="text" value={stdinValue} maxLength={10_000}
                    autoComplete="off" autoFocus onChange={(event) => setStdinValue(event.target.value)} />
                  <button className="button button-primary" type="submit">{copy["sbox.submit"]}</button>
                </div>
                <p>{copy["sbox.stdinNote"]}</p>
              </form>
            )}
          </section>

          <section className="panel sandbox-panel sandbox-output-panel" aria-label={copy["sbox.ariaOutput"]}>
            <div className="sandbox-panel-head"><div><span className="eyebrow">{copy["sbox.resultTag"]}</span><strong>Output</strong></div></div>
            <pre className={`sandbox-output ${result?.error ? "has-error" : ""}`} role="log" aria-live="polite">{outputText}</pre>
            <p className="panel-footnote">{copy["sbox.outputNote"]}</p>
          </section>
        </div>

        <PracticeAssist
          mode="sandbox"
          resetKey="sandbox"
          payload={{ sandboxCode: draft.code, sandboxError: result?.error || result?.stderr || undefined }}
          actions={[
            { action: "explain-code", label: copy["sbox.assistExplainCode"], disabled: !draft.code.trim() },
            { action: "explain-error", label: copy["sbox.assistExplainError"], disabled: !(result && (result.error || result.stderr)) },
            { action: "next-step", label: copy["sbox.assistNextStep"], disabled: !draft.code.trim() },
          ]}
          note={copy["sbox.assistNote"]}
        />
      </div>
    </AppShell>
  );
}

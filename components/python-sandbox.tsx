"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { TopBar } from "@/components/top-bar";
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
  sandboxRuntimeLabel, type SandboxRunResult, type SandboxRuntimeStatus, type SandboxStdinRequest,
} from "@/lib/sandbox/runtime";

const EXECUTION_LIMIT_MS = 5_000;

type PendingRun = {
  id: string;
  resolve: (result: SandboxRunResult) => void;
  reject: (error: Error) => void;
  timeoutId: number | null;
};

export function PythonSandbox() {
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
      setDraftWarning("Draft browser tidak tersedia. Kode tetap bisa dijalankan.");
    }
    setDraft(next);
    setDraftLoaded(true);
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;
    try {
      window.localStorage.setItem(SANDBOX_DRAFT_STORAGE_KEY, serializeSandboxDraft(draft));
      setDraftWarning(null);
    } catch {
      setDraftWarning("Draft belum bisa disimpan di browser ini.");
    }
  }, [draft, draftLoaded]);

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
          const error = new Error(typeof message.error === "string" ? message.error : "Python runtime gagal dimuat.");
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
        const error = new Error("Python runtime gagal dimuat. Periksa koneksi lalu coba lagi.");
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
        error: error instanceof Error ? error.message : "Python runtime gagal digunakan.",
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
    ? [result.stdout, result.stderr, result.error].filter(Boolean).join("\n") || "Program selesai tanpa output."
    : "Belum ada output. Tekan Run saat kodenya siap.";

  return (
    <AppShell active="practice">
      <TopBar breadcrumb={<><Link href="/practice">Practice</Link><span className="sep">/</span><Link href="/practice/python">Python</Link><span className="sep">/</span><b>Sandbox</b></>} />
      <div className="content">
        <header className="page-header sandbox-header">
          <div>
            <span className="eyebrow">Practice Lab · Python Sandbox</span>
            <h1>Coba sendiri. Rusak dikit nggak apa.</h1>
            <p>Tempat kecil buat eksperimen Python dasar. Semuanya jalan di browser—nggak ada server yang mengeksekusi kode lu.</p>
          </div>
          <Link className="btn-g" href="/practice/python">Guided Practice →</Link>
        </header>

        <section className="sandbox-starters" aria-label="Starter snippets">
          <span className="practice-count">Start from</span>
          <div className="sandbox-starter-list">
            {pythonStarters.map((starter) => (
              <button key={starter.id} type="button" className={draft.starterId === starter.id ? "on" : ""}
                title={starter.description} onClick={() => chooseStarter(starter.id)}>{starter.label}</button>
            ))}
          </div>
        </section>

        <div className="sandbox-grid">
          <section className="panel sandbox-panel" aria-label="Python editor">
            <div className="sandbox-panel-head">
              <div><span className="eyebrow">Editor</span><strong>main.py</strong></div>
              <span className={`sandbox-runtime-status is-${runtimeStatus}`}>{sandboxRuntimeLabel(runtimeStatus)}</span>
            </div>
            <label className="sr-only" htmlFor="sandbox-code">Python code</label>
            <textarea id="sandbox-code" className="sandbox-editor" spellCheck={false} autoComplete="off"
              value={draft.code} maxLength={20_000}
              onChange={(event) => setDraft((current) => updateSandboxDraft(current, event.target.value))} />
            <div className="sandbox-actions">
              <button className="button button-primary" type="button" disabled={!draft.code.trim() || runtimeStatus === "loading" || runtimeStatus === "running" || runtimeStatus === "waiting-input"}
                onClick={() => void runCode()}>{runtimeStatus === "loading" ? "Loading Python…" : runtimeStatus === "running" ? "Running…" : "Run"}</button>
              <button className="practice-ghost" type="button" disabled={runtimeStatus === "loading"} onClick={resetEditor}>{runtimeStatus === "running" || runtimeStatus === "waiting-input" ? "Stop & Reset" : "Reset"}</button>
              <span className="sandbox-save-state">{draftWarning ?? (draftLoaded ? "draft saved locally" : "loading draft…")}</span>
            </div>
            {stdinRequest && (
              <form className="sandbox-stdin" onSubmit={submitStdin} aria-label="Python input request">
                <span className="eyebrow">Program needs input</span>
                <label htmlFor="sandbox-stdin-value">{stdinRequest.prompt || "Input value"}</label>
                <div>
                  <input id="sandbox-stdin-value" type="text" value={stdinValue} maxLength={10_000}
                    autoComplete="off" autoFocus onChange={(event) => setStdinValue(event.target.value)} />
                  <button className="button button-primary" type="submit">Submit</button>
                </div>
                <p>Nilai dikirim sebagai teks. Python yang menangani konversinya.</p>
              </form>
            )}
          </section>

          <section className="panel sandbox-panel sandbox-output-panel" aria-label="Python output">
            <div className="sandbox-panel-head"><div><span className="eyebrow">Result</span><strong>Output</strong></div></div>
            <pre className={`sandbox-output ${result?.error ? "has-error" : ""}`} role="log" aria-live="polite">{outputText}</pre>
            <p className="panel-footnote">Runs stop after 5 seconds. Imports, packages, network tools, shell, and files are disabled in this beginner sandbox.</p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

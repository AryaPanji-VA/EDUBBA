"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, LogPreview, RobinReply, RobinState } from "@/lib/robin/types";
import { toRobinProfileContext } from "@/lib/profile/local-profile";
import { useLocalProfile } from "@/lib/profile/use-local-profile";
import { useLanguage, useUiCopy } from "@/lib/i18n/language-provider";
import type { UiLanguage } from "@/lib/i18n/ui-copy";

// Robin stays casual, friendly, and campus-safe. Quick prompts are UI chrome
// and follow the product language; the payload wording keeps Robin's tone.
// No rude/degrading language is allowed anywhere in these prompts.
const shortcutsByLanguage: Record<UiLanguage, { label: string; message: string }[]> = {
  id: [
    { label: "Jelasin lebih sederhana", message: "bin, jelasin yang ini lebih simpel dong. mulai dari intinya dulu." },
    { label: "Kasih analogi", message: "bin, kasih analogi lain biar kebayang." },
    { label: "Kasih contoh kode", message: "kasih satu contoh kode kecil dong, terus tunjukin jalannya." },
    { label: "Gue ngerti setengah", message: "gue ngerti setengah, bin. bantu cari bagian yang masih ketuker." },
    { label: "Quiz gue", message: "quiz gue satu soal Variables dong. tahan jawabannya dulu." },
    { label: "Catat pembelajaran", message: "catat apa yang gue pelajarin hari ini" },
  ],
  en: [
    { label: "Explain it simpler", message: "hey Robin, explain this one more simply — start from the core idea." },
    { label: "Give an analogy", message: "Robin, give me another analogy so I can picture it." },
    { label: "Show a code example", message: "give me one small code example and walk through what it does." },
    { label: "I half get it", message: "I half get it, Robin — help me find the part I'm still mixing up." },
    { label: "Quiz me", message: "quiz me with one question on Variables. hold the answer back first." },
    { label: "Save what I learned", message: "save what I learned today" },
  ],
};

type DisplayMessage = ChatMessage & { result?: RobinReply };
type Props = {
  lessonSlug: string;
  sourceMode: boolean;
  onStateChange: (state: RobinState) => void;
};

export function RobinCompanion({ lessonSlug, sourceMode, onStateChange }: Props) {
  const { profile } = useLocalProfile();
  const copy = useUiCopy();
  const { language } = useLanguage();
  const shortcuts = shortcutsByLanguage[language];
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState<RobinState>("idle");
  const [error, setError] = useState("");
  const [memoryNotice, setMemoryNotice] = useState("");
  const [activePreview, setActivePreview] = useState<LogPreview | null>(null);
  const [editingPreview, setEditingPreview] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [logStatus, setLogStatus] = useState<{ kind: "idle" | "saving" | "saved" | "skipped"; text: string }>({ kind: "idle", text: "" });
  const controller = useRef<AbortController | null>(null);
  const conversation = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sourceMode) {
      controller.current?.abort();
      controller.current = null;
      setState("idle");
    }
  }, [sourceMode]);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    const element = conversation.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, state]);

  async function sendMessage(message: string) {
    if (sourceMode || controller.current || !message.trim()) return;
    const requestController = new AbortController();
    controller.current = requestController;
    setState("thinking");
    onStateChange("thinking");
    setError("");
    setMemoryNotice("");
    setLogStatus({ kind: "idle", text: "" });
    const timeout = window.setTimeout(() => requestController.abort(), 45_000);
    try {
      const response = await fetch("/api/robin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonSlug, message: message.trim(),
          history: messages.slice(-8).map(({ role, content }) => ({ role, content })),
          profileContext: toRobinProfileContext(profile),
        }),
        signal: requestController.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : copy["robin.errorGeneric"]);
      if (typeof data.reply !== "string" || !data.reply.trim() ||
        !["grounded", "general"].includes(data.grounding?.status) ||
        data.grounding?.lesson !== lessonSlug || !Number.isInteger(data.sourceCount)) {
        throw new Error(copy["robin.errorUnreadable"]);
      }
      if (controller.current !== requestController) return;
      if (["saved", "updated", "deleted"].includes(data.memoryAction?.type)) {
        setMemoryNotice(`MEMORY ${data.memoryAction.type === "deleted" ? "FORGOTTEN" : data.memoryAction.type.toUpperCase()}`);
      }
      setMessages((current) => [...current,
        { role: "user" as const, content: message.trim() },
        { role: "assistant" as const, content: data.reply, result: data as RobinReply },
      ].slice(-8));
      setDraft("");
      // If Robin returned a learning-log preview, surface it for Save/Edit/Skip.
      if (data.logPreview && typeof data.logPreview.summary === "string") {
        setActivePreview(data.logPreview as LogPreview);
        setEditedSummary(data.logPreview.summary);
        setEditingPreview(false);
      }
      setState("success");
      onStateChange("success");
    } catch (failure) {
      if (controller.current !== requestController) return;
      setDraft(message);
      setError(requestController.signal.aborted
        ? copy["robin.errorTimeout"]
        : failure instanceof Error ? failure.message : copy["robin.errorOffline"]);
      setState("error");
      onStateChange("error");
    } finally {
      clearTimeout(timeout);
      if (controller.current === requestController) controller.current = null;
    }
  }

  async function savePreview(preview: LogPreview) {
    setLogStatus({ kind: "saving", text: copy["companion.savingLog"] });
    try {
      const response = await fetch("/api/learning/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: preview.courseSlug,
          lessonSlug: preview.lessonSlug,
          summary: preview.summary,
          conceptsLearned: preview.conceptsLearned,
          weakConcepts: preview.weakConcepts,
          nextStep: preview.nextStep,
        }),
      });
      if (!response.ok) throw new Error(copy["companion.logFailed"]);
      setLogStatus({ kind: "saved", text: copy["companion.logSaved"] });
      setActivePreview(null);
      setEditingPreview(false);
    } catch {
      setLogStatus({ kind: "idle", text: copy["companion.logFailed"] });
    }
  }

  // Stay mounted to retain this page's conversation, but expose no AI controls in Source Mode.
  if (sourceMode) return null;
  return (
    <aside className="robin-panel" aria-label={copy["companion.ask"]}>
      <div className="robin-panel-head">
        <div className="robin-identity"><span className="bin-face">R</span><span><strong>Robin</strong><small><i /> Robin Companion</small></span></div>
        <span className="mock-badge">AI v1</span>
      </div>
      <div className="robin-conversation" ref={conversation} aria-live="polite" aria-busy={state === "thinking"}>
        {!messages.length && <div className="robin-message"><span className="message-label">{copy["companion.online"]}</span><p>{copy["companion.intro"]}</p></div>}
        {messages.map((message, index) => (
          <div className={`robin-message chat-${message.role}`} key={index}>
            <span className="message-label">{message.role === "user" ? profile.preferredName : "Robin"}</span>
            <p>{message.content}</p>
            {message.result && <div className={`grounding-badge ${message.result.grounding.status}`}>
              <span>{message.result.grounding.status === "grounded" ? copy["companion.grounded"] : copy["companion.general"]}</span>
              {message.result.grounding.status === "grounded" && <small>{message.result.sourceCount} {copy["companion.sources"]}</small>}
            </div>}
          </div>
        ))}
        {state === "thinking" && <div className="robin-message typing-state"><span className="typing-dots"><i /><i /><i /></span><small>{copy["companion.thinking"]}</small></div>}
      </div>
      {error && <p className="robin-error" role="alert">{error}</p>}
      {memoryNotice && <p className="panel-footnote" role="status">{memoryNotice}</p>}
      {activePreview && (
        <div className="log-preview" role="region" aria-label="Learning log preview">
          <span className="message-label">LEARNING LOG // PREVIEW</span>
          {editingPreview ? (
            <textarea
              className="log-edit"
              rows={4}
              maxLength={2000}
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
            />
          ) : (
            <p>{activePreview.summary}</p>
          )}
          {activePreview.conceptsLearned.length > 0 && (
            <div className="log-chips">
              {activePreview.conceptsLearned.map((c) => <span key={c} className="log-chip ok">{c}</span>)}
            </div>
          )}
          {activePreview.weakConcepts.length > 0 && (
            <div className="log-chips">
              {activePreview.weakConcepts.map((c) => <span key={c} className="log-chip weak">{c}</span>)}
            </div>
          )}
          {activePreview.nextStep && <p className="log-next">{copy["companion.next"]} {activePreview.nextStep}</p>}
          <div className="companion-actions companion-actions-flush">
            {editingPreview ? (
              <button
                disabled={logStatus.kind === "saving"}
                onClick={() => { setActivePreview({ ...activePreview, summary: editedSummary.trim() }); setEditingPreview(false); }}
              >{copy["companion.applyEdit"]}</button>
            ) : (
              <>
                <button
                  className="active"
                  disabled={logStatus.kind === "saving"}
                  onClick={() => void savePreview({ ...activePreview, summary: editedSummary.trim() || activePreview.summary })}
                >{logStatus.kind === "saving" ? copy["companion.saving"] : copy["companion.saveLog"]}</button>
                <button
                  disabled={logStatus.kind === "saving"}
                  onClick={() => { setEditingPreview(true); setEditedSummary(activePreview.summary); }}
                >{copy["companion.editSummary"]}</button>
                <button
                  disabled={logStatus.kind === "saving"}
                  onClick={() => { setActivePreview(null); setEditingPreview(false); setLogStatus({ kind: "skipped", text: copy["companion.logSkipped"] }); }}
                >{copy["companion.skip"]}</button>
              </>
            )}
          </div>
          {logStatus.text && <p className="panel-footnote" role="status">{logStatus.text}</p>}
        </div>
      )}
      {logStatus.kind === "skipped" && !activePreview && (
        <p className="panel-footnote" role="status">{logStatus.text}</p>
      )}
      <div className="companion-actions">{shortcuts.map(({ label, message }) =>
        <button key={label} disabled={state === "thinking"} onClick={() => void sendMessage(message)}>{label}</button>
      )}</div>
      <form className="robin-ask" onSubmit={(event) => { event.preventDefault(); void sendMessage(draft); }}>
        <label htmlFor="robin-question">{copy["companion.ask"]}</label>
        <textarea id="robin-question" rows={3} maxLength={2000} value={draft} disabled={state === "thinking"}
          placeholder={copy["companion.placeholder"]} onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault(); void sendMessage(draft);
            }
          }} />
        <button className="button button-primary" disabled={state === "thinking" || !draft.trim()}>{copy["companion.send"]}</button>
      </form>
      <p className="panel-footnote">{copy["companion.footnote"]}</p>
    </aside>
  );
}

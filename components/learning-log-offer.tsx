"use client";

import { useEffect, useRef, useState } from "react";
import type { LogPreview } from "@/lib/robin/types";

type Props = {
  lessonSlug: string;
  onDecision: (decision: "saved" | "skipped") => void | Promise<void>;
};

export function LearningLogOffer({ lessonSlug, onDecision }: Props) {
  const [preview, setPreview] = useState<LogPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const savingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);
    (async () => {
      try {
        const response = await fetch("/api/robin/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonSlug, message: "catat apa yang gue pelajarin hari ini" }),
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || !data.logPreview) throw new Error("Preview unavailable.");
        setPreview(data.logPreview);
        setEditedSummary(data.logPreview.summary);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [lessonSlug, retryKey]);

  async function save() {
    if (!preview || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveFailed(false);
    try {
      const response = await fetch("/api/learning/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: preview.courseSlug,
          lessonSlug: preview.lessonSlug,
          summary: editedSummary.trim() || preview.summary,
          conceptsLearned: preview.conceptsLearned,
          weakConcepts: preview.weakConcepts,
          nextStep: preview.nextStep,
        }),
      });
      if (!response.ok) throw new Error("Save unavailable.");
      await onDecision("saved");
    } catch {
      setSaveFailed(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function skip() {
    if (savingRef.current) return;
    await onDecision("skipped");
  }

  return (
    <div className="log-preview" role="region" aria-label="Learning log offer">
      <span className="message-label">Save this session to Learning Log?</span>
      {loading && <p role="status">Menyiapkan ringkasan sesi…</p>}
      {failed && !preview && <p role="alert">Ringkasan belum bisa dibuat. Coba lagi, atau lewati tanpa menyimpan.</p>}
      {saveFailed && <p role="alert">Learning Log belum tersimpan. Coba Save lagi; preview ini masih aman.</p>}
      {preview && (editing
        ? <textarea className="log-edit" rows={4} maxLength={2000} value={editedSummary} onChange={(event) => setEditedSummary(event.target.value)} />
        : <p>{editedSummary || preview.summary}</p>)}
      {preview?.conceptsLearned.length ? <div className="log-chips">{preview.conceptsLearned.map((concept) => <span key={concept} className="log-chip ok">{concept}</span>)}</div> : null}
      {preview?.weakConcepts.length ? <div className="log-chips">{preview.weakConcepts.map((concept) => <span key={concept} className="log-chip weak">{concept}</span>)}</div> : null}
      {preview?.nextStep && <p className="log-next">Next: {preview.nextStep}</p>}
      <div className="companion-actions companion-actions-flush">
        {preview && (editing
          ? <button onClick={() => setEditing(false)}>Apply edit</button>
          : <>
              <button className="active" disabled={saving} onClick={() => void save()}>{saving ? "Menyimpan…" : "Save log"}</button>
              <button disabled={saving} onClick={() => setEditing(true)}>Edit summary</button>
            </>)}
        {failed && !preview && <button onClick={() => setRetryKey((value) => value + 1)}>Coba lagi</button>}
        <button disabled={saving} onClick={() => void skip()}>Skip</button>
      </div>
    </div>
  );
}

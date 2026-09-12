"use client";

import { useEffect, useRef, useState } from "react";
import { type LessonLanguage } from "@/content/lessons/shared-copy";
import { type CheckEvaluation } from "@/lib/robin/check";

type Props = {
  lessonSlug: string;
  language: LessonLanguage;
  copy: Record<string, string>;
  sourceMode: boolean;
  onCompleteChange: (complete: boolean) => void;
  // Lesson-owned retry reinforcement prompts keyed by misconception; optional.
  reinforcement?: (result: CheckEvaluation, language: LessonLanguage) => string;
};

// Generic fallback when a lesson provides no misconception-specific reinforcement.
function genericReinforcement(result: CheckEvaluation, language: LessonLanguage) {
  const id = language === "id";
  return id
    ? "Coba lengkapi penjelasan kamu dengan ide inti dari lesson ini. Apa yang masih kurang jelas dari feedback di atas?"
    : "Try completing your explanation with the core idea from this lesson. What part of the feedback above is still unclear?";
}

export function RobinCheck({ lessonSlug, language, copy, sourceMode, onCompleteChange, reinforcement = genericReinforcement }: Props) {
  const [answer, setAnswer] = useState("");
  const [retryAnswer, setRetryAnswer] = useState("");
  const [result, setResult] = useState<CheckEvaluation | null>(null);
  const [retryResult, setRetryResult] = useState<CheckEvaluation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const needsRetry = result !== null && result.signal !== "strong";

  useEffect(() => {
    if (sourceMode) {
      controller.current?.abort();
      controller.current = null;
      setBusy(false);
    }
  }, [sourceMode]);
  useEffect(() => () => controller.current?.abort(), []);

  async function submit(retry: boolean) {
    const text = retry ? retryAnswer : answer;
    if (sourceMode || controller.current || !text.trim()) return;
    const requestController = new AbortController();
    controller.current = requestController;
    const timeout = window.setTimeout(() => requestController.abort(), 35_000);
    setBusy(true); setError(false); setSkipped(false); onCompleteChange(false);
    try {
      const response = await fetch("/api/robin/check", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: requestController.signal,
        body: JSON.stringify({ lessonSlug, answer: text, language }),
      });
      if (!response.ok) throw new Error("Check unavailable.");
      const data = await response.json();
      if (controller.current !== requestController) return;
      const evaluation = data.evaluation as CheckEvaluation;
      if (retry) setRetryResult(evaluation); else setResult(evaluation);
      onCompleteChange(retry || evaluation.signal === "strong");
    } catch {
      if (controller.current === requestController) setError(true);
    } finally {
      window.clearTimeout(timeout);
      if (controller.current === requestController) { controller.current = null; setBusy(false); }
    }
  }

  function skip() {
    controller.current?.abort(); controller.current = null;
    setBusy(false); setSkipped(true); setError(false); onCompleteChange(true);
  }

  return <section className="bin-check" aria-label="Robin Check" aria-busy={busy}>
    <div className="bin-check-title"><span className="bin-face large">R</span><div><span className="eyebrow">Robin Check</span><h2>{copy.prompt}</h2></div></div>
    <p>{sourceMode ? copy.sourceCheck : copy.checkIntro}</p>
    <form onSubmit={(event) => { event.preventDefault(); void submit(false); }}>
      <label htmlFor="robin-check-answer">{copy.answerLabel}</label>
      <textarea id="robin-check-answer" value={answer} maxLength={2000} rows={5} disabled={busy || result !== null} placeholder={copy.placeholder} onChange={(event) => { setAnswer(event.target.value); setSkipped(false); onCompleteChange(false); }} />
      <div className="form-footer"><span>{answer.length}/2000 {copy.characters}</span>{!sourceMode && !result && <button className="button button-primary" disabled={busy || !answer.trim()}>{busy ? copy.processing : error ? copy.retry : copy.submit}</button>}</div>
    </form>
    {result && <div className="mock-feedback" role="status"><strong>{copy[result.signal]}</strong><p>{result.feedback}</p></div>}
    {needsRetry && <div>
      <h3>{copy.followup}</h3><p>{reinforcement(result, language)}</p>
      <form onSubmit={(event) => { event.preventDefault(); void submit(true); }}>
        <label htmlFor="robin-check-retry">{copy.answerLabel}</label>
        <textarea id="robin-check-retry" value={retryAnswer} maxLength={2000} rows={4} disabled={busy || retryResult !== null} onChange={(event) => { setRetryAnswer(event.target.value); setSkipped(false); onCompleteChange(false); }} />
        {!sourceMode && !retryResult && <button className="button button-primary" disabled={busy || !retryAnswer.trim()}>{busy ? copy.processing : error ? copy.retry : copy.retrySubmit}</button>}
      </form>
    </div>}
    {retryResult && <div className="mock-feedback" role="status"><strong>{copy[retryResult.signal]}</strong><p>{retryResult.feedback}</p><p>{copy.retryDone}</p></div>}
    {error && <p className="robin-error" role="alert">{copy.unavailable}</p>}
    {skipped && <p role="status">{copy.skipped}</p>}
    {!skipped && !retryResult && result?.signal !== "strong" && <button className="button" type="button" onClick={skip}>{copy.skip}</button>}
    {result && <p className="panel-footnote">{copy.feedbackNote}</p>}
  </section>;
}

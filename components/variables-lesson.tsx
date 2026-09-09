"use client";

import Link from "next/link";
import { LessonActivityRenderer } from "@/components/lesson-activity-renderer";
import { variablesActivities } from "@/content/lessons/programming/variables-activities";
import { type FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import type { DeliveredLesson } from "@/content/lessons/types";
import { RobinCompanion } from "@/components/robin-companion";
import type { RobinState } from "@/lib/robin/types";

type LessonResponse = {
  lesson?: DeliveredLesson;
  error?: string;
};

export function VariablesLesson() {
  const [lesson, setLesson] = useState<DeliveredLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [sourceMode, setSourceMode] = useState(false);
  const [robinState, setRobinState] = useState<RobinState>("idle");
  const [binAnswer, setBinAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [checkComplete, setCheckComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [signalPulse, setSignalPulse] = useState(false);
  const [copiedExample, setCopiedExample] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submittedChecks, setSubmittedChecks] = useState<Record<number, boolean>>({});

  async function loadLesson() {
    setIsLoading(true);
    setRequestError(null);

    try {
      const response = await fetch("/api/lessons/variables");
      const data = await response.json() as LessonResponse;

      if (!response.ok) {
        throw new Error(data.error ?? `Backend returned ${response.status}`);
      }

      if (!data.lesson) {
        throw new Error("Backend returned no lesson data.");
      }

      setLesson(data.lesson);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Lesson request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadLesson();
  }, []);

  function pulseSignal() {
    setSignalPulse(false);
    requestAnimationFrame(() => setSignalPulse(true));
    window.setTimeout(() => setSignalPulse(false), 700);
  }

  function updateRobinState(state: RobinState) {
    setRobinState(state);
    if (state === "success") pulseSignal();
  }

  async function copyCode(title: string, code: string) {
    await navigator.clipboard?.writeText(code);
    setCopiedExample(title);
    window.setTimeout(() => setCopiedExample(null), 1200);
  }

  function chooseAnswer(checkIndex: number, answer: string) {
    setSelectedAnswers((current) => ({ ...current, [checkIndex]: answer }));
    setSubmittedChecks((current) => ({ ...current, [checkIndex]: false }));
  }

  function submitQuickCheck(checkIndex: number) {
    if (!selectedAnswers[checkIndex]) return;
    setSubmittedChecks((current) => ({ ...current, [checkIndex]: true }));
    pulseSignal();
  }

  function submitBinCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setCheckComplete(false);
    setIsChecking(true);
    pulseSignal();
    window.setTimeout(() => {
      setIsChecking(false);
      if (binAnswer.trim().length < 12) {
        setFeedback("Add a little more: what name is used, what does it refer to, and what does assignment do?");
        return;
      }
      setCheckComplete(true);
      setFeedback("Response kept on this page only, not saved to memory or graded by AI. Check whether you explained the name x, the value 5, and the binding created by assignment.");
    }, 620);
  }

  return (
    <AppShell active="lesson" signalMode={sourceMode ? "quiet" : robinState === "error" ? "error" : robinState === "thinking" ? "active" : "calm"} signalPulse={signalPulse}>
      <div className="lesson-topbar">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/courses">Courses</Link><span>/</span><Link href="/courses/programming">CS-101</Link><span>/</span><span>Variables</span></nav>
        <div className="mode-control" role="group" aria-label="Lesson mode">
          <button className={!sourceMode ? "selected" : ""} onClick={() => setSourceMode(false)}>Robin ON</button>
          <button className={sourceMode ? "selected" : ""} onClick={() => { setSourceMode(true); setRobinState("idle"); setSignalPulse(false); }}>Source Mode</button>
        </div>
      </div>

      {isLoading && <div className="course-request-state" role="status"><span className="typing-dots"><i /><i /><i /></span><strong>requesting /api/lessons/variables</strong><small>Metadata, sources, dan lesson body lagi dirakit backend.</small></div>}

      {!isLoading && requestError && <div className="course-request-state is-error" role="alert"><strong>Lesson signal putus.</strong><small>{requestError}</small><button className="button" onClick={() => void loadLesson()}>coba lagi</button></div>}

      {lesson && <div className={`lesson-grid ${sourceMode ? "source-mode" : ""}`}>
        <article className="lesson-article">
          <header className="lesson-title">
            <span className="eyebrow">Module {String(lesson.module.position).padStart(2, "0")} · {lesson.module.title}</span><h1>{lesson.title}</h1>
            <div className="lesson-meta"><span>◷ {lesson.estimatedMinutes} min</span><span>beginner</span><span>structured content</span><span>{lesson.sources.length} verified sources</span></div>
          </header>

          <LessonActivityRenderer activities={variablesActivities} sourceMode={sourceMode} robinCheckComplete={checkComplete} robinCheck={<section className="bin-check">
            <div className="bin-check-title"><span className="bin-face large">R</span><div><span className="eyebrow">Robin Check</span><h2>Jelasin pakai bahasa lu sendiri: apa yang terjadi ketika Python menjalankan <code>x = 5</code>?</h2></div></div>
            <form className={isChecking ? "is-checking" : ""} onSubmit={submitBinCheck}><label htmlFor="bin-answer">Your explanation</label><textarea disabled={isChecking} id="bin-answer" value={binAnswer} onChange={(event) => { setBinAnswer(event.target.value); setCheckComplete(false); setFeedback(""); }} placeholder="variable itu..." rows={5} /><div className="form-footer"><span>{binAnswer.length} characters · kept on this page for now</span><button className="button button-primary" type="submit" disabled={isChecking || !binAnswer.trim()}>{isChecking ? <><span className="typing-dots"><i /><i /><i /></span> checking response</> : "Submit explanation"}</button></div></form>
            {feedback && <p className="mock-feedback" role="status"><strong>Robin:</strong> {feedback}</p>}
          </section>}>
            <details className="activity-supplement"><summary>Academic notes, examples &amp; Quick Checks</summary>
          <section className="lesson-section academic"><span className="section-number">02</span><div><span className="academic-label">Academic explanation</span><h2>Definisi formalnya</h2>{lesson.content.academicExplanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>

          <section className="lesson-section"><span className="section-number">03</span><div className="wide-content"><h2>Lihat assignment bekerja</h2>{lesson.content.codeExamples.map((example) => <div className="lesson-code-example" key={example.title}><div className="code-block"><div className="code-head"><span>{example.language} / {example.title}</span><button type="button" onClick={() => void copyCode(example.title, example.code)}>{copiedExample === example.title ? "COPIED ✓" : "COPY"}</button></div><pre><code>{example.code}</code></pre></div>{example.explanation && <p>{example.explanation}</p>}</div>)}</div></section>

          <section className="two-column-section">
            <div className="lesson-box"><span className="card-kicker">Key terms</span><dl>{lesson.content.keyTerms.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl></div>
            <div className="lesson-box mistakes"><span className="card-kicker">Common mistakes</span>
              <ul>{lesson.content.commonMistakes.map((mistake, index) => <li key={mistake.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{mistake.title}</strong><p>{mistake.explanation}</p></div></li>)}</ul>
            </div>
          </section>

          <div className="quick-check-list">{lesson.content.quickChecks.map((check, checkIndex) => {
            const selectedAnswer = selectedAnswers[checkIndex];
            const isSubmitted = submittedChecks[checkIndex];
            const isCorrect = selectedAnswer === check.answer;

            return <section className="quick-check" key={check.question}><span className="eyebrow">Quick check · {checkIndex + 1} of {lesson.content.quickChecks.length}</span><h2>{check.question}</h2>{check.code && <div className="inline-code"><code>{check.code}</code></div>}<div className="answer-options">{check.options.map((option) => {
              const showCorrect = isSubmitted && option === check.answer;
              const showIncorrect = isSubmitted && option === selectedAnswer && !isCorrect;
              const className = [option === selectedAnswer ? "selected" : "", showCorrect ? "correct" : "", showIncorrect ? "incorrect" : ""].filter(Boolean).join(" ");
              return <button className={className} type="button" onClick={() => chooseAnswer(checkIndex, option)} key={option}>{option}{showCorrect && <span>✓</span>}{showIncorrect && <span>×</span>}</button>;
            })}</div><div className="quick-check-actions"><button className="button" type="button" disabled={!selectedAnswer} onClick={() => submitQuickCheck(checkIndex)}>check answer</button>{isSubmitted && <p className={`answer-note ${isCorrect ? "is-correct" : "is-incorrect"}`}><strong>{isCorrect ? "Correct." : "Belum tepat."}</strong> {check.explanation}</p>}</div></section>;
          })}</div>

            </details>
          </LessonActivityRenderer>

          <details className="references" id="lesson-references"><summary>Sources / References — available at every step</summary><span className="card-kicker">Sources supporting this lesson</span><p className="source-intro">These references support the lesson’s original synthesis; the lesson is not copied from them.</p><ol>{lesson.sources.map((source, index) => <li className="source-item" key={source.url}><span>{String(index + 1).padStart(2, "0")}</span><div><a href={source.url} target="_blank" rel="noreferrer"><strong>{source.title}</strong> ↗</a><div className="source-meta"><span>{source.publisher ?? "Unknown publisher"}</span><span>{source.sourceType}</span></div>{source.relevanceNote && <p>{source.relevanceNote}</p>}</div></li>)}</ol></details>

        </article>

        <RobinCompanion sourceMode={sourceMode} onStateChange={updateRobinState} />
      </div>}
    </AppShell>
  );
}

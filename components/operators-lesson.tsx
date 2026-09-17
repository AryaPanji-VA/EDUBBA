"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { LearningLogOffer } from "@/components/learning-log-offer";
import { LessonActivityRenderer } from "@/components/lesson-activity-renderer";
import { RobinCheck } from "@/components/robin-check";
import { RobinCompanion } from "@/components/robin-companion";
import { TopBar } from "@/components/top-bar";
import { operatorsMasteryConceptLabels, operatorsReinforcement } from "@/content/lessons/programming/operators-lesson-config";
import { getOperatorsActivities, localizeOperatorsContent, operatorsCopy, type LessonLanguage } from "@/content/lessons/programming/operators-localization";
import type { DeliveredLesson } from "@/content/lessons/types";
import { lessonLanguageStorageKey } from "@/content/lessons/variables-localization";
import { useProgress } from "@/lib/progress/use-progress";
import type { RobinState } from "@/lib/robin/types";

type LessonResponse = { lesson?: DeliveredLesson; error?: string };

export function OperatorsLesson() {
  const [lesson, setLesson] = useState<DeliveredLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [sourceMode, setSourceMode] = useState(false);
  const [robinState, setRobinState] = useState<RobinState>("idle");
  const [checkComplete, setCheckComplete] = useState(false);
  const [signalPulse, setSignalPulse] = useState(false);
  const [copiedExample, setCopiedExample] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submittedChecks, setSubmittedChecks] = useState<Record<number, boolean>>({});
  const [showLogOffer, setShowLogOffer] = useState(false);
  const [language, setLanguage] = useState<LessonLanguage>("id");

  const copy = operatorsCopy[language];
  const content = lesson ? localizeOperatorsContent(lesson.content, language) : null;
  const activities = useMemo(() => getOperatorsActivities(language), [language]);
  const progress = useProgress("operators", activities, "programming");

  useEffect(() => {
    if (!progress.isLoaded) return;
    setCheckComplete(progress.robinCheckComplete);
    setShowLogOffer(progress.complete && progress.learningLogStatus === "pending");
  }, [progress.complete, progress.isLoaded, progress.learningLogStatus, progress.robinCheckComplete]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(lessonLanguageStorageKey);
      if (saved === "id" || saved === "en") setLanguage(saved);
    } catch { /* Indonesian remains the safe default. */ }
  }, []);

  function changeLanguage(next: LessonLanguage) {
    setLanguage(next);
    try { localStorage.setItem(lessonLanguageStorageKey, next); } catch { /* Session still works. */ }
  }

  async function loadLesson() {
    setIsLoading(true);
    setRequestError(null);
    try {
      const response = await fetch("/api/lessons/operators");
      const data = await response.json() as LessonResponse;
      if (!response.ok) throw new Error(data.error ?? `Backend returned ${response.status}`);
      if (!data.lesson) throw new Error("Backend returned no lesson data.");
      setLesson(data.lesson);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Lesson request failed.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadLesson(); }, []);

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

  function chooseAnswer(index: number, answer: string) {
    setSelectedAnswers((current) => ({ ...current, [index]: answer }));
    setSubmittedChecks((current) => ({ ...current, [index]: false }));
  }

  function submitQuickCheck(index: number) {
    if (!selectedAnswers[index]) return;
    setSubmittedChecks((current) => ({ ...current, [index]: true }));
    pulseSignal();
  }

  function handleCheckComplete(complete: boolean) {
    setCheckComplete(complete);
    progress.recordRobinCheck(complete);
  }

  async function handleComplete() {
    if (await progress.markComplete()) setShowLogOffer(true);
  }

  async function handleLogDecision(decision: "saved" | "skipped") {
    await progress.markLearningLog(decision);
    setShowLogOffer(false);
  }

  return (
    <AppShell active="lesson" signalMode={sourceMode ? "quiet" : robinState === "error" ? "error" : robinState === "thinking" ? "active" : "calm"} signalPulse={signalPulse}>
      <TopBar
        breadcrumb={<><Link href="/courses">{copy.courses}</Link><span className="sep">/</span><Link href="/courses/programming">CS-101</Link><span className="sep">/</span><b>Operators</b></>}
        contextual={<>
          <div className="switcher" role="group" aria-label={copy.language}>{(["id", "en"] as const).map((value) => <button key={value} type="button" aria-pressed={language === value} className={language === value ? "on" : ""} onClick={() => changeLanguage(value)}>{value.toUpperCase()}</button>)}</div>
          <div className="switcher" role="group" aria-label={copy.mode}>
            <button type="button" className={!sourceMode ? "on" : ""} aria-pressed={!sourceMode} onClick={() => setSourceMode(false)}>Robin</button>
            <button type="button" className={sourceMode ? "on" : ""} aria-pressed={sourceMode} onClick={() => { setSourceMode(true); setRobinState("idle"); setSignalPulse(false); }}>Source</button>
          </div>
        </>}
      />

      <div className="content">
        {isLoading && <div className="course-request-state" role="status"><span className="typing-dots"><i /><i /><i /></span><strong>{copy.loading}</strong><small>{copy.loadingNote}</small></div>}
        {!isLoading && requestError && <div className="course-request-state is-error" role="alert"><strong>{copy.loadError}</strong><button className="button" onClick={() => void loadLesson()}>{copy.retry}</button></div>}

        {lesson && content && <div className={`lesson-grid ${sourceMode ? "source-mode" : ""}`}>
          <article className="lesson-article" lang={language}>
            <header className="lesson-title">
              <span className="eyebrow">{copy.module} {String(lesson.module.position).padStart(2, "0")} · {copy.moduleTitle}</span><h1>{lesson.title}</h1>
              <div className="lesson-meta"><span>◷ {lesson.estimatedMinutes} min</span><span>{copy.beginner}</span><span>{copy.structured}</span><span>{lesson.sources.length} {copy.sources}</span></div>
            </header>

            <LessonActivityRenderer activities={activities} lessonSlug="operators" language={language} copy={copy} masteryConceptLabels={operatorsMasteryConceptLabels} sourceMode={sourceMode} robinCheckComplete={checkComplete} robinCheck={<RobinCheck lessonSlug="operators" language={language} copy={copy} sourceMode={sourceMode} onCompleteChange={handleCheckComplete} reinforcement={operatorsReinforcement} />} progressStep={progress.step} progressComplete={progress.complete} progressLoaded={progress.isLoaded} progressAnswers={progress.answers} completedActivityIds={progress.completedActivityIds} onStepChange={progress.setStep} onAnswerSubmit={progress.recordAnswer} onComplete={handleComplete}>
              <details className="activity-supplement"><summary>{copy.notes}</summary>
                <section className="lesson-section academic"><span className="section-number">02</span><div><span className="academic-label">{copy.academic}</span><h2>{copy.definition}</h2>{content.academicExplanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>
                <section className="lesson-section"><span className="section-number">03</span><div className="wide-content"><h2>{copy.examples}</h2>{content.codeExamples.map((example) => <div className="lesson-code-example" key={example.title}><div className="code-block"><div className="code-head"><span>{example.language} / {example.title}</span><button type="button" onClick={() => void copyCode(example.title, example.code)}>{copiedExample === example.title ? copy.copied : copy.copy}</button></div><pre><code>{example.code}</code></pre></div>{example.explanation && <p>{example.explanation}</p>}</div>)}</div></section>
                <section className="two-column-section">
                  <div className="lesson-box"><span className="card-kicker">{copy.terms}</span><dl>{content.keyTerms.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl></div>
                  <div className="lesson-box mistakes"><span className="card-kicker">{copy.mistakes}</span><ul>{content.commonMistakes.map((mistake, index) => <li key={mistake.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{mistake.title}</strong><p>{mistake.explanation}</p></div></li>)}</ul></div>
                </section>
                <div className="quick-check-list">{content.quickChecks.map((check, index) => {
                  const selected = selectedAnswers[index];
                  const submitted = submittedChecks[index];
                  const correct = selected === check.answer;
                  return <section className="quick-check" key={check.question}><span className="eyebrow">{copy.quickCheck} · {index + 1} {copy.of} {content.quickChecks.length}</span><h2>{check.question}</h2>{check.code && <div className="inline-code"><code>{check.code}</code></div>}<div className="answer-options">{check.options.map((option) => {
                    const showCorrect = submitted && option === check.answer;
                    const showIncorrect = submitted && option === selected && !correct;
                    const className = [option === selected ? "selected" : "", showCorrect ? "correct" : "", showIncorrect ? "incorrect" : ""].filter(Boolean).join(" ");
                    return <button className={className} type="button" onClick={() => chooseAnswer(index, option)} key={option}>{option}{showCorrect && <span>✓</span>}{showIncorrect && <span>×</span>}</button>;
                  })}</div><div className="quick-check-actions"><button className="button" type="button" disabled={!selected} onClick={() => submitQuickCheck(index)}>{copy.check}</button>{submitted && <p className={`answer-note ${correct ? "is-correct" : "is-incorrect"}`}><strong>{correct ? copy.correct : copy.incorrect}</strong> {check.explanation}</p>}</div></section>;
                })}</div>
              </details>
            </LessonActivityRenderer>

            {showLogOffer && <LearningLogOffer lessonSlug="operators" onDecision={handleLogDecision} />}
            <details className="references" id="lesson-references"><summary>{copy.sourceAccess}</summary><span className="card-kicker">{copy.sourceSupport}</span><p className="source-intro">{copy.sourceIntro}</p><ol>{lesson.sources.map((source, index) => <li className="source-item" key={source.url}><span>{String(index + 1).padStart(2, "0")}</span><div><a href={source.url} target="_blank" rel="noreferrer"><strong>{source.title}</strong> ↗</a><div className="source-meta"><span>{source.publisher ?? copy.unknownPublisher}</span><span>{language === "id" ? ({ documentation: "dokumentasi", textbook: "buku teks", course: "materi kuliah", article: "artikel" }[source.sourceType]) : source.sourceType}</span></div>{source.relevanceNote && <p>{source.relevanceNote}</p>}</div></li>)}</ol></details>
          </article>
          <RobinCompanion lessonSlug="operators" sourceMode={sourceMode} onStateChange={updateRobinState} />
        </div>}
      </div>
    </AppShell>
  );
}

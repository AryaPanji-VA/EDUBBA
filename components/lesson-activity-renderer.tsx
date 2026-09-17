"use client";

import { type LessonLanguage } from "@/content/lessons/shared-copy";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { type LessonActivity } from "@/content/lessons/activities";
import { SmartFeedback } from "@/components/smart-feedback";
import { MasterySummary } from "@/components/mastery-summary";
import type { PersistedAnswer } from "@/lib/progress/types";

type Answer = { value: string; submitted: boolean; attemptId?: string };
type Props = {
  activities: LessonActivity[];
  lessonSlug: string;
  language: LessonLanguage;
  copy: Record<string, string>;
  masteryConceptLabels?: Record<string, string>;
  sourceMode: boolean;
  robinCheck: ReactNode;
  robinCheckComplete: boolean;
  children: ReactNode;
  // Phase 11A.5: progress persistence props (optional, passed by parent lesson component).
  progressStep?: number;
  progressComplete?: boolean;
  progressLoaded?: boolean;
  progressAnswers?: Record<string, PersistedAnswer>;
  completedActivityIds?: string[];
  onStepChange?: (step: number) => void;
  onAnswerSubmit?: (activityId: string, answer: PersistedAnswer) => void;
  onComplete?: () => void | Promise<void>;
};

export function LessonActivityRenderer({ activities, lessonSlug, language, copy, masteryConceptLabels, sourceMode, robinCheck, robinCheckComplete, children, progressStep, progressComplete, progressLoaded, progressAnswers = {}, completedActivityIds = [], onStepChange, onAnswerSubmit, onComplete }: Props) {
  const [step, setStep] = useState(progressStep ?? 0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [complete, setComplete] = useState(progressComplete ?? false);
  const [copied, setCopied] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const hydratedLesson = useRef("");
  const restoredAttemptIds = useRef(new Set<string>());
  const activity = activities[step];
  const answer = answers[activity.id] ?? { value: "", submitted: false };
  const interactive = activity.type === "predict" || activity.type === "practice";
  const correct = activity.type === "practice" ? (activity.checkAnswer ? activity.checkAnswer(answer.value) : false) : answer.value === activity.correctAnswer;
  // Responding and seeing feedback unlocks progress; this is not a mastery gate.
  const canContinue = interactive
    ? answer.submitted || completedActivityIds.includes(activity.id)
    : activity.type === "robin_check" ? robinCheckComplete || completedActivityIds.includes(activity.id) : true;

  useEffect(() => {
    if (!progressLoaded || hydratedLesson.current === lessonSlug) return;
    hydratedLesson.current = lessonSlug;
    if (progressStep != null && progressStep >= 0 && progressStep < activities.length) setStep(progressStep);
    restoredAttemptIds.current = new Set(Object.values(progressAnswers).map((saved) => saved.attemptId));
    setAnswers(Object.fromEntries(Object.entries(progressAnswers).map(([id, saved]) => [id, { ...saved, submitted: true }])));
    setComplete(Boolean(progressComplete));
  }, [activities.length, lessonSlug, progressAnswers, progressComplete, progressLoaded, progressStep]);

  function updateAnswer(value: string, submitted = false) {
    const existing = answers[activity.id] ?? { value: "", submitted: false };
    const isNewAttempt = submitted && (!existing.submitted || existing.value !== value);
    const nextAnswer = { value, submitted, attemptId: isNewAttempt ? crypto.randomUUID() : existing.attemptId };
    setAnswers((current) => {
      return { ...current, [activity.id]: nextAnswer };
    });
    if (submitted && nextAnswer.attemptId) onAnswerSubmit?.(activity.id, { value, attemptId: nextAnswer.attemptId });
  }
  function move(next: number) {
    setStep(next);
    setCopied(false);
    onStepChange?.(next);
    requestAnimationFrame(() => heading.current?.focus());
  }

  function finish() {
    setComplete(true);
    void onComplete?.();
  }

  return <div className="learning-flow">
    <div className="learning-flow-meta"><span className="eyebrow">{copy.step} {step + 1} {copy.of} {activities.length}</span><a href="#lesson-references">{copy.references} ↓</a></div>
    <section className="learning-activity" aria-labelledby="activity-title">
      <h2 id="activity-title" ref={heading} tabIndex={-1}>{activity.title}</h2>
      {activity.type !== "robin_check" && activity.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {activity.code && <div className="code-block"><div className="code-head"><span>{activity.type === "example" ? copy.diagram : copy.codeLabel ?? "python"}</span><button type="button" onClick={async () => {
        try { await navigator.clipboard.writeText(activity.code!); setCopied(true); } catch { setCopied(false); }
      }}>{copied ? copy.copied : copy.copy}</button></div><pre><code>{activity.code}</code></pre></div>}
      {interactive && <form onSubmit={(event) => { event.preventDefault(); if (answer.value.trim()) updateAnswer(answer.value, true); }}>
        {activity.type === "predict" ? <fieldset className="activity-options"><legend>{copy.prediction}</legend><div className="answer-options">{activity.options?.map((option) => <button type="button" aria-pressed={answer.value === option} className={answer.value === option ? "selected" : ""} key={option} onClick={() => updateAnswer(option)}>{activity.optionLabels?.[option] ?? option}</button>)}</div></fieldset> : <div className="activity-practice"><label htmlFor="practice-answer">{copy.oneLine}</label><input id="practice-answer" autoComplete="off" spellCheck={false} value={answer.value} onChange={(event) => updateAnswer(event.target.value)} /></div>}
        <button className="button" disabled={!answer.value.trim()} type="submit">{activity.type === "predict" ? copy.reveal : copy.check}</button>
        {answer.submitted && <p className={`answer-note ${correct ? "is-correct" : "is-incorrect"}`} role="status"><strong>{correct ? copy.correct : activity.type === "practice" ? copy.unsupported : copy.incorrect}</strong> {activity.explanation}{!correct && ` ${copy.revise}`}</p>}
      </form>}
      {/* Keep each attempt's feedback mounted across Previous/Next navigation. */}
      {activities.filter((item) => (item.type === "predict" || item.type === "practice") && item.learningPurpose).map((item) => <div key={item.id} hidden={activity.id !== item.id}>
        <SmartFeedback activityId={item.id} lessonSlug={lessonSlug} language={language} copy={copy} sourceMode={sourceMode} submitted={answers[item.id]?.submitted ?? false} learnerAnswer={answers[item.id]?.value ?? ""} attemptId={answers[item.id]?.attemptId ?? ""} requestEnabled={!restoredAttemptIds.current.has(answers[item.id]?.attemptId ?? "")} />
      </div>)}
      {activity.type === "formalize" && children}
      {/* Keep the check mounted so Previous and language changes preserve its response. */}
      <div hidden={activity.type !== "robin_check"}>{robinCheck}</div>
      {!sourceMode && activity.type === "intro" && <p className="panel-footnote">{copy.encouragement}</p>}
      {activity.type === "connect" && complete && <p className="mock-feedback" role="status"><strong>{copy.complete}</strong> {copy.completeNote}</p>}
      {activity.type === "connect" && masteryConceptLabels && <MasterySummary lessonSlug={lessonSlug} language={language} copy={copy} conceptLabels={masteryConceptLabels} />}
    </section>
    <nav className="learning-flow-nav" aria-label={copy.step}><button className="button" disabled={step === 0} onClick={() => move(step - 1)}>{copy.previous}</button>{step < activities.length - 1 ? <button className="button button-primary" disabled={!canContinue} onClick={() => move(step + 1)}>{copy.next}</button> : <button className="button button-primary" disabled={complete} onClick={finish}>{complete ? copy.finished : copy.finish}</button>}</nav>
    {!canContinue && <p className="panel-footnote">{activity.type === "robin_check" ? copy.checkGate : copy.gate}</p>}
  </div>;
}

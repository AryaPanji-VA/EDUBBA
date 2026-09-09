"use client";

import { useRef, useState, type ReactNode } from "react";
import { isListenersAnswerCorrect, type LessonActivity } from "@/content/lessons/activities";

type Answer = { value: string; submitted: boolean };
type Props = {
  activities: LessonActivity[];
  sourceMode: boolean;
  robinCheck: ReactNode;
  robinCheckComplete: boolean;
  children: ReactNode;
};

export function LessonActivityRenderer({ activities, sourceMode, robinCheck, robinCheckComplete, children }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [complete, setComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const activity = activities[step];
  const answer = answers[activity.id] ?? { value: "", submitted: false };
  const interactive = activity.type === "predict" || activity.type === "practice";
  const correct = activity.type === "practice" ? isListenersAnswerCorrect(answer.value) : answer.value === activity.correctAnswer;
  // Responding and seeing feedback unlocks progress; this is not a mastery gate.
  const canContinue = interactive ? answer.submitted : activity.type === "robin_check" ? robinCheckComplete : true;

  function updateAnswer(value: string, submitted = false) {
    setAnswers((current) => ({ ...current, [activity.id]: { value, submitted } }));
  }
  function move(next: number) {
    setStep(next);
    setCopied(false);
    requestAnimationFrame(() => heading.current?.focus());
  }

  return <div className="learning-flow">
    <div className="learning-flow-meta"><span className="eyebrow">Step {step + 1} of {activities.length}</span><a href="#lesson-references">Sources / References ↓</a></div>
    <section className="learning-activity" aria-labelledby="activity-title">
      <h2 id="activity-title" ref={heading} tabIndex={-1}>{activity.title}</h2>
      {activity.type !== "robin_check" && activity.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {activity.code && <div className="code-block"><div className="code-head"><span>{activity.type === "example" ? "name → value / diagram" : "python"}</span><button type="button" onClick={async () => {
        try { await navigator.clipboard.writeText(activity.code!); setCopied(true); } catch { setCopied(false); }
      }}>{copied ? "COPIED ✓" : "COPY"}</button></div><pre><code>{activity.code}</code></pre></div>}
      {interactive && <form onSubmit={(event) => { event.preventDefault(); if (answer.value.trim()) updateAnswer(answer.value, true); }}>
        {activity.type === "predict" ? <fieldset className="activity-options"><legend>Your prediction</legend><div className="answer-options">{activity.options?.map((option) => <button type="button" aria-pressed={answer.value === option} className={answer.value === option ? "selected" : ""} key={option} onClick={() => updateAnswer(option)}>{option}</button>)}</div></fieldset> : <div className="activity-practice"><label htmlFor="practice-answer">One Python line</label><input id="practice-answer" autoComplete="off" spellCheck={false} value={answer.value} onChange={(event) => updateAnswer(event.target.value)} /></div>}
        <button className="button" disabled={!answer.value.trim()} type="submit">{activity.type === "predict" ? "Reveal + explain" : "Check answer"}</button>
        {answer.submitted && <p className={`answer-note ${correct ? "is-correct" : "is-incorrect"}`} role="status"><strong>{correct ? "Correct. " : activity.type === "practice" ? "Not one of the supported forms. " : "Not quite. "}</strong>{activity.explanation}{!correct && " You can revise your answer and check again."}</p>}
      </form>}
      {activity.type === "formalize" && children}
      {activity.type === "robin_check" && robinCheck}
      {!sourceMode && activity.type === "intro" && <p className="panel-footnote">Satu langkah dulu. Nggak perlu hafal semua istilah malam ini.</p>}
      {activity.type === "connect" && complete && <p className="mock-feedback" role="status"><strong>Lesson complete — for this session.</strong> You finished the flow, not a mastery assessment. Reloading starts a fresh session.</p>}
    </section>
    <nav className="learning-flow-nav" aria-label="Lesson steps"><button className="button" disabled={step === 0} onClick={() => move(step - 1)}>Previous</button>{step < activities.length - 1 ? <button className="button button-primary" disabled={!canContinue} onClick={() => move(step + 1)}>Continue</button> : <button className="button button-primary" disabled={complete} onClick={() => setComplete(true)}>{complete ? "Completed this session" : "Complete lesson"}</button>}</nav>
    {!canContinue && <p className="panel-footnote">{activity.type === "robin_check" ? "Submit an explanation to continue. This is not AI grading." : "Submit a response and read the feedback to continue."}</p>}
  </div>;
}

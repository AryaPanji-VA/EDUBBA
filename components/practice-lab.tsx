"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { TopBar } from "@/components/top-bar";
import { ProgressBar } from "@/components/progress-bar";
import { PracticeModeNav } from "@/components/practice-mode-nav";
import { PracticeAssist } from "@/components/practice-assist";
import { RobinCompanion } from "@/components/robin-companion";
import { LearningLogOffer } from "@/components/learning-log-offer";
import { checkPracticeExercise } from "@/lib/practice/check";
import { getPracticeTrack } from "@/lib/practice/registry";
import { localizePracticeTrack } from "@/content/practice/python/localization";
import { getActiveLessonLanguage } from "@/lib/robin/locale";
import { resolvePracticeAttemptId } from "@/lib/practice/state";
import { createSandboxHandoff, SANDBOX_HANDOFF_STORAGE_KEY, serializeSandboxHandoff } from "@/lib/sandbox/handoff";
import { usePractice } from "@/lib/progress/use-practice";
import { useUiCopy } from "@/lib/i18n/language-provider";
import { fillTemplate } from "@/lib/i18n/ui-copy";
import type { PracticeCheckResult, PracticeExerciseType } from "@/content/practice/types";
import type { LessonLanguage } from "@/content/lessons/shared-copy";
import type { RobinState } from "@/lib/robin/types";

// Practice chrome follows the product-wide language (Settings → Language);
// exercise content and grading requests follow the active EDUBBA locale
// read from the same canonical switcher source.
function useGuidedCopy(copy: Record<string, string>) {
  const typeLabels: Record<PracticeExerciseType, string> = {
    predict_output: copy["guided.type.predict"],
    fix_code: copy["guided.type.fix"],
    write_code: copy["guided.type.write"],
  };
  const statusLabels: Record<PracticeCheckResult["status"], string> = {
    correct: copy["guided.status.correct"],
    incorrect: copy["guided.status.incorrect"],
    partial: copy["guided.status.partial"],
  };
  const placeholders: Record<PracticeExerciseType, string> = {
    predict_output: copy["guided.placeholder.predict"],
    fix_code: copy["guided.placeholder.fix"],
    write_code: copy["guided.placeholder.write"],
  };
  return { typeLabels, statusLabels, placeholders };
}

export function PracticeLab() {
  const copy = useUiCopy();
  const { typeLabels, statusLabels, placeholders } = useGuidedCopy(copy);
  // The active EDUBBA locale is read once per mount of this route — the same
  // source the language switcher writes, so navigation applies it reactively.
  // It drives the localized exercise content and the grading request payload.
  const [language] = useState<LessonLanguage>(() => getActiveLessonLanguage());
  const rawTrack = getPracticeTrack("python");
  const track = useMemo(() => (rawTrack ? localizePracticeTrack(rawTrack, language) : rawTrack), [language, rawTrack]);
  const [topicSlug, setTopicSlug] = useState<string>(track?.topics[0]?.lessonSlug ?? "variables");
  const practice = usePractice("python");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [submission, setSubmission] = useState("");
  const [result, setResult] = useState<PracticeCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [shakyConcepts, setShakyConcepts] = useState<string[]>([]);
  const [robinState, setRobinState] = useState<RobinState>("idle");
  const [signalPulse, setSignalPulse] = useState(false);
  const hydrated = useRef(false);

  const topic = track?.topics.find((item) => item.lessonSlug === topicSlug) ?? track?.topics[0];
  const topicExercises = topic?.exercises ?? [];

  // Lightweight adaptation: exercises touching shaky concepts come first.
  // Existing mastery state is the only input; a failed read keeps the default order.
  const ordered = useMemo(() => {
    if (!shakyConcepts.length) return topicExercises;
    const weight = (exercise: { masteryConcepts: readonly string[] }) =>
      exercise.masteryConcepts.some((concept) => shakyConcepts.includes(concept)) ? 0 : 1;
    return [...topicExercises]
      .map((exercise, order) => ({ exercise, order }))
      .sort((a, b) => weight(a.exercise) - weight(b.exercise) || a.order - b.order)
      .map((item) => item.exercise);
  }, [topicExercises, shakyConcepts]);

  const exercise = (currentId ? ordered.find((item) => item.id === currentId) : null) ??
    ordered.find((item) => !practice.completedExerciseIds.includes(item.id)) ??
    ordered[0] ?? null;
  const attempt = exercise ? practice.attempts[exercise.id] ?? null : null;
  const completedCount = topicExercises.filter((item) => practice.completedExerciseIds.includes(item.id)).length;
  const topicComplete = topicExercises.length > 0 && completedCount === topicExercises.length;
  const logStatus = topic ? practice.logStatus[topic.lessonSlug] ?? "none" : "none";
  const nextId = exercise
    ? ordered.slice(ordered.indexOf(exercise) + 1).find((item) => !practice.completedExerciseIds.includes(item.id))?.id ?? null
    : null;

  // Adaptive ordering input: existing concept mastery for this topic's lesson.
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(`/api/learning/mastery?lesson=${encodeURIComponent(topicSlug)}`, { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (controller.signal.aborted) return;
        const shaky = (data.concepts ?? [])
          .filter((item: { state: string; evidenceCount: number }) => item.state === "shaky" && item.evidenceCount > 0)
          .map((item: { concept: string }) => item.concept);
        setShakyConcepts(shaky);
      } catch { /* Default order keeps the gym usable. */ }
    })();
    return () => controller.abort();
  }, [topicSlug]);

  // Resume: land on the persisted current exercise once, then leave navigation to the learner.
  useEffect(() => {
    if (!practice.isLoaded || hydrated.current) return;
    hydrated.current = true;
    const resumedTopic = track?.topics.find((item) =>
      item.exercises.some((itemExercise) => itemExercise.id === practice.currentExerciseId));
    const resumedId = resumedTopic
      ? practice.currentExerciseId
      : track?.topics[0]?.exercises[0]?.id ?? null;
    if (resumedTopic) setTopicSlug(resumedTopic.lessonSlug);
    setCurrentId(resumedId);
    if (!resumedTopic && resumedId) practice.setCurrent(resumedId);
  }, [practice.isLoaded, practice.currentExerciseId, practice.setCurrent, track]);

  // A new exercise starts with a clean attempt surface.
  const exerciseId = exercise?.id ?? null;
  useEffect(() => {
    if (!exerciseId || !exercise) return;
    const restoredAttempt = practice.attempts[exerciseId];
    const restoredAnswer = restoredAttempt?.answer;
    setSubmission(restoredAnswer ?? exercise.starterCode ?? "");
    // This only reconstructs a previously persisted display result. New grading
    // remains authoritative in POST /api/practice/check.
    setResult(restoredAnswer ? checkPracticeExercise(exercise, restoredAnswer, language) : null);
    setCheckError(null);
    setHintShown(false);
  }, [exercise, exerciseId, practice.attempts]);

  function pulseSignal() {
    setSignalPulse(false);
    requestAnimationFrame(() => setSignalPulse(true));
    window.setTimeout(() => setSignalPulse(false), 700);
  }

  function updateRobinState(state: RobinState) {
    setRobinState(state);
    if (state === "success") pulseSignal();
  }

  function switchTopic(next: string) {
    if (next === topicSlug) return;
    const nextTopic = track?.topics.find((item) => item.lessonSlug === next);
    const nextExercise = nextTopic?.exercises.find((item) =>
      !practice.completedExerciseIds.includes(item.id)) ?? nextTopic?.exercises[0] ?? null;
    setTopicSlug(next);
    setCurrentId(nextExercise?.id ?? null);
    practice.setCurrent(nextExercise?.id ?? null);
    setShakyConcepts([]);
  }

  function jumpTo(exerciseId: string) {
    setCurrentId(exerciseId);
    practice.setCurrent(exerciseId);
  }

  async function check() {
    if (!exercise || checking || !submission.trim()) return;
    const previousAttempt = practice.attempts[exercise.id];
    const attemptId = resolvePracticeAttemptId(
      previousAttempt,
      submission,
      () => crypto.randomUUID(),
    );
    if (previousAttempt?.attemptId === attemptId) {
      setResult(checkPracticeExercise(exercise, submission, language));
      setCheckError(null);
      return;
    }
    setChecking(true);
    setCheckError(null);
    try {
      const response = await fetch("/api/practice/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: exercise.id, answer: submission, attemptId, language }),
      });
      const data = await response.json();
      if (!response.ok || !data.result?.status) throw new Error(typeof data.error === "string" ? data.error : copy["guided.checkUnavailable"]);
      setResult(data.result as PracticeCheckResult);
      practice.recordAttempt(exercise.id, {
        attemptId,
        status: data.result.status,
        misconception: data.result.misconception ?? null,
        answer: submission,
      });
      pulseSignal();
    } catch (failure) {
      setCheckError(failure instanceof Error ? failure.message : copy["guided.checkUnavailable"]);
    } finally {
      setChecking(false);
    }
  }

  function next() {
    if (!nextId || !exercise) return;
    jumpTo(nextId);
  }

  function prepareSandbox() {
    if (!exercise) return;
    const handoff = createSandboxHandoff(exercise);
    if (!handoff) return;
    try { window.sessionStorage.setItem(SANDBOX_HANDOFF_STORAGE_KEY, serializeSandboxHandoff(handoff)); } catch {
      // Navigation still works; the Sandbox falls back to its saved draft.
    }
  }

  const canOpenInSandbox = Boolean(exercise?.starterCode?.trim() || exercise?.code?.trim());

  return (
    <AppShell active="practice" signalMode={robinState === "error" ? "error" : robinState === "thinking" ? "active" : "calm"} signalPulse={signalPulse}>
      <TopBar breadcrumb={<><Link href="/practice">Practice</Link><span className="sep">/</span><b>Python Fundamentals</b></>} />
      <div className="content">
        <header className="page-header">
          <div>
            <span className="eyebrow">{fillTemplate(copy["guided.eyebrow"], { count: track ? topicExercises.length : 0 })}</span>
            <h1>{copy["guided.title"]}</h1>
            <p>{copy["guided.sub"]}</p>
          </div>
        </header>

        <PracticeModeNav active="guided" />

        <div className="practice-topic-bar">
          <div className="switcher" role="group" aria-label={copy["guided.ariaTopic"]}>
            {(track?.topics ?? []).map((item) => (
              <button key={item.lessonSlug} type="button" aria-pressed={item.lessonSlug === topicSlug} className={item.lessonSlug === topicSlug ? "on" : ""} onClick={() => switchTopic(item.lessonSlug)}>{item.title}</button>
            ))}
          </div>
          <div className="practice-topic-actions">
            <span className="practice-count">{fillTemplate(copy["practice.count"], { done: completedCount, total: topicExercises.length })}</span>
          </div>
        </div>

        <div className="practice-grid">
          <article className="practice-article">
            <ProgressBar value={topicExercises.length ? Math.round((completedCount / topicExercises.length) * 100) : 0} />

            {exercise && <>
              <section className="practice-session" aria-label={copy["guided.ariaExercise"]}>
                <span className="eyebrow">{topic?.title} · {typeLabels[exercise.type]}</span>
                <h2>{exercise.concept}</h2>
                <p className="practice-prompt">{exercise.prompt}</p>

                {exercise.type !== "write_code" && exercise.code && (
                  <div className="code-block">
                    <div className="code-head"><span>{copy["guided.codeLabel"]}</span></div>
                    <pre><code>{exercise.code}</code></pre>
                  </div>
                )}

                <form onSubmit={(event) => { event.preventDefault(); void check(); }}>
                  <label className="practice-editor-label" htmlFor="practice-answer">{copy["guided.editorLabel"]}</label>
                  <textarea id="practice-answer" className="practice-editor" rows={exercise.type === "predict_output" ? 2 : 6} spellCheck={false} autoComplete="off"
                    placeholder={placeholders[exercise.type]} value={submission}
                    onChange={(event) => setSubmission(event.target.value)} />
                  <div className="practice-actions">
                    <button className="button button-primary" type="submit" disabled={checking || !submission.trim()}>{checking ? copy["guided.checking"] : copy["practice.check"]}</button>
                    <button className="practice-ghost" type="button" onClick={() => setHintShown((shown) => !shown)}>{hintShown ? copy["practice.hideHint"] : copy["practice.hint"]}</button>
                    {canOpenInSandbox && <Link className="practice-ghost" href="/practice/python/sandbox" onClick={prepareSandbox}>{copy["guided.openSandbox"]}</Link>}
                  </div>
                </form>

                {hintShown && <p className="practice-hint" role="note"><strong>{copy["practice.hintStrong"]}</strong> {exercise.hint}</p>}

                {result && <p className={`answer-note ${result.status === "correct" ? "is-correct" : "is-incorrect"}`} role="status">
                  <strong>{statusLabels[result.status]}</strong> {result.explanation}
                  {result.misconceptionNote && <span className="practice-misconception"><strong>{fillTemplate(copy["guided.misLabel"], { name: result.misconception ?? "" })}</strong> {result.misconceptionNote}</span>}
                </p>}
                {!result && attempt && <p className="practice-restored" role="status">{fillTemplate(copy["guided.restored"], { status: attempt.status })}</p>}
                {checkError && <p className="robin-error" role="alert">{checkError}</p>}

                <PracticeAssist
                  mode="guided"
                  resetKey={exercise.id}
                  payload={{ exerciseId: exercise.id, learnerAnswer: submission.trim() || undefined }}
                  actions={[
                    { action: "hint", label: copy["guided.assistHint"] },
                    { action: "explain-result", label: copy["guided.assistExplain"], disabled: !result || result.status === "correct" },
                  ]}
                  note={copy["guided.assistNote"]}
                />

                <div className="practice-nav">
                  <button className="button button-primary" disabled={!nextId} onClick={next}>{copy["guided.next"]}</button>
                  {!nextId && <span className="practice-count">{topicComplete ? copy["guided.topicComplete"] : copy["guided.otherExercises"]}</span>}
                </div>
              </section>

              <nav className="practice-exercise-list" aria-label={copy["guided.ariaList"]}>
                {ordered.map((item, itemIndex) => {
                  const itemAttempt = practice.attempts[item.id];
                  const done = practice.completedExerciseIds.includes(item.id);
                  return <button key={item.id} type="button" className={`practice-exercise-row ${item.id === exercise.id ? "now" : ""}`} onClick={() => jumpTo(item.id)}>
                    <span className={`practice-dot ${done ? "done" : itemAttempt ? "tried" : ""}`} aria-hidden="true" />
                    <span className="practice-exercise-name">{String(itemIndex + 1).padStart(2, "0")} · {item.concept}</span>
                    <span className="practice-exercise-type">{typeLabels[item.type]}{done ? " · done" : itemAttempt ? ` · ${itemAttempt.status}` : ""}</span>
                  </button>;
                })}
              </nav>
            </>}

            {topicComplete && logStatus === "pending" &&
              <LearningLogOffer lessonSlug={topicSlug} onDecision={(decision) => practice.markLog(topicSlug, decision)} />}
            {topicComplete && logStatus === "saved" && <p className="panel-footnote" role="status">{copy["guided.logSaved"]}</p>}
            {topicComplete && logStatus === "skipped" && <p className="panel-footnote" role="status">{copy["guided.logSkipped"]}</p>}

            <p className="panel-footnote">{copy["guided.footnote"]}</p>
          </article>

          <RobinCompanion lessonSlug={topicSlug} sourceMode={false} onStateChange={updateRobinState} />
        </div>
      </div>
    </AppShell>
  );
}

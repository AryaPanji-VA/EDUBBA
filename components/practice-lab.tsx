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
import type { PracticeCheckResult, PracticeExerciseType } from "@/content/practice/types";
import type { LessonLanguage } from "@/content/lessons/shared-copy";
import type { RobinState } from "@/lib/robin/types";

const typeLabels: Record<PracticeExerciseType, Record<LessonLanguage, string>> = {
  predict_output: { en: "Predict Output", id: "Prediksi output" },
  fix_code: { en: "Fix the Code", id: "Perbaiki kodenya" },
  write_code: { en: "Write Code", id: "Tulis kode" },
};

const statusLabels: Record<PracticeCheckResult["status"], Record<LessonLanguage, string>> = {
  correct: { en: "Correct", id: "Benar" },
  incorrect: { en: "Not yet", id: "Belum" },
  partial: { en: "Partly there", id: "Hampir pas" },
};

const placeholders: Record<PracticeExerciseType, Record<LessonLanguage, string>> = {
  predict_output: { en: "Write exactly the output that appears…", id: "Tulis persis output yang muncul…" },
  fix_code: { en: "Fix the code here…", id: "Perbaiki kodenya di sini…" },
  write_code: { en: "Write your code here…", id: "Tulis kodenya di sini…" },
};

const copy: Record<LessonLanguage, Record<string, string>> = {
  en: {
    heading: "Small, focused, hands-on.",
    intro: "Short drills from the lesson concepts — predict, fix, write. Checks are deterministic; Robin sits beside you when something needs re-explaining.",
    perTopic: "exercises per topic",
    of: "of",
    complete: "complete",
    yourCode: "Your code",
    checking: "Checking…",
    check: "Check",
    hideHint: "Hide hint",
    hint: "Hint",
    restored: "Attempt restored:",
    retake: "Retake freely — check again for a new attempt.",
    misconception: "Misconception ·",
    aiHint: "Give me a hint",
    aiExplain: "Explain why this is wrong",
    aiNote: "Robin's hints are staged — it will not hand over the answer. The deterministic hint above works without AI.",
    next: "Next exercise →",
    topicDone: "Topic complete — nice.",
    moreBelow: "More practice via the list below.",
    logSaved: "This practice session is already saved in the Learning Log.",
    logSkipped: "The log for this session was skipped. Robin is still ready if you want to record one via the panel.",
    footer: "Checks are deterministic and run without AI. Each exercise ships its own hint; Robin in the side panel explains using the lesson context.",
    topicAria: "Practice topic",
    sessionAria: "Practice exercise",
    listAria: "Exercises in this topic",
  },
  id: {
    heading: "Kecil, fokus, ngoding.",
    intro: "Latihan pendek dari konsep lesson — predict, fix, write. Check-nya deterministic; Robin duduk di samping kalau perlu dijelaskan ulang.",
    perTopic: "latihan per topik",
    of: "dari",
    complete: "selesai",
    yourCode: "Kode lu",
    checking: "Menyusun…",
    check: "Check",
    hideHint: "Sembunyikan hint",
    hint: "Hint",
    restored: "Attempt dipulihkan:",
    retake: "Retake bebas — check lagi untuk attempt baru.",
    misconception: "Miskonsepsi ·",
    aiHint: "Kasih hint dong",
    aiExplain: "Jelasin kenapa ini salah",
    aiNote: "Hint Robin bertahap — dia nggak langsung nyerahin jawaban. Hint deterministic di atas tetap jalan tanpa AI.",
    next: "Latihan berikutnya →",
    topicDone: "Topik selesai — mantap.",
    moreBelow: "Latihan lain lewat daftar di bawah.",
    logSaved: "Practice session ini udah tersimpan di Learning Log.",
    logSkipped: "Log untuk sesi ini dilewati. Robin tetap siap kalau mau catat lewat panel.",
    footer: "Check itu deterministic dan jalan tanpa AI. Hint tersimpan di tiap exercise; Robin di panel samping menjelaskan pakai konteks lesson.",
    topicAria: "Topik practice",
    sessionAria: "Exercise practice",
    listAria: "Exercise di topik ini",
  },
};

export function PracticeLab() {
  // The active EDUBBA locale is read once per mount of this route — the same
  // source the language switcher writes, so navigation applies it reactively.
  const [language] = useState<LessonLanguage>(() => getActiveLessonLanguage());
  const t = copy[language];
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
      if (!response.ok || !data.result?.status) throw new Error(typeof data.error === "string" ? data.error : "Check belum tersedia. Coba lagi.");
      setResult(data.result as PracticeCheckResult);
      practice.recordAttempt(exercise.id, {
        attemptId,
        status: data.result.status,
        misconception: data.result.misconception ?? null,
        answer: submission,
      });
      pulseSignal();
    } catch (failure) {
      setCheckError(failure instanceof Error ? failure.message : "Check belum tersedia. Coba lagi.");
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
            <span className="eyebrow">Practice Lab · Python Fundamentals · {track ? topicExercises.length : 0} {t.perTopic}</span>
            <h1>{t.heading}</h1>
            <p>{t.intro}</p>
          </div>
        </header>

        <PracticeModeNav active="guided" />

        <div className="practice-topic-bar">
          <div className="switcher" role="group" aria-label={t.topicAria}>
            {(track?.topics ?? []).map((item) => (
              <button key={item.lessonSlug} type="button" aria-pressed={item.lessonSlug === topicSlug} className={item.lessonSlug === topicSlug ? "on" : ""} onClick={() => switchTopic(item.lessonSlug)}>{item.title}</button>
            ))}
          </div>
          <div className="practice-topic-actions">
            <span className="practice-count">{completedCount} {t.of} {topicExercises.length} {t.complete}</span>
          </div>
        </div>

        <div className="practice-grid">
          <article className="practice-article">
            <ProgressBar value={topicExercises.length ? Math.round((completedCount / topicExercises.length) * 100) : 0} />

            {exercise && <>
              <section className="practice-session" aria-label={t.sessionAria}>
                <span className="eyebrow">{topic?.title} · {typeLabels[exercise.type][language]}</span>
                <h2>{exercise.concept}</h2>
                <p className="practice-prompt">{exercise.prompt}</p>

                {exercise.type !== "write_code" && exercise.code && (
                  <div className="code-block">
                    <div className="code-head"><span>python / read it</span></div>
                    <pre><code>{exercise.code}</code></pre>
                  </div>
                )}

                <form onSubmit={(event) => { event.preventDefault(); void check(); }}>
                  <label className="practice-editor-label" htmlFor="practice-answer">{t.yourCode}</label>
                  <textarea id="practice-answer" className="practice-editor" rows={exercise.type === "predict_output" ? 2 : 6} spellCheck={false} autoComplete="off"
                    placeholder={placeholders[exercise.type][language]} value={submission}
                    onChange={(event) => setSubmission(event.target.value)} />
                  <div className="practice-actions">
                    <button className="button button-primary" type="submit" disabled={checking || !submission.trim()}>{checking ? t.checking : t.check}</button>
                    <button className="practice-ghost" type="button" onClick={() => setHintShown((shown) => !shown)}>{hintShown ? t.hideHint : t.hint}</button>
                    {canOpenInSandbox && <Link className="practice-ghost" href="/practice/python/sandbox" onClick={prepareSandbox}>Open in Sandbox</Link>}
                  </div>
                </form>

                {hintShown && <p className="practice-hint" role="note"><strong>Hint.</strong> {exercise.hint}</p>}

                {result && <p className={`answer-note ${result.status === "correct" ? "is-correct" : "is-incorrect"}`} role="status">
                  <strong>{statusLabels[result.status][language]}</strong> {result.explanation}
                  {result.misconceptionNote && <span className="practice-misconception"><strong>{t.misconception} {result.misconception}</strong> {result.misconceptionNote}</span>}
                </p>}
                {!result && attempt && <p className="practice-restored" role="status">{t.restored} {attempt.status}. {t.retake}</p>}
                {checkError && <p className="robin-error" role="alert">{checkError}</p>}

                <PracticeAssist
                  mode="guided"
                  resetKey={exercise.id}
                  payload={{ exerciseId: exercise.id, learnerAnswer: submission.trim() || undefined }}
                  actions={[
                    { action: "hint", label: t.aiHint },
                    { action: "explain-result", label: t.aiExplain, disabled: !result || result.status === "correct" },
                  ]}
                  note={t.aiNote}
                />

                <div className="practice-nav">
                  <button className="button button-primary" disabled={!nextId} onClick={next}>{t.next}</button>
                  {!nextId && <span className="practice-count">{topicComplete ? t.topicDone : t.moreBelow}</span>}
                </div>
              </section>

              <nav className="practice-exercise-list" aria-label={t.listAria}>
                {ordered.map((item, itemIndex) => {
                  const itemAttempt = practice.attempts[item.id];
                  const done = practice.completedExerciseIds.includes(item.id);
                  return <button key={item.id} type="button" className={`practice-exercise-row ${item.id === exercise.id ? "now" : ""}`} onClick={() => jumpTo(item.id)}>
                    <span className={`practice-dot ${done ? "done" : itemAttempt ? "tried" : ""}`} aria-hidden="true" />
                    <span className="practice-exercise-name">{String(itemIndex + 1).padStart(2, "0")} · {item.concept}</span>
                    <span className="practice-exercise-type">{typeLabels[item.type][language]}{done ? " · done" : itemAttempt ? ` · ${itemAttempt.status}` : ""}</span>
                  </button>;
                })}
              </nav>
            </>}

            {topicComplete && logStatus === "pending" &&
              <LearningLogOffer lessonSlug={topicSlug} onDecision={(decision) => practice.markLog(topicSlug, decision)} />}
            {topicComplete && logStatus === "saved" && <p className="panel-footnote" role="status">{t.logSaved}</p>}
            {topicComplete && logStatus === "skipped" && <p className="panel-footnote" role="status">{t.logSkipped}</p>}

            <p className="panel-footnote">{t.footer}</p>
          </article>

          <RobinCompanion lessonSlug={topicSlug} sourceMode={false} onStateChange={updateRobinState} />
        </div>
      </div>
    </AppShell>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProgressBar } from "@/components/progress-bar";
import { PracticeModeNav } from "@/components/practice-mode-nav";
import { PracticeAssist } from "@/components/practice-assist";
import { TopBar } from "@/components/top-bar";
import type { ThinkingActivity, ThinkingSubmission } from "@/content/practice/thinking/types";
import type { PracticeCheckResult } from "@/content/practice/types";
import {
  checkThinkingActivity, createEmptyThinkingSubmission, deserializeThinkingSubmission,
  isThinkingSubmissionComplete, serializeThinkingSubmission,
} from "@/lib/practice/thinking-check";
import { getThinkingActivities, thinkingTypeLabels } from "@/lib/practice/thinking-registry";
import { createSandboxHandoff, SANDBOX_HANDOFF_STORAGE_KEY, serializeSandboxHandoff } from "@/lib/sandbox/handoff";
import { usePractice } from "@/lib/progress/use-practice";
import { resolvePracticeAttemptId } from "@/lib/practice/state";

const statusLabels: Record<PracticeCheckResult["status"], string> = {
  correct: "Reasoning-nya pas",
  partial: "Sebagian sudah nyambung",
  incorrect: "Belum pas",
};

function ThinkingInteraction({ activity, submission, onChange }: {
  activity: ThinkingActivity;
  submission: ThinkingSubmission;
  onChange: (next: ThinkingSubmission) => void;
}) {
  const interaction = activity.interaction;

  if (interaction.kind === "single-choice" && submission.kind === "single-choice") {
    return <fieldset className="thinking-options"><legend className="sr-only">Choose one answer</legend>{interaction.options.map((option) =>
      <label key={option.id} className={submission.optionId === option.id ? "selected" : ""}>
        <input type="radio" name={`thinking-${activity.id}`} value={option.id} checked={submission.optionId === option.id}
          onChange={() => onChange({ kind: "single-choice", optionId: option.id })} />
        <span>{option.label}</span>
      </label>)}</fieldset>;
  }

  if (interaction.kind === "multi-select" && submission.kind === "multi-select") {
    return <fieldset className="thinking-options"><legend className="sr-only">Choose all valid answers</legend>{interaction.options.map((option) => {
      const selected = submission.selectedIds.includes(option.id);
      return <label key={option.id} className={selected ? "selected" : ""}>
        <input type="checkbox" checked={selected} onChange={() => onChange({
          kind: "multi-select",
          selectedIds: selected ? submission.selectedIds.filter((id) => id !== option.id) : [...submission.selectedIds, option.id],
        })} />
        <span>{option.label}</span>
      </label>;
    })}</fieldset>;
  }

  if (interaction.kind === "ordering" && submission.kind === "ordering") {
    const labels = new Map(interaction.steps.map((step) => [step.id, step.label]));
    const currentOrder = submission.orderedIds;
    function move(index: number, direction: -1 | 1) {
      const target = index + direction;
      if (target < 0 || target >= currentOrder.length) return;
      const orderedIds = [...currentOrder];
      [orderedIds[index], orderedIds[target]] = [orderedIds[target], orderedIds[index]];
      onChange({ kind: "ordering", orderedIds });
    }
    return <ol className="thinking-order" aria-label="Ordered steps">{currentOrder.map((id, index) =>
      <li key={id}>
        <span className="thinking-order-number">{index + 1}</span>
        <span>{labels.get(id)}</span>
        <div>
          <button type="button" aria-label={`Move ${labels.get(id)} up`} disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
          <button type="button" aria-label={`Move ${labels.get(id)} down`} disabled={index === currentOrder.length - 1} onClick={() => move(index, 1)}>↓</button>
        </div>
      </li>)}</ol>;
  }

  if (interaction.kind === "fields" && submission.kind === "fields") {
    return <div className="thinking-fields">{interaction.fields.map((field) =>
      <label key={field.id}><span>{field.label}</span><input type="text" value={submission.values[field.id] ?? ""}
        placeholder={field.placeholder} autoComplete="off"
        onChange={(event) => onChange({ kind: "fields", values: { ...submission.values, [field.id]: event.target.value } })} /></label>)}</div>;
  }

  return null;
}

export function ThinkingLab() {
  const activities = getThinkingActivities();
  const practice = usePractice("thinking");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [submission, setSubmission] = useState<ThinkingSubmission>(() => createEmptyThinkingSubmission(activities[0]));
  const [result, setResult] = useState<PracticeCheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [shakyConcepts, setShakyConcepts] = useState<string[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(["variables", "data-types", "operators", "conditionals", "loops", "functions"].map(async (lesson) => {
      const response = await fetch(`/api/learning/mastery?lesson=${lesson}`, { signal: controller.signal });
      if (!response.ok) return [];
      const data = await response.json();
      return (data.concepts ?? []).filter((item: { state: string }) => item.state === "shaky")
        .map((item: { concept: string }) => `${lesson}:${item.concept}`);
    })).then((groups) => { if (!controller.signal.aborted) setShakyConcepts(groups.flat()); }).catch(() => undefined);
    return () => controller.abort();
  }, []);

  const ordered = useMemo(() => activities.map((activity, index) => ({ activity, index })).sort((a, b) => {
    const weight = (item: ThinkingActivity) => item.masteryEvidence.some((mapping) => shakyConcepts.includes(`${mapping.lessonSlug}:${mapping.concept}`)) ? 0 : 1;
    return weight(a.activity) - weight(b.activity) || a.index - b.index;
  }).map((item) => item.activity), [activities, shakyConcepts]);

  const activity = (currentId ? ordered.find((item) => item.id === currentId) : null) ??
    ordered.find((item) => !practice.completedExerciseIds.includes(item.id)) ?? ordered[0];
  const completedCount = activities.filter((item) => practice.completedExerciseIds.includes(item.id)).length;
  const attempt = practice.attempts[activity.id] ?? null;
  const remaining = ordered.filter((item) => item.id !== activity.id && !practice.completedExerciseIds.includes(item.id));
  const nextId = remaining[0]?.id ?? null;

  useEffect(() => {
    if (!practice.isLoaded || hydrated.current) return;
    hydrated.current = true;
    const resumed = activities.some((item) => item.id === practice.currentExerciseId) ? practice.currentExerciseId : activities[0]?.id ?? null;
    setCurrentId(resumed);
    if (resumed !== practice.currentExerciseId) practice.setCurrent(resumed);
  }, [activities, practice.currentExerciseId, practice.isLoaded, practice.setCurrent]);

  useEffect(() => {
    const restored = deserializeThinkingSubmission(practice.attempts[activity.id]?.answer, activity);
    const next = restored ?? createEmptyThinkingSubmission(activity);
    setSubmission(next);
    setResult(restored ? checkThinkingActivity(activity, restored) : null);
    setCheckError(null);
    setHintShown(false);
  }, [activity, practice.attempts]);

  function jumpTo(id: string) {
    setCurrentId(id);
    practice.setCurrent(id);
  }

  async function check() {
    if (checking || !isThinkingSubmissionComplete(activity, submission)) return;
    const serializedSubmission = serializeThinkingSubmission(submission);
    const previousAttempt = practice.attempts[activity.id];
    const attemptId = resolvePracticeAttemptId(
      previousAttempt,
      serializedSubmission,
      () => crypto.randomUUID(),
    );
    if (previousAttempt?.attemptId === attemptId) {
      setResult(checkThinkingActivity(activity, submission));
      setCheckError(null);
      return;
    }
    setChecking(true);
    setCheckError(null);
    try {
      const response = await fetch("/api/practice/thinking/check", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityId: activity.id, answer: submission, attemptId }),
      });
      const data = await response.json();
      if (!response.ok || !data.result?.status) throw new Error(typeof data.error === "string" ? data.error : "Check belum tersedia.");
      setResult(data.result as PracticeCheckResult);
      practice.recordAttempt(activity.id, {
        attemptId, status: data.result.status, misconception: data.result.misconception ?? null,
        answer: serializedSubmission,
      });
    } catch (error) {
      setCheckError(error instanceof Error ? error.message : "Check belum tersedia.");
    } finally {
      setChecking(false);
    }
  }

  function prepareSandbox() {
    if (!activity.sandboxCode) return;
    const handoff = createSandboxHandoff({ id: activity.id, code: activity.sandboxCode });
    if (!handoff) return;
    try { window.sessionStorage.setItem(SANDBOX_HANDOFF_STORAGE_KEY, serializeSandboxHandoff(handoff)); } catch { /* Sandbox opens with its saved draft. */ }
  }

  return <AppShell active="practice">
    <TopBar breadcrumb={<><Link href="/practice">Practice</Link><span className="sep">/</span><b>Logic &amp; Thinking</b></>} />
    <div className="content">
      <header className="page-header thinking-header"><div>
        <span className="eyebrow">Practice Lab · Logic &amp; Computational Thinking · {activities.length} activities</span>
        <h1>Belajar mikir kayak programmer.</h1>
        <p>Pecah masalah, cari pola, trace program, dan susun langkah. Bukan tes IQ—ini latihan cara kerja program.</p>
      </div></header>

      <PracticeModeNav active="thinking" />

      <div className="practice-topic-bar">
        <span className="practice-count">{completedCount} of {activities.length} complete</span>
      </div>

      <div className="thinking-grid">
        <article className="practice-article">
          <ProgressBar value={Math.round((completedCount / activities.length) * 100)} />
          <section className="practice-session thinking-session" aria-label="Thinking activity">
            <span className="eyebrow">{thinkingTypeLabels[activity.type]} · Beginner</span>
            <h2>{activity.title}</h2>
            <p className="practice-prompt">{activity.prompt}</p>
            {activity.code && <div className="code-block"><div className="code-head"><span>python / trace it</span></div><pre><code>{activity.code}</code></pre></div>}
            <p className="thinking-instruction">{activity.instruction}</p>
            <ThinkingInteraction activity={activity} submission={submission} onChange={(next) => { setSubmission(next); setResult(null); }} />

            <div className="practice-actions">
              <button className="button button-primary" type="button" disabled={checking || !isThinkingSubmissionComplete(activity, submission)} onClick={() => void check()}>{checking ? "Checking…" : "Check reasoning"}</button>
              <button className="practice-ghost" type="button" onClick={() => setHintShown((shown) => !shown)}>{hintShown ? "Hide hint" : "Hint"}</button>
              {activity.sandboxCode && <Link className="practice-ghost" href="/practice/python/sandbox" onClick={prepareSandbox}>Try this in Sandbox</Link>}
            </div>
            {hintShown && <p className="practice-hint" role="note"><strong>Hint.</strong> {activity.hint}</p>}
            {result && <p className={`answer-note ${result.status === "correct" ? "is-correct" : "is-incorrect"}`} role="status">
              <strong>{statusLabels[result.status]}</strong> {result.explanation}
              {result.misconceptionNote && <span className="practice-misconception"><strong>Yang perlu dibenerin · {result.misconception}</strong> {result.misconceptionNote}</span>}
            </p>}
            {!result && attempt && <p className="practice-restored" role="status">Attempt tersimpan: {attempt.status}. Jawabannya dipulihkan setelah reload.</p>}
            {checkError && <p className="robin-error" role="alert">{checkError}</p>}

            <PracticeAssist
              mode="thinking"
              resetKey={activity.id}
              payload={{ activityId: activity.id, submission: serializeThinkingSubmission(submission) }}
              actions={[
                { action: "hint", label: "One hint" },
                { action: "break-down-problem", label: "Break it down" },
                { action: "explain-reasoning", label: "Explain the reasoning", disabled: !result },
              ]}
              note="Robin nunjukin langkah penalaran berikutnya, bukan jawaban utuh. Hint deterministic di atas tetap jalan tanpa AI."
            />

            <div className="practice-nav"><button className="button button-primary" disabled={!nextId} onClick={() => nextId && jumpTo(nextId)}>Next activity →</button>
              {!nextId && <span className="practice-count">{completedCount === activities.length ? "Thinking set complete — mantap." : "Pilih activity lain dari daftar."}</span>}</div>
          </section>

          <nav className="practice-exercise-list" aria-label="Thinking activities">{ordered.map((item, index) => {
            const saved = practice.attempts[item.id];
            const done = practice.completedExerciseIds.includes(item.id);
            return <button key={item.id} type="button" className={`practice-exercise-row ${item.id === activity.id ? "now" : ""}`} onClick={() => jumpTo(item.id)}>
              <span className={`practice-dot ${done ? "done" : saved ? "tried" : ""}`} aria-hidden="true" />
              <span className="practice-exercise-name">{String(index + 1).padStart(2, "0")} · {item.title}</span>
              <span className="practice-exercise-type">{thinkingTypeLabels[item.type]}{done ? " · done" : saved ? ` · ${saved.status}` : ""}</span>
            </button>;
          })}</nav>
          <p className="panel-footnote">Correctness selalu deterministic. Robin tidak dibutuhkan untuk membuka, mengerjakan, atau memeriksa activity.</p>
        </article>

        <aside className="panel thinking-guide" aria-label="Thinking Lab guide">
          <span className="tag acc">How to use it</span>
          <h2>Pelan, terus urut.</h2>
          <p>Tujuannya bukan menjawab cepat. Cari data yang tersedia, perubahan yang terjadi, dan urutan yang masuk akal.</p>
          <ul><li>pecah masalah kecil-kecil</li><li>uji pola ke semua contoh</li><li>trace satu baris sekali</li><li>diagnosis konsep sebelum memperbaiki</li></ul>
          <p className="thinking-guide-note">Correctness tetap deterministic. Robin cuma membantu penalaran — dia tidak menilai ulang jawaban lu.</p>
        </aside>
      </div>
    </div>
  </AppShell>;
}

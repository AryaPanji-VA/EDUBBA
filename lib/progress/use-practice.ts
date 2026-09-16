"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PersistedPracticeAttempt, PracticeLogStatus } from "@/lib/practice/types";
import { getPracticeProgressDefinition } from "@/lib/practice/progress-registry";
import {
  completePracticeSession, decidePracticeLog, freshPracticeState, hydratePracticeState,
  movePracticeExercise, offerPracticeLog, recordPracticeAttempt, type RuntimePracticeState,
} from "@/lib/practice/state";

// Practice progress hook — mirrors lib/progress/use-progress.ts.
// Persists only meaningful state (current exercise, completed exercises,
// checked attempts, Learning Log decisions); UI state stays transient.
export function usePractice(trackSlug: string) {
  const definition = useMemo(() => getPracticeProgressDefinition(trackSlug), [trackSlug]);
  const ids = useMemo(() => definition?.activityIds ?? [], [definition]);
  const topicByLesson = useMemo(() => definition?.logGroups ?? [], [definition]);
  const [state, setState] = useState<RuntimePracticeState>(() => freshPracticeState());
  const stateRef = useRef<RuntimePracticeState>(freshPracticeState());
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());

  const persist = useCallback((next: RuntimePracticeState) => {
    const request = () => fetch("/api/practice/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseSlug: trackSlug,
        currentExerciseId: next.currentExerciseId,
        completedExerciseIds: next.completedExerciseIds,
        progressState: { attempts: next.attempts, logStatus: next.logStatus },
        completedAt: next.completedAt,
      }),
    }).then(async (response) => {
      if (!response.ok) throw new Error("Practice progress unavailable.");
      return response.json() as Promise<{ newlyCompleted?: boolean }>;
    });
    const queued = saveQueue.current.catch(() => undefined).then(request);
    saveQueue.current = queued;
    return queued;
  }, [trackSlug]);

  const replaceState = useCallback((next: RuntimePracticeState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      let next = freshPracticeState(true);
      try {
        const response = await fetch(`/api/practice/progress?track=${encodeURIComponent(trackSlug)}`, { signal: controller.signal });
        if (response.ok) {
          const data = await response.json();
          next = hydratePracticeState(data.progress ?? null);
        }
      } catch {
        if (controller.signal.aborted) return;
      }
      if (controller.signal.aborted) return;
      replaceState(next);
      // Touch the loaded row (or create its initial row) so a session resumes here.
      void persist(next).catch(() => undefined);
    })();
    return () => controller.abort();
  }, [trackSlug, ids, persist, replaceState]);

  const setCurrent = useCallback((exerciseId: string | null) => {
    const next = movePracticeExercise(stateRef.current, exerciseId);
    replaceState(next);
    void persist(next).catch(() => undefined);
  }, [persist, replaceState]);

  const recordAttempt = useCallback((exerciseId: string, attempt: PersistedPracticeAttempt) => {
    let next = recordPracticeAttempt(stateRef.current, exerciseId, attempt);
    // A fully completed topic offers a Learning Log entry (no decision yet).
    for (const topic of topicByLesson) {
      const topicComplete = topic.exerciseIds.every((id) => next.completedExerciseIds.includes(id));
      next = offerPracticeLog(next, topic.lessonSlug, topicComplete);
    }
    // A fully completed track stamps completion once.
    if (ids.length > 0 && ids.every((id) => next.completedExerciseIds.includes(id))) {
      next = completePracticeSession(next, new Date().toISOString());
    }
    replaceState(next);
    void persist(next).catch(() => undefined);
  }, [ids, persist, replaceState, topicByLesson]);

  const markLog = useCallback(async (lessonSlug: string, status: Exclude<PracticeLogStatus, "pending">) => {
    const next = decidePracticeLog(stateRef.current, lessonSlug, status);
    replaceState(next);
    try { await persist(next); } catch { /* The saved log itself remains authoritative. */ }
  }, [persist, replaceState]);

  return { ...state, setCurrent, recordAttempt, markLog };
}

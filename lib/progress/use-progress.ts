"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LearningLogOfferStatus, PersistedAnswer } from "./types";
import { advanceProgress, completeLessonProgress, freshProgressState, hydrateProgressState, submitProgressAnswer, type RuntimeProgressState } from "./state";

export function useProgress(lessonSlug: string, activities: { id: string }[], courseSlug: string) {
  const activityKey = activities.map((activity) => activity.id).join("\u0000");
  const activityIds = useMemo(() => activityKey.split("\u0000"), [activityKey]);
  const [state, setState] = useState<RuntimeProgressState>(() => freshProgressState());
  const stateRef = useRef<RuntimeProgressState>(freshProgressState());
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());

  const persist = useCallback((next: RuntimeProgressState) => {
    const request = () => fetch("/api/learning/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseSlug,
        lessonSlug,
        currentActivityId: activityIds[next.step] ?? null,
        completedActivityIds: next.completedActivityIds,
        progressState: {
          answers: next.answers,
          robinCheckComplete: next.robinCheckComplete,
          learningLogStatus: next.learningLogStatus,
        },
        completedAt: next.completedAt,
      }),
    }).then(async (response) => {
      if (!response.ok) throw new Error("Progress unavailable.");
      return response.json() as Promise<{ newlyCompleted?: boolean }>;
    });
    const queued = saveQueue.current.catch(() => undefined).then(request);
    saveQueue.current = queued;
    return queued;
  }, [activityIds, courseSlug, lessonSlug]);

  const replaceState = useCallback((next: RuntimeProgressState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      let next = freshProgressState(true);
      try {
        const response = await fetch(`/api/learning/progress?lesson=${encodeURIComponent(lessonSlug)}`, { signal: controller.signal });
        if (response.ok) {
          const data = await response.json();
          next = hydrateProgressState(data.progress ?? null, activityIds);
        }
      } catch {
        if (controller.signal.aborted) return;
      }
      if (controller.signal.aborted) return;
      replaceState(next);
      // Touch the loaded row (or create its initial row) so "current lesson" means last opened.
      void persist(next).catch(() => undefined);
    })();
    return () => controller.abort();
  }, [activityIds, lessonSlug, persist, replaceState]);

  const setStep = useCallback((nextStep: number) => {
    const next = advanceProgress(stateRef.current, nextStep, activityIds);
    replaceState(next);
    void persist(next).catch(() => undefined);
  }, [activityIds, persist, replaceState]);

  const recordAnswer = useCallback((activityId: string, answer: PersistedAnswer) => {
    const next = submitProgressAnswer(stateRef.current, activityId, answer);
    replaceState(next);
    void persist(next).catch(() => undefined);
  }, [persist, replaceState]);

  const recordRobinCheck = useCallback((complete: boolean) => {
    if (!complete) return;
    const current = stateRef.current;
    const next = {
      ...current,
      completedActivityIds: [...new Set([...current.completedActivityIds, "robin-check"])],
      robinCheckComplete: true,
    };
    replaceState(next);
    void persist(next).catch(() => undefined);
  }, [persist, replaceState]);

  const markComplete = useCallback(async () => {
    const current = stateRef.current;
    if (current.complete) return false;
    const next = completeLessonProgress(current, activityIds[current.step], new Date().toISOString());
    replaceState(next);
    try {
      const result = await persist(next);
      return result.newlyCompleted === true;
    } catch {
      return false;
    }
  }, [activityIds, persist, replaceState]);

  const markLearningLog = useCallback(async (status: Exclude<LearningLogOfferStatus, "none" | "pending">) => {
    const next = { ...stateRef.current, learningLogStatus: status };
    replaceState(next);
    try { await persist(next); } catch { /* The saved log itself remains authoritative. */ }
  }, [persist, replaceState]);

  return { ...state, setStep, recordAnswer, recordRobinCheck, markComplete, markLearningLog };
}

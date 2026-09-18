"use client";

import { useEffect, useState } from "react";
import { defaultCurrentLesson } from "@/data/courses";
import type { CurrentLesson } from "./types";

// Multi-course fallback (Phase 15): derived from the implemented-lesson map,
// not a hardcoded course. Persisted progress always wins once it loads.
const fallback: CurrentLesson = {
  courseSlug: defaultCurrentLesson.courseSlug,
  lessonSlug: defaultCurrentLesson.lessonSlug,
  currentActivityId: null,
  completedActivityIds: [],
  totalActivities: 0,
  completedAt: null,
  updatedAt: "",
};

export function useCurrentLesson() {
  const [current, setCurrent] = useState<CurrentLesson>(fallback);
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch("/api/learning/progress", { signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (data.current?.lessonSlug && data.current?.courseSlug) setCurrent(data.current);
      } catch { /* Static curriculum fallback remains available. */ }
    })();
    return () => controller.abort();
  }, []);
  return current;
}

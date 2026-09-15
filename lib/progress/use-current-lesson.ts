"use client";

import { useEffect, useState } from "react";
import { programmingLessonStateBySlug } from "@/data/courses";
import type { CurrentLesson } from "./types";

const fallbackSlug = Object.entries(programmingLessonStateBySlug).find(([, state]) => state === "current")?.[0] ?? "variables";
const fallback: CurrentLesson = {
  courseSlug: "programming",
  lessonSlug: fallbackSlug,
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

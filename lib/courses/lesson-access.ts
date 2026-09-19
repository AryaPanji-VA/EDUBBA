// Lesson access derivation (Phase 20): single source of truth for the
// per-lesson presentation states on course pages. Client-safe and pure so the
// rules stay unit-testable.
//
// Progression is a RECOMMENDATION, never an access restriction: every
// implemented lesson is always open. Completion is keyed by lesson slug —
// never by position — so inserting new lessons cannot move or revoke
// existing completions.
import type { LessonPresentationState } from "@/data/courses";

export type LessonAccessInput = {
  // Static presentation fallback (offline backend). Only non-implemented
  // curriculum rows keep these values; implemented lessons are re-derived.
  fallbackStates: Record<string, LessonPresentationState>;
  // Implemented lesson slugs in beginner order (the trusted registry order).
  implementedSlugs: readonly string[];
  // Slugs with a persisted completion, keyed by lesson slug.
  completedSlugs: readonly string[];
  // Last-touched lesson from persisted progress (resume point), if any.
  resumeSlug?: string | null;
};

export type LessonAccessResult = {
  states: Record<string, LessonPresentationState>;
  nextSlug: string | null;
  resumeSlug: string | null;
};

// State rules:
// - every implemented lesson starts "available" and stays open — a learner
//   may open lessons out of order at any time;
// - completed lessons become "completed" and stay linkable (revisit anytime);
// - the last-touched incomplete implemented lesson is the resume point
//   ("current");
// - the first lesson without completion is the recommended next step ("next");
// - unimplemented curriculum rows keep their fallback state ("coming-soon")
//   and are never linkable (no lesson routes exist for them).
export function deriveLessonStates(input: LessonAccessInput): LessonAccessResult {
  const states = { ...input.fallbackStates };
  for (const slug of input.implementedSlugs) states[slug] = "available";
  const completed = new Set(input.completedSlugs);
  for (const slug of input.implementedSlugs) {
    if (completed.has(slug)) states[slug] = "completed";
  }
  const resumeSlug = input.resumeSlug && input.implementedSlugs.includes(input.resumeSlug) && !completed.has(input.resumeSlug)
    ? input.resumeSlug
    : null;
  const nextSlug = input.implementedSlugs.find((slug) => !completed.has(slug)) ?? null;
  if (resumeSlug) states[resumeSlug] = "current";
  if (nextSlug && nextSlug !== resumeSlug) states[nextSlug] = "next";
  return { states, nextSlug, resumeSlug };
}

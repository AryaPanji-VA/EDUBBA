import { notFound } from "next/navigation";
import { getLessonDefinition } from "@/lib/lessons/registry";
import { getLessonDisplay } from "@/lib/lessons/display";
import { LessonClient } from "@/components/lesson-client";

// Generic lesson route (Phase 15). Static lesson routes (e.g.
// /courses/programming/variables) take precedence over this dynamic route, so
// existing URLs are unchanged. Here, course ownership is validated against
// the trusted lesson registry — a mismatched course/lesson pair 404s instead
// of rendering content under the wrong course.
export default async function LessonPage({ params }: { params: Promise<{ courseSlug: string; lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params;
  const definition = getLessonDefinition(lessonSlug);
  if (!definition || definition.courseSlug !== courseSlug) notFound();
  if (!getLessonDisplay(lessonSlug)) notFound();
  return <LessonClient lessonSlug={lessonSlug} courseSlug={courseSlug} />;
}

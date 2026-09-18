import { notFound } from "next/navigation";
import { implementedLessonSlugsByCourse, coursePresentationBySlug } from "@/data/courses";
import { GenericCourseClient } from "@/components/generic-course-client";

// Generic course route (Phase 15). Static course routes (/courses/programming,
// /courses/discrete-math) take precedence; this page serves every other
// course with implemented lessons through the shared minimal course pattern.
export default async function CoursePage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const implemented = implementedLessonSlugsByCourse[courseSlug];
  const presentation = coursePresentationBySlug[courseSlug];
  if (!implemented || implemented.length === 0 || !presentation) notFound();
  return <GenericCourseClient courseSlug={courseSlug} courseCode={presentation.code} />;
}

import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Shared course overview loader — parameterized by course slug so every
// course with a seeded structure can serve the same overview shape.
// Course-specific error messages and setup hints stay in each API route.

export type CourseOverviewLesson = {
  slug: string;
  title: string;
  summary: string | null;
  position: number;
  estimatedMinutes: number;
};

export type CourseOverviewModule = {
  slug: string;
  title: string;
  description: string | null;
  position: number;
  lessons: CourseOverviewLesson[];
};

export type CourseOverview = {
  slug: string;
  title: string;
  description: string;
  modules: CourseOverviewModule[];
};

export type CourseOverviewError =
  | "course-read"
  | "course-not-found"
  | "module-read"
  | "no-modules"
  | "lesson-read"
  | "no-lessons"
  | "module-without-lessons";

export type CourseOverviewResult =
  | { ok: true; course: CourseOverview }
  | { ok: false; error: CourseOverviewError; moduleTitle?: string };

type DatabaseCourse = { id: string; slug: string; title: string; description: string };
type DatabaseModule = { id: string; slug: string; title: string; description: string | null; position: number };
type DatabaseLesson = { module_id: string; slug: string; title: string; summary: string | null; estimated_minutes: number; position: number };

export async function loadCourseOverview(courseSlug: string): Promise<CourseOverviewResult> {
  const supabase = createServerSupabaseClient();

  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select("id, slug, title, description")
    .eq("slug", courseSlug)
    .maybeSingle();

  if (courseError) return { ok: false, error: "course-read" };
  if (!courseData) return { ok: false, error: "course-not-found" };

  const course = courseData as DatabaseCourse;
  const { data: moduleData, error: moduleError } = await supabase
    .from("modules")
    .select("id, slug, title, description, position")
    .eq("course_id", course.id)
    .order("position", { ascending: true });

  if (moduleError) return { ok: false, error: "module-read" };
  const modules = (moduleData ?? []) as DatabaseModule[];
  if (modules.length === 0) return { ok: false, error: "no-modules" };

  const { data: lessonData, error: lessonError } = await supabase
    .from("lessons")
    .select("module_id, slug, title, summary, estimated_minutes, position")
    .in("module_id", modules.map((module) => module.id))
    .order("position", { ascending: true });

  if (lessonError) return { ok: false, error: "lesson-read" };
  const lessons = (lessonData ?? []) as DatabaseLesson[];
  if (lessons.length === 0) return { ok: false, error: "no-lessons" };

  const moduleWithoutLessons = modules.find(
    (module) => !lessons.some((lesson) => lesson.module_id === module.id),
  );
  if (moduleWithoutLessons) {
    return { ok: false, error: "module-without-lessons", moduleTitle: moduleWithoutLessons.title };
  }

  return {
    ok: true,
    course: {
      slug: course.slug,
      title: course.title,
      description: course.description,
      modules: modules.map((module) => ({
        slug: module.slug,
        title: module.title,
        description: module.description,
        position: module.position,
        lessons: lessons
          .filter((lesson) => lesson.module_id === module.id)
          .map((lesson) => ({
            slug: lesson.slug,
            title: lesson.title,
            summary: lesson.summary,
            position: lesson.position,
            estimatedMinutes: lesson.estimated_minutes,
          })),
      })),
    },
  };
}

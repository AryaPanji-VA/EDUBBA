import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type DatabaseCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
};

type DatabaseModule = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  position: number;
};

type DatabaseLesson = {
  module_id: string;
  slug: string;
  title: string;
  summary: string | null;
  estimated_minutes: number;
  position: number;
};

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id, slug, title, description")
      .eq("slug", "programming")
      .maybeSingle();

    if (courseError) {
      return Response.json(
        { error: "Unable to read the programming course from Supabase." },
        { status: 500 },
      );
    }

    if (!courseData) {
      return Response.json(
        { error: "Programming course not found. Run database/seed.sql first." },
        { status: 404 },
      );
    }

    const course = courseData as DatabaseCourse;
    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .select("id, slug, title, description, position")
      .eq("course_id", course.id)
      .order("position", { ascending: true });

    if (moduleError) {
      return Response.json(
        { error: "Unable to read modules. Run database/phase4-relations.sql and check its SELECT policy." },
        { status: 500 },
      );
    }

    const modules = (moduleData ?? []) as DatabaseModule[];

    if (modules.length === 0) {
      return Response.json(
        { error: "No programming modules found. Run database/phase4-seed.sql." },
        { status: 404 },
      );
    }

    const { data: lessonData, error: lessonError } = await supabase
      .from("lessons")
      .select("module_id, slug, title, summary, estimated_minutes, position")
      .in("module_id", modules.map((module) => module.id))
      .order("position", { ascending: true });

    if (lessonError) {
      return Response.json(
        { error: "Unable to read lessons. Check the lessons table and its SELECT policy." },
        { status: 500 },
      );
    }

    const lessons = (lessonData ?? []) as DatabaseLesson[];

    if (lessons.length === 0) {
      return Response.json(
        { error: "No programming lessons found. Run database/phase4-seed.sql." },
        { status: 404 },
      );
    }

    const moduleWithoutLessons = modules.find(
      (module) => !lessons.some((lesson) => lesson.module_id === module.id),
    );

    if (moduleWithoutLessons) {
      return Response.json(
        { error: `The ${moduleWithoutLessons.title} module has no lessons. Run database/phase4-seed.sql again.` },
        { status: 404 },
      );
    }

    return Response.json({
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
    });
  } catch {
    return Response.json(
      { error: "Supabase is not configured. Add the server environment variables, then restart Next.js." },
      { status: 503 },
    );
  }
}

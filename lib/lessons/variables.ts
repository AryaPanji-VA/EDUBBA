import "server-only";
import { variablesLessonContent } from "@/content/lessons/programming/variables";
import type { DeliveredLesson, LessonSource } from "@/content/lessons/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class LessonLoadError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

type DatabaseCourse = {
  id: string;
};

type DatabaseModule = {
  id: string;
  slug: string;
  title: string;
  position: number;
};

type DatabaseLesson = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  estimated_minutes: number;
};

type DatabaseLessonSource = {
  source_id: string;
  relevance_note: string | null;
};

type DatabaseSource = {
  id: string;
  title: string;
  url: string;
  publisher: string | null;
  source_type: LessonSource["sourceType"];
};

export async function loadVariablesLesson(): Promise<DeliveredLesson> {
  try {
    const supabase = createServerSupabaseClient();

    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", "programming")
      .maybeSingle();

    if (courseError) {
      throw new LessonLoadError("Unable to read the programming course from Supabase.", 500);
    }

    if (!courseData) {
      throw new LessonLoadError("Programming course not found. Run the earlier course seed first.", 404);
    }

    const course = courseData as DatabaseCourse;
    const { data: moduleData, error: moduleError } = await supabase
      .from("modules")
      .select("id, slug, title, position")
      .eq("course_id", course.id)
      .eq("slug", "programming-building-blocks")
      .maybeSingle();

    if (moduleError) {
      throw new LessonLoadError("Unable to read the Variables module from Supabase.", 500);
    }

    if (!moduleData) {
      throw new LessonLoadError("Programming Building Blocks module not found. Run database/phase4-seed.sql.", 404);
    }

    const courseModule = moduleData as DatabaseModule;
    const { data: lessonData, error: lessonError } = await supabase
      .from("lessons")
      .select("id, slug, title, summary, estimated_minutes")
      .eq("module_id", courseModule.id)
      .eq("slug", variablesLessonContent.slug)
      .maybeSingle();

    if (lessonError) {
      throw new LessonLoadError("Unable to read the Variables lesson from Supabase.", 500);
    }

    if (!lessonData) {
      throw new LessonLoadError("Variables lesson not found. Run database/phase4-seed.sql.", 404);
    }

    const lesson = lessonData as DatabaseLesson;
    const { data: linkData, error: linkError } = await supabase
      .from("lesson_sources")
      .select("source_id, relevance_note")
      .eq("lesson_id", lesson.id);

    if (linkError) {
      throw new LessonLoadError("Unable to read lesson source links. Run database/phase5-sources.sql.", 500);
    }

    const sourceLinks = (linkData ?? []) as DatabaseLessonSource[];

    if (sourceLinks.length === 0) {
      throw new LessonLoadError("Variables has no linked sources. Run database/phase5-seed.sql.", 404);
    }

    const { data: sourceData, error: sourceError } = await supabase
      .from("sources")
      .select("id, title, url, publisher, source_type")
      .in("id", sourceLinks.map((link) => link.source_id))
      .order("title", { ascending: true });

    if (sourceError) {
      throw new LessonLoadError("Unable to read lesson sources. Check the sources SELECT policy.", 500);
    }

    const databaseSources = (sourceData ?? []) as DatabaseSource[];

    if (databaseSources.length !== sourceLinks.length) {
      throw new LessonLoadError("One or more Variables source records are missing. Run database/phase5-seed.sql again.", 404);
    }

    const sources: LessonSource[] = databaseSources.map((source) => ({
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      sourceType: source.source_type,
      relevanceNote: sourceLinks.find((link) => link.source_id === source.id)?.relevance_note ?? null,
    }));

    return {
        slug: lesson.slug,
        title: lesson.title,
        summary: lesson.summary,
        estimatedMinutes: lesson.estimated_minutes,
        module: {
          slug: courseModule.slug,
          title: courseModule.title,
          position: courseModule.position,
        },
        content: variablesLessonContent,
        sources,
    };
  } catch (error) {
    if (error instanceof LessonLoadError) throw error;
    throw new LessonLoadError("Supabase is not configured. Add the server environment variables, then restart Next.js.", 503);
  }
}

import "server-only";
import { printOutputLessonContent } from "@/content/lessons/programming/print-output";
import type { DeliveredLesson, LessonSource } from "@/content/lessons/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class PrintOutputLoadError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function loadPrintOutputLesson(): Promise<DeliveredLesson> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: course, error: courseError } = await supabase.from("courses").select("id").eq("slug", "programming").maybeSingle();
    if (courseError) throw new PrintOutputLoadError("Unable to read the Programming course.", 500);
    if (!course) throw new PrintOutputLoadError("Programming course not found.", 404);

    const { data: module, error: moduleError } = await supabase.from("modules").select("id, slug, title, position")
      .eq("course_id", course.id).eq("slug", "programming-fundamentals").maybeSingle();
    if (moduleError) throw new PrintOutputLoadError("Unable to read the Programming Fundamentals module.", 500);
    if (!module) throw new PrintOutputLoadError("Programming Fundamentals module not found. Run database/phase4-seed.sql.", 404);

    const { data: lesson, error: lessonError } = await supabase.from("lessons").select("id, slug, title, summary, estimated_minutes")
      .eq("module_id", module.id).eq("slug", "print-output").maybeSingle();
    if (lessonError) throw new PrintOutputLoadError("Unable to read the lesson.", 500);
    if (!lesson) throw new PrintOutputLoadError("Lesson not found. Run database/phase20-1c-print-output.sql.", 404);

    const { data: links, error: linkError } = await supabase.from("lesson_sources").select("source_id, relevance_note").eq("lesson_id", lesson.id);
    if (linkError) throw new PrintOutputLoadError("Unable to read lesson source links.", 500);
    const sourceLinks = (links ?? []) as { source_id: string; relevance_note: string | null }[];
    const sources: LessonSource[] = [];
    if (sourceLinks.length > 0) {
      const { data, error } = await supabase.from("sources").select("id, title, url, publisher, source_type")
        .in("id", sourceLinks.map((link) => link.source_id)).order("title", { ascending: true });
      if (error) throw new PrintOutputLoadError("Unable to read lesson sources.", 500);
      sources.push(...(data ?? []).map((source) => ({
        title: source.title, publisher: source.publisher, url: source.url, sourceType: source.source_type,
        relevanceNote: sourceLinks.find((link) => link.source_id === source.id)?.relevance_note ?? null,
      })));
    }

    return {
      slug: lesson.slug, title: lesson.title, summary: lesson.summary, estimatedMinutes: lesson.estimated_minutes,
      module: { slug: module.slug, title: module.title, position: module.position },
      content: printOutputLessonContent, sources,
    };
  } catch (error) {
    if (error instanceof PrintOutputLoadError) throw error;
    throw new PrintOutputLoadError("Supabase is not configured. Add the server environment variables, then restart Next.js.", 503);
  }
}

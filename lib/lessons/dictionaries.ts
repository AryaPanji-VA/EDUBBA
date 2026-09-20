import "server-only";
import { dictionariesLessonContent } from "@/content/lessons/programming/dictionaries";
import type { DeliveredLesson, LessonSource } from "@/content/lessons/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class DictionariesLoadError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function loadDictionariesLesson(): Promise<DeliveredLesson> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: course, error: courseError } = await supabase.from("courses").select("id").eq("slug", "programming").maybeSingle();
    if (courseError) throw new DictionariesLoadError("Unable to read the Programming course.", 500);
    if (!course) throw new DictionariesLoadError("Programming course not found.", 404);

    const { data: module, error: moduleError } = await supabase.from("modules").select("id, slug, title, position")
      .eq("course_id", course.id).eq("slug", "programming-building-blocks").maybeSingle();
    if (moduleError) throw new DictionariesLoadError("Unable to read the Programming Building Blocks module.", 500);
    if (!module) throw new DictionariesLoadError("Programming Building Blocks module not found. Run database/phase4-seed.sql.", 404);

    const { data: lesson, error: lessonError } = await supabase.from("lessons").select("id, slug, title, summary, estimated_minutes")
      .eq("module_id", module.id).eq("slug", "dictionaries").maybeSingle();
    if (lessonError) throw new DictionariesLoadError("Unable to read the lesson.", 500);
    if (!lesson) throw new DictionariesLoadError("Dictionaries lesson not found. Run database/phase20-6-module06.sql.", 404);

    const { data: links, error: linkError } = await supabase.from("lesson_sources").select("source_id, relevance_note").eq("lesson_id", lesson.id);
    if (linkError) throw new DictionariesLoadError("Unable to read lesson source links.", 500);
    const sourceLinks = (links ?? []) as { source_id: string; relevance_note: string | null }[];
    const sources: LessonSource[] = [];
    if (sourceLinks.length > 0) {
      const { data, error } = await supabase.from("sources").select("id, title, url, publisher, source_type")
        .in("id", sourceLinks.map((link) => link.source_id)).order("title", { ascending: true });
      if (error) throw new DictionariesLoadError("Unable to read lesson sources.", 500);
      sources.push(...(data ?? []).map((source) => ({
        title: source.title, publisher: source.publisher, url: source.url, sourceType: source.source_type,
        relevanceNote: sourceLinks.find((link) => link.source_id === source.id)?.relevance_note ?? null,
      })));
    }

    return {
      slug: lesson.slug, title: lesson.title, summary: lesson.summary, estimatedMinutes: lesson.estimated_minutes,
      module: { slug: module.slug, title: module.title, position: module.position },
      content: dictionariesLessonContent, sources,
    };
  } catch (error) {
    if (error instanceof DictionariesLoadError) throw error;
    throw new DictionariesLoadError("Supabase is not configured. Add the server environment variables, then restart Next.js.", 503);
  }
}

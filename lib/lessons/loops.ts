import "server-only";
import { loopsLessonContent } from "@/content/lessons/programming/loops";
import type { DeliveredLesson, LessonSource } from "@/content/lessons/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class LoopsLoadError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function loadLoopsLesson(): Promise<DeliveredLesson> {
  try {
    const supabase = createServerSupabaseClient();

    const { data: courseData, error: courseError } = await supabase
      .from("courses").select("id").eq("slug", "programming").maybeSingle();
    if (courseError) throw new LoopsLoadError("Unable to read the programming course.", 500);
    if (!courseData) throw new LoopsLoadError("Programming course not found.", 404);

    const { data: moduleData, error: moduleError } = await supabase
      .from("modules").select("id, slug, title, position")
      .eq("course_id", courseData.id).eq("slug", "programming-building-blocks").maybeSingle();
    if (moduleError) throw new LoopsLoadError("Unable to read the Loops module.", 500);
    if (!moduleData) throw new LoopsLoadError("Module not found.", 404);

    const { data: lessonData, error: lessonError } = await supabase
      .from("lessons").select("id, slug, title, summary, estimated_minutes")
      .eq("module_id", moduleData.id).eq("slug", "loops").maybeSingle();
    if (lessonError) throw new LoopsLoadError("Unable to read the Loops lesson.", 500);
    if (!lessonData) throw new LoopsLoadError("Loops lesson not found. Run database/phase4-seed.sql.", 404);

    const { data: linkData, error: linkError } = await supabase
      .from("lesson_sources").select("source_id, relevance_note").eq("lesson_id", lessonData.id);
    if (linkError) throw new LoopsLoadError("Unable to read lesson source links.", 500);

    const sourceLinks = (linkData ?? []) as { source_id: string; relevance_note: string | null }[];
    const sources: LessonSource[] = [];

    if (sourceLinks.length > 0) {
      const { data: sourceData, error: sourceError } = await supabase
        .from("sources").select("id, title, url, publisher, source_type")
        .in("id", sourceLinks.map((link) => link.source_id)).order("title", { ascending: true });
      if (sourceError) throw new LoopsLoadError("Unable to read lesson sources.", 500);
      const databaseSources = sourceData ?? [];
      sources.push(...databaseSources.map((source) => ({
        title: source.title, publisher: source.publisher, url: source.url,
        sourceType: source.source_type,
        relevanceNote: sourceLinks.find((link) => link.source_id === source.id)?.relevance_note ?? null,
      })));
    }

    return {
      slug: lessonData.slug,
      title: lessonData.title,
      summary: lessonData.summary,
      estimatedMinutes: lessonData.estimated_minutes,
      module: { slug: moduleData.slug, title: moduleData.title, position: moduleData.position },
      content: loopsLessonContent,
      sources,
    };
  } catch (error) {
    if (error instanceof LoopsLoadError) throw error;
    throw new LoopsLoadError("Supabase is not configured. Add the server environment variables, then restart Next.js.", 503);
  }
}

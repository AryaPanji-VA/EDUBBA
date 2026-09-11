import "server-only";
import { dataTypesLessonContent } from "@/content/lessons/programming/data-types";
import type { DeliveredLesson, LessonSource } from "@/content/lessons/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class DataTypesLoadError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function loadDataTypesLesson(): Promise<DeliveredLesson> {
  try {
    const supabase = createServerSupabaseClient();

    const { data: courseData, error: courseError } = await supabase
      .from("courses").select("id").eq("slug", "programming").maybeSingle();
    if (courseError) throw new DataTypesLoadError("Unable to read the programming course.", 500);
    if (!courseData) throw new DataTypesLoadError("Programming course not found.", 404);

    const { data: moduleData, error: moduleError } = await supabase
      .from("modules").select("id, slug, title, position")
      .eq("course_id", courseData.id).eq("slug", "programming-building-blocks").maybeSingle();
    if (moduleError) throw new DataTypesLoadError("Unable to read the Data Types module.", 500);
    if (!moduleData) throw new DataTypesLoadError("Module not found.", 404);

    const { data: lessonData, error: lessonError } = await supabase
      .from("lessons").select("id, slug, title, summary, estimated_minutes")
      .eq("module_id", moduleData.id).eq("slug", "data-types").maybeSingle();
    if (lessonError) throw new DataTypesLoadError("Unable to read the Data Types lesson.", 500);
    if (!lessonData) throw new DataTypesLoadError("Data Types lesson not found. Run the seed SQL.", 404);

    const { data: linkData, error: linkError } = await supabase
      .from("lesson_sources").select("source_id, relevance_note").eq("lesson_id", lessonData.id);
    if (linkError) throw new DataTypesLoadError("Unable to read lesson source links.", 500);

    const sourceLinks = linkData ?? [];
    const sources: LessonSource[] = [];

    if (sourceLinks.length > 0) {
      const { data: sourceData, error: sourceError } = await supabase
        .from("sources").select("id, title, url, publisher, source_type")
        .in("id", sourceLinks.map((link) => link.source_id)).order("title", { ascending: true });
      if (sourceError) throw new DataTypesLoadError("Unable to read lesson sources.", 500);
      const databaseSources = sourceData ?? [];
      sources.push(...databaseSources.map((source) => ({
        title: source.title, publisher: source.publisher, url: source.url,
        sourceType: source.source_type,
        relevanceNote: sourceLinks.find((link) => link.source_id === source.id)?.relevance_note ?? null,
      })));
    }

    return {
      slug: lessonData.slug, title: lessonData.title, summary: lessonData.summary,
      estimatedMinutes: lessonData.estimated_minutes,
      module: { slug: moduleData.slug, title: moduleData.title, position: moduleData.position },
      content: dataTypesLessonContent, sources,
    };
  } catch (error) {
    if (error instanceof DataTypesLoadError) throw error;
    throw new DataTypesLoadError("Supabase is not configured.", 503);
  }
}

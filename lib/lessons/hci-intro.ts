import "server-only";
import { hciIntroLessonContent } from "@/content/lessons/hci/hci-intro";
import type { DeliveredLesson, LessonSource } from "@/content/lessons/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class HciIntroLoadError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function loadHciIntroLesson(): Promise<DeliveredLesson> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: course, error: courseError } = await supabase.from("courses").select("id").eq("slug", "hci").maybeSingle();
    if (courseError) throw new HciIntroLoadError("Unable to read the HCI course.", 500);
    if (!course) throw new HciIntroLoadError("HCI course not found.", 404);

    const { data: module, error: moduleError } = await supabase.from("modules").select("id, slug, title, position")
      .eq("course_id", course.id).eq("slug", "hci-foundations").maybeSingle();
    if (moduleError) throw new HciIntroLoadError("Unable to read the HCI Foundations module.", 500);
    if (!module) throw new HciIntroLoadError("HCI Foundations module not found. Run database/phase15-semester1-structure.sql in Supabase.", 404);

    const { data: lesson, error: lessonError } = await supabase.from("lessons").select("id, slug, title, summary, estimated_minutes")
      .eq("module_id", module.id).eq("slug", "hci-intro").maybeSingle();
    if (lessonError) throw new HciIntroLoadError("Unable to read the lesson.", 500);
    if (!lesson) throw new HciIntroLoadError("Lesson not found. Run database/phase15-semester1-structure.sql in Supabase.", 404);

    const { data: links, error: linkError } = await supabase.from("lesson_sources").select("source_id, relevance_note").eq("lesson_id", lesson.id);
    if (linkError) throw new HciIntroLoadError("Unable to read lesson source links.", 500);
    const sourceLinks = (links ?? []) as { source_id: string; relevance_note: string | null }[];
    const sources: LessonSource[] = [];
    if (sourceLinks.length > 0) {
      const { data, error } = await supabase.from("sources").select("id, title, url, publisher, source_type")
        .in("id", sourceLinks.map((link) => link.source_id)).order("title", { ascending: true });
      if (error) throw new HciIntroLoadError("Unable to read lesson sources.", 500);
      sources.push(...(data ?? []).map((source) => ({
        title: source.title, publisher: source.publisher, url: source.url, sourceType: source.source_type,
        relevanceNote: sourceLinks.find((link) => link.source_id === source.id)?.relevance_note ?? null,
      })));
    }

    return {
      slug: lesson.slug, title: lesson.title, summary: lesson.summary, estimatedMinutes: lesson.estimated_minutes,
      module: { slug: module.slug, title: module.title, position: module.position },
      content: hciIntroLessonContent, sources,
    };
  } catch (error) {
    if (error instanceof HciIntroLoadError) throw error;
    throw new HciIntroLoadError("Supabase is not configured. Add the server environment variables, then restart Next.js.", 503);
  }
}

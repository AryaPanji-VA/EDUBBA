import "server-only";
import { packetsAndProtocolsLessonContent } from "@/content/lessons/networking/packets-and-protocols";
import type { DeliveredLesson, LessonSource } from "@/content/lessons/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class PacketsAndProtocolsLoadError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function loadPacketsAndProtocolsLesson(): Promise<DeliveredLesson> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: course, error: courseError } = await supabase.from("courses").select("id").eq("slug", "networking").maybeSingle();
    if (courseError) throw new PacketsAndProtocolsLoadError("Unable to read the Networking course.", 500);
    if (!course) throw new PacketsAndProtocolsLoadError("Networking course not found.", 404);

    const { data: module, error: moduleError } = await supabase.from("modules").select("id, slug, title, position")
      .eq("course_id", course.id).eq("slug", "network-foundations").maybeSingle();
    if (moduleError) throw new PacketsAndProtocolsLoadError("Unable to read the Network Foundations module.", 500);
    if (!module) throw new PacketsAndProtocolsLoadError("Network Foundations module not found. Run database/phase15-semester1-structure.sql in Supabase.", 404);

    const { data: lesson, error: lessonError } = await supabase.from("lessons").select("id, slug, title, summary, estimated_minutes")
      .eq("module_id", module.id).eq("slug", "packets-and-protocols").maybeSingle();
    if (lessonError) throw new PacketsAndProtocolsLoadError("Unable to read the lesson.", 500);
    if (!lesson) throw new PacketsAndProtocolsLoadError("Lesson not found. Run database/phase15-semester1-structure.sql in Supabase.", 404);

    const { data: links, error: linkError } = await supabase.from("lesson_sources").select("source_id, relevance_note").eq("lesson_id", lesson.id);
    if (linkError) throw new PacketsAndProtocolsLoadError("Unable to read lesson source links.", 500);
    const sourceLinks = (links ?? []) as { source_id: string; relevance_note: string | null }[];
    const sources: LessonSource[] = [];
    if (sourceLinks.length > 0) {
      const { data, error } = await supabase.from("sources").select("id, title, url, publisher, source_type")
        .in("id", sourceLinks.map((link) => link.source_id)).order("title", { ascending: true });
      if (error) throw new PacketsAndProtocolsLoadError("Unable to read lesson sources.", 500);
      sources.push(...(data ?? []).map((source) => ({
        title: source.title, publisher: source.publisher, url: source.url, sourceType: source.source_type,
        relevanceNote: sourceLinks.find((link) => link.source_id === source.id)?.relevance_note ?? null,
      })));
    }

    return {
      slug: lesson.slug, title: lesson.title, summary: lesson.summary, estimatedMinutes: lesson.estimated_minutes,
      module: { slug: module.slug, title: module.title, position: module.position },
      content: packetsAndProtocolsLessonContent, sources,
    };
  } catch (error) {
    if (error instanceof PacketsAndProtocolsLoadError) throw error;
    throw new PacketsAndProtocolsLoadError("Supabase is not configured. Add the server environment variables, then restart Next.js.", 503);
  }
}

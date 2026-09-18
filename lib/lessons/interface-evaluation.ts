import "server-only";
import { interfaceEvaluationLessonContent } from "@/content/lessons/hci/interface-evaluation";
import type { DeliveredLesson, LessonSource } from "@/content/lessons/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export class InterfaceEvaluationLoadError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function loadInterfaceEvaluationLesson(): Promise<DeliveredLesson> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: course, error: courseError } = await supabase.from("courses").select("id").eq("slug", "hci").maybeSingle();
    if (courseError) throw new InterfaceEvaluationLoadError("Unable to read the HCI course.", 500);
    if (!course) throw new InterfaceEvaluationLoadError("HCI course not found.", 404);

    const { data: module, error: moduleError } = await supabase.from("modules").select("id, slug, title, position")
      .eq("course_id", course.id).eq("slug", "hci-foundations").maybeSingle();
    if (moduleError) throw new InterfaceEvaluationLoadError("Unable to read the HCI Foundations module.", 500);
    if (!module) throw new InterfaceEvaluationLoadError("HCI Foundations module not found. Run database/phase15-semester1-structure.sql in Supabase.", 404);

    const { data: lesson, error: lessonError } = await supabase.from("lessons").select("id, slug, title, summary, estimated_minutes")
      .eq("module_id", module.id).eq("slug", "interface-evaluation").maybeSingle();
    if (lessonError) throw new InterfaceEvaluationLoadError("Unable to read the lesson.", 500);
    if (!lesson) throw new InterfaceEvaluationLoadError("Lesson not found. Run database/phase15-semester1-structure.sql in Supabase.", 404);

    const { data: links, error: linkError } = await supabase.from("lesson_sources").select("source_id, relevance_note").eq("lesson_id", lesson.id);
    if (linkError) throw new InterfaceEvaluationLoadError("Unable to read lesson source links.", 500);
    const sourceLinks = (links ?? []) as { source_id: string; relevance_note: string | null }[];
    const sources: LessonSource[] = [];
    if (sourceLinks.length > 0) {
      const { data, error } = await supabase.from("sources").select("id, title, url, publisher, source_type")
        .in("id", sourceLinks.map((link) => link.source_id)).order("title", { ascending: true });
      if (error) throw new InterfaceEvaluationLoadError("Unable to read lesson sources.", 500);
      sources.push(...(data ?? []).map((source) => ({
        title: source.title, publisher: source.publisher, url: source.url, sourceType: source.source_type,
        relevanceNote: sourceLinks.find((link) => link.source_id === source.id)?.relevance_note ?? null,
      })));
    }

    return {
      slug: lesson.slug, title: lesson.title, summary: lesson.summary, estimatedMinutes: lesson.estimated_minutes,
      module: { slug: module.slug, title: module.title, position: module.position },
      content: interfaceEvaluationLessonContent, sources,
    };
  } catch (error) {
    if (error instanceof InterfaceEvaluationLoadError) throw error;
    throw new InterfaceEvaluationLoadError("Supabase is not configured. Add the server environment variables, then restart Next.js.", 503);
  }
}

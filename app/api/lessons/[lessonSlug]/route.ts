import { getLessonDefinition } from "@/lib/lessons/registry";

export const dynamic = "force-dynamic";

// Generic lesson API (Phase 15). Static per-lesson routes take precedence
// where they exist; this route serves every registered lesson through its
// trusted loader.
export async function GET(_request: Request, { params }: { params: Promise<{ lessonSlug: string }> }) {
  const { lessonSlug } = await params;
  const definition = getLessonDefinition(lessonSlug);
  if (!definition) {
    return Response.json({ error: "Lesson not registered." }, { status: 404 });
  }
  try {
    return Response.json({ lesson: await definition.loadLesson() });
  } catch (error) {
    const status = error instanceof Error && typeof (error as { status?: unknown }).status === "number"
      ? (error as unknown as { status: number }).status
      : 500;
    const message = error instanceof Error ? error.message : `Unable to load ${lessonSlug}.`;
    return Response.json({ error: message }, { status });
  }
}

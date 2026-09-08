import { LessonLoadError, loadVariablesLesson } from "@/lib/lessons/variables";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json({ lesson: await loadVariablesLesson() });
  } catch (error) {
    return Response.json(
      { error: error instanceof LessonLoadError ? error.message : "Unable to load Variables." },
      { status: error instanceof LessonLoadError ? error.status : 500 },
    );
  }
}

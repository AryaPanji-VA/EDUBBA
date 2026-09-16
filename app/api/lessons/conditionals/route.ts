import { ConditionalsLoadError, loadConditionalsLesson } from "@/lib/lessons/conditionals";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json({ lesson: await loadConditionalsLesson() });
  } catch (error) {
    return Response.json(
      { error: error instanceof ConditionalsLoadError ? error.message : "Unable to load Conditionals." },
      { status: error instanceof ConditionalsLoadError ? error.status : 500 },
    );
  }
}

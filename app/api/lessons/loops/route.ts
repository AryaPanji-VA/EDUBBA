import { LoopsLoadError, loadLoopsLesson } from "@/lib/lessons/loops";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json({ lesson: await loadLoopsLesson() });
  } catch (error) {
    return Response.json(
      { error: error instanceof LoopsLoadError ? error.message : "Unable to load Loops." },
      { status: error instanceof LoopsLoadError ? error.status : 500 },
    );
  }
}

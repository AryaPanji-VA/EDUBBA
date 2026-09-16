import { FunctionsLoadError, loadFunctionsLesson } from "@/lib/lessons/functions";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json({ lesson: await loadFunctionsLesson() });
  } catch (error) {
    return Response.json(
      { error: error instanceof FunctionsLoadError ? error.message : "Unable to load Functions." },
      { status: error instanceof FunctionsLoadError ? error.status : 500 },
    );
  }
}

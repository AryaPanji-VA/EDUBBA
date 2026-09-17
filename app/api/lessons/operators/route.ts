import { OperatorsLoadError, loadOperatorsLesson } from "@/lib/lessons/operators";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ lesson: await loadOperatorsLesson() });
  } catch (error) {
    return Response.json(
      { error: error instanceof OperatorsLoadError ? error.message : "Unable to load Operators." },
      { status: error instanceof OperatorsLoadError ? error.status : 500 },
    );
  }
}

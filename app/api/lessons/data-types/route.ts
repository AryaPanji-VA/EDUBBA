import { DataTypesLoadError, loadDataTypesLesson } from "@/lib/lessons/data-types";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json({ lesson: await loadDataTypesLesson() });
  } catch (error) {
    return Response.json(
      { error: error instanceof DataTypesLoadError ? error.message : "Unable to load Data Types." },
      { status: error instanceof DataTypesLoadError ? error.status : 500 },
    );
  }
}

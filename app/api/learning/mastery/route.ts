import { requireLocalMastery, loadMasterySummary } from "@/lib/mastery/server";
import { getLessonDefinition } from "@/lib/lessons/registry";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const localUserId = requireLocalMastery(request);
    const lesson = new URL(request.url).searchParams.get("lesson") ?? "";
    if (!getLessonDefinition(lesson)) return Response.json({ error: "Lesson not registered." }, { status: 400 });
    return Response.json(await loadMasterySummary(localUserId, lesson), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Mastery unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

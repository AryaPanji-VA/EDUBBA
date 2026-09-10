import { requireLocalMastery, loadMasterySummary } from "@/lib/mastery/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    requireLocalMastery(request);
    const lesson = new URL(request.url).searchParams.get("lesson");
    if (lesson !== "variables") return Response.json({ error: "Only Variables is supported." }, { status: 400 });
    return Response.json(await loadMasterySummary("variables"), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Mastery unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

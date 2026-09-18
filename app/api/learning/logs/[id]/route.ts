import { requireLocalLog, logResponse, logFailure, updateLogSummary, deleteLog } from "@/lib/learning-log/server";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const localUserId = requireLocalLog(request);
    const { id } = await params;
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
      return logResponse({ error: "Kirim request sebagai JSON." }, 415);
    }
    let body: unknown;
    try { body = await request.json(); } catch { return logResponse({ error: "JSON tidak valid." }, 400); }
    if (!body || typeof body !== "object" || typeof (body as Record<string, unknown>).summary !== "string") {
      return logResponse({ error: "Butuh field summary." }, 400);
    }
    await updateLogSummary(localUserId, id, (body as Record<string, unknown>).summary as string);
    return logResponse({ ok: true });
  } catch (error) {
    return logFailure(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const localUserId = requireLocalLog(request);
    const { id } = await params;
    await deleteLog(localUserId, id);
    return logResponse({ ok: true });
  } catch (error) {
    return logFailure(error);
  }
}

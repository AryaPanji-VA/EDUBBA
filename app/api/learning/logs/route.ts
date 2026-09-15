import { requireLocalLog, logResponse, logFailure, listRecentLogs, createLog, validateLearningLog } from "@/lib/learning-log/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    requireLocalLog(request);
    const logs = await listRecentLogs(5);
    return logResponse({ logs });
  } catch (error) {
    return logFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    requireLocalLog(request);
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
      return logResponse({ error: "Kirim request sebagai JSON." }, 415);
    }
    const reader = request.body?.getReader();
    if (!reader) return logResponse({ error: "Request body kosong." }, 400);
    const decoder = new TextDecoder();
    let text = "";
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8_192) { await reader.cancel(); return logResponse({ error: "Request terlalu panjang." }, 413); }
      text += decoder.decode(value, { stream: true });
    }
    let body: unknown;
    try { body = JSON.parse(text + decoder.decode()); } catch { return logResponse({ error: "JSON tidak valid." }, 400); }
    const input = validateLearningLog(body);
    if (!input) return logResponse({ error: "Data log tidak valid. Butuh courseSlug, lessonSlug, summary." }, 400);
    const log = await createLog(input);
    return logResponse({ log });
  } catch (error) {
    return logFailure(error);
  }
}

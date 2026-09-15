import { requireLocalProgress, progressResponse, progressFailure, loadProgress, saveProgress, loadCurrentLesson, validateProgressInput } from "@/lib/progress/server";
import { getLessonDefinition } from "@/lib/lessons/registry";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    requireLocalProgress(request);
    const lesson = new URL(request.url).searchParams.get("lesson");
    if (!lesson) {
      // No lesson param: return the current/last lesson from persisted progress.
      const current = await loadCurrentLesson();
      return progressResponse({ current });
    }
    if (!getLessonDefinition(lesson)) return progressResponse({ error: "Lesson not registered." }, 400);
    const progress = await loadProgress("programming", lesson);
    return progressResponse({ progress });
  } catch (error) {
    return progressFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    requireLocalProgress(request);
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
      return progressResponse({ error: "Kirim request sebagai JSON." }, 415);
    }
    const reader = request.body?.getReader();
    if (!reader) return progressResponse({ error: "Request body kosong." }, 400);
    const decoder = new TextDecoder();
    let text = "";
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8_192) { await reader.cancel(); return progressResponse({ error: "Request terlalu panjang." }, 413); }
      text += decoder.decode(value, { stream: true });
    }
    let body: unknown;
    try { body = JSON.parse(text + decoder.decode()); } catch { return progressResponse({ error: "JSON tidak valid." }, 400); }
    const input = validateProgressInput(body);
    if (!input) return progressResponse({ error: "Data progress tidak valid. Butuh courseSlug, lessonSlug." }, 400);
    const definition = getLessonDefinition(input.lessonSlug);
    if (!definition || input.courseSlug !== "programming") return progressResponse({ error: "Lesson tidak terdaftar." }, 400);
    const activityIds = new Set(definition.activities.map((activity) => activity.id));
    if ((input.currentActivityId && !activityIds.has(input.currentActivityId)) ||
        input.completedActivityIds?.some((id) => !activityIds.has(id)) ||
        Object.keys(input.progressState?.answers ?? {}).some((id) => !activityIds.has(id))) {
      return progressResponse({ error: "Activity progress tidak valid." }, 400);
    }
    return progressResponse(await saveProgress(input));
  } catch (error) {
    return progressFailure(error);
  }
}

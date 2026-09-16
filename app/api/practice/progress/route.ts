import { requireLocalPractice, practiceResponse, practiceFailure, loadPracticeProgress, savePracticeProgress, validatePracticeProgressInput } from "@/lib/practice/server";
import { getPracticeProgressDefinition } from "@/lib/practice/progress-registry";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    requireLocalPractice(request);
    const track = new URL(request.url).searchParams.get("track") ?? "";
    if (!getPracticeProgressDefinition(track)) return practiceResponse({ error: "Practice track not registered." }, 400);
    const progress = await loadPracticeProgress(track);
    return practiceResponse({ progress });
  } catch (error) {
    return practiceFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    requireLocalPractice(request);
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
      return practiceResponse({ error: "Kirim request sebagai JSON." }, 415);
    }
    const reader = request.body?.getReader();
    if (!reader) return practiceResponse({ error: "Request body kosong." }, 400);
    const decoder = new TextDecoder();
    let text = "";
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 12_000) { await reader.cancel(); return practiceResponse({ error: "Request terlalu panjang." }, 413); }
      text += decoder.decode(value, { stream: true });
    }
    let body: unknown;
    try { body = JSON.parse(text + decoder.decode()); } catch { return practiceResponse({ error: "JSON tidak valid." }, 400); }
    const input = validatePracticeProgressInput(body);
    if (!input) return practiceResponse({ error: "Data progress tidak valid. Butuh courseSlug." }, 400);
    const track = getPracticeProgressDefinition(input.courseSlug);
    if (!track) return practiceResponse({ error: "Practice track tidak terdaftar." }, 400);
    const exerciseIds = new Set(track.activityIds);
    if ((input.currentExerciseId && !exerciseIds.has(input.currentExerciseId)) ||
        input.completedExerciseIds?.some((id) => !exerciseIds.has(id)) ||
        Object.keys(input.progressState?.attempts ?? {}).some((id) => !exerciseIds.has(id))) {
      return practiceResponse({ error: "Exercise progress tidak valid." }, 400);
    }
    return practiceResponse(await savePracticeProgress(input));
  } catch (error) {
    return practiceFailure(error);
  }
}

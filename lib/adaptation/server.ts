import "server-only";
import { loadMasterySummary, requireLocalMastery } from "@/lib/mastery/server";
import { buildAdaptation, adaptationContext, type Adaptation } from "./policy";

export async function loadAdaptation(request: Request, lesson: string, concepts: readonly string[], currentAnswer?: { concept: string; isCorrect: boolean }): Promise<Adaptation> {
  try {
    if (!concepts.length) return { concepts: [] };
    requireLocalMastery(request);
    const summary = await loadMasterySummary(lesson);
    if (summary.lesson !== lesson) return { concepts: [] };
    return buildAdaptation(summary.concepts, concepts, currentAnswer);
  } catch {
    // No raw database errors or profile data in logs. Existing teaching still works.
    return { concepts: [] };
  }
}

export async function loadAdaptationContext(request: Request, lesson: string, concepts: readonly string[], currentAnswer?: { concept: string; isCorrect: boolean }): Promise<string> {
  try { return adaptationContext(await loadAdaptation(request, lesson, concepts, currentAnswer)); }
  catch { return ""; }
}

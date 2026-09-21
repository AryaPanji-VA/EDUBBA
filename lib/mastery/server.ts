import "server-only";
import { createMemorySupabaseClient } from "@/lib/supabase/memory-server";
import { applyEvidence } from "./engine";
import { type ConceptMastery, type MasterySummary } from "./types";
import { getLessonDefinition } from "@/lib/lessons/registry";
import { requireLocalUserId } from "@/lib/local-user/server";

const columns = "local_user_id,lesson_slug,concept_key,state,evidence_count,success_count,struggle_count,last_evidence_type,last_evidence_at,last_attempt_id";

export function requireLocalMastery(request: Request) {
  return requireLocalUserId(request);
}

// Best-effort evidence recording: mastery never blocks learning.
export async function recordEvidence(localUserId: string, lessonSlug: string, concept: string, evidenceType: string, attemptId: string): Promise<void> {
  try {
    const client = createMemorySupabaseClient();
    const { data, error: readError } = await client.from("concept_mastery")
      .select(columns).eq("local_user_id", localUserId).eq("lesson_slug", lessonSlug).eq("concept_key", concept).maybeSingle();
    if (readError) throw new Error("Mastery read unavailable");
    const current = (data ?? null) as ConceptMastery | null;
    const updated = applyEvidence(current, lessonSlug, concept, evidenceType, attemptId);
    const { error: writeError } = await client.from("concept_mastery").upsert({
      local_user_id: localUserId,
      lesson_slug: updated.lesson_slug, concept_key: updated.concept_key, state: updated.state,
      evidence_count: updated.evidence_count, success_count: updated.success_count, struggle_count: updated.struggle_count,
      last_evidence_type: updated.last_evidence_type, last_evidence_at: updated.last_evidence_at,
      last_attempt_id: updated.last_attempt_id,
    }, { onConflict: "local_user_id,lesson_slug,concept_key" });
    if (writeError) throw new Error("Mastery write unavailable");
  } catch {
    console.warn("[ROBIN MASTERY] Evidence recording unavailable; learning continues.");
  }
}

export async function loadMasterySummary(localUserId: string, lessonSlug: string): Promise<MasterySummary> {
  const definition = getLessonDefinition(lessonSlug);
  const concepts = definition?.mastery.concepts ?? [];
  try {
    const client = createMemorySupabaseClient();
    const { data } = await client.from("concept_mastery")
      .select(columns).eq("local_user_id", localUserId).eq("lesson_slug", lessonSlug);
    const rows = (data ?? []) as ConceptMastery[];
    const byConcept = new Map(rows.map((row) => [row.concept_key, row]));
    return {
      lesson: lessonSlug,
      concepts: concepts.map((concept) => {
        const row = byConcept.get(concept);
        return { concept, state: row?.state ?? "unseen", evidenceCount: row?.evidence_count ?? 0 };
      }),
    };
  } catch {
    return {
      lesson: lessonSlug,
      concepts: concepts.map((concept) => ({ concept, state: "unseen" as const, evidenceCount: 0 })),
    };
  }
}

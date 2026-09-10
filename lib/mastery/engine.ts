import { type ConceptMastery, type EvidenceType, type MasteryState, evidenceTypes } from "./types";

function isValidEvidence(evidenceType: string): evidenceType is EvidenceType {
  return (evidenceTypes as readonly string[]).includes(evidenceType);
}

function weight(evidenceType: EvidenceType): { success: number; struggle: number } {
  switch (evidenceType) {
    case "correct_prediction": case "correct_practice": return { success: 1, struggle: 0 };
    case "incorrect_prediction": case "incorrect_practice": return { success: 0, struggle: 1 };
    case "robin_check_strong": return { success: 2, struggle: 0 };
    case "robin_check_developing": return { success: 1, struggle: 0 };
    case "robin_check_shaky": return { success: 0, struggle: 2 };
  }
}

function deriveState(evidenceCount: number, successCount: number, struggleCount: number): MasteryState {
  if (evidenceCount === 0) return "unseen";
  if (struggleCount >= 2 && struggleCount >= successCount) return "shaky";
  if (successCount >= 3 && successCount >= struggleCount + 2) return "strong";
  return "developing";
}

export function applyEvidence(current: ConceptMastery | null, lessonSlug: string, concept: string, evidenceType: string, attemptId: string): ConceptMastery {
  if (!concept || typeof concept !== "string") throw new Error("Invalid concept.");
  if (!lessonSlug || typeof lessonSlug !== "string") throw new Error("Invalid lesson slug.");
  if (!isValidEvidence(evidenceType)) throw new Error("Invalid evidence type.");
  if (!attemptId || typeof attemptId !== "string") throw new Error("Invalid attempt ID.");

  // Duplicate prevention: the same attempt already recorded evidence for this concept.
  if (current?.last_attempt_id === attemptId) return current;

  const w = weight(evidenceType);
  const evidenceCount = (current?.evidence_count ?? 0) + 1;
  const successCount = (current?.success_count ?? 0) + w.success;
  const struggleCount = (current?.struggle_count ?? 0) + w.struggle;
  const state = deriveState(evidenceCount, successCount, struggleCount);

  return {
    lesson_slug: current?.lesson_slug ?? lessonSlug,
    concept_key: concept,
    state, evidence_count: evidenceCount, success_count: successCount, struggle_count: struggleCount,
    last_evidence_type: evidenceType,
    last_evidence_at: new Date().toISOString(),
    last_attempt_id: attemptId,
  };
}

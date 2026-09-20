import type { LessonMasteryConfig } from "@/lib/mastery/types";

const courseReviewConcepts = ["values_and_logic_recall", "repetition_and_reuse_recall", "collections_and_integration"] as const;

const activityConceptMap: Record<string, string> = {
  why_review: "values_and_logic_recall",
  concept_families: "collections_and_integration",
  values_and_logic_recall: "values_and_logic_recall",
  repetition_and_reuse_recall: "repetition_and_reuse_recall",
  collections_and_integration: "collections_and_integration",
  final_challenge: "collections_and_integration",
  course_complete: "collections_and_integration",
};

const robinCheckConcepts: string[] = ["values_and_logic_recall", "repetition_and_reuse_recall", "collections_and_integration"];

export const courseReviewMasteryConfig: LessonMasteryConfig = {
  concepts: courseReviewConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_review: ["values_and_logic_recall"],
  concept_families: ["values_and_logic_recall", "repetition_and_reuse_recall", "collections_and_integration"],
  values_and_logic_recall: ["values_and_logic_recall"],
  repetition_and_reuse_recall: ["repetition_and_reuse_recall"],
  collections_and_integration: ["collections_and_integration"],
  final_challenge: ["values_and_logic_recall", "repetition_and_reuse_recall", "collections_and_integration"],
  course_complete: ["values_and_logic_recall", "repetition_and_reuse_recall", "collections_and_integration"],
};

export const courseReviewRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["values_and_logic_recall", "repetition_and_reuse_recall", "collections_and_integration"]; },
  chatConcepts(message: string): string[] {
    if (/\b(review|kuis|inget|recall|keluarga konsep|retrieval)\b/i.test(message)) return ["values_and_logic_recall", "repetition_and_reuse_recall", "collections_and_integration"];
    if (/\b(variable|type|tipe|string|int|bool|boolean|operator|if|kondisi)\b/i.test(message)) return ["values_and_logic_recall"];
    if (/\b(loop|for|while|range|ulang|repeat)\b/i.test(message)) return ["repetition_and_reuse_recall"];
    if (/\b(list|dict|dictionary|tuple|set|collection|gabung|combine)\b/i.test(message)) return ["collections_and_integration"];
    return [];
  },
};

import type { LessonMasteryConfig } from "@/lib/mastery/types";

const problemDecompositionConcepts = ["identify_input_output", "step_decomposition", "concept_mapping"] as const;

const activityConceptMap: Record<string, string> = {
  why_decompose: "step_decomposition",
  io_model: "identify_input_output",
  step_decomposition: "step_decomposition",
  concept_mapping: "concept_mapping",
  identify_input_output: "identify_input_output",
  plan_decomposition: "step_decomposition",
  explain_decomposition: "step_decomposition",
};

const robinCheckConcepts: string[] = ["identify_input_output", "step_decomposition", "concept_mapping"];

export const problemDecompositionMasteryConfig: LessonMasteryConfig = {
  concepts: problemDecompositionConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_decompose: ["step_decomposition"],
  io_model: ["identify_input_output"],
  step_decomposition: ["step_decomposition", "concept_mapping"],
  concept_mapping: ["concept_mapping"],
  identify_input_output: ["identify_input_output"],
  plan_decomposition: ["step_decomposition", "identify_input_output"],
  explain_decomposition: ["identify_input_output", "step_decomposition", "concept_mapping"],
};

export const problemDecompositionRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["identify_input_output", "step_decomposition", "concept_mapping"]; },
  chatConcepts(message: string): string[] {
    if (/\b(input|proses|process|output|keluaran)\b/i.test(message)) return ["identify_input_output"];
    if (/\b(langkah\w*|step\w*|order\w*|urutan|urutin|diurutin|pecah\w*|decompos\w*)\b/i.test(message)) return ["step_decomposition"];
    if (/\b(konsep|concept|map|pakai apa)\b/i.test(message)) return ["concept_mapping"];
    return [];
  },
};

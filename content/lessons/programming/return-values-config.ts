import type { LessonMasteryConfig } from "@/lib/mastery/types";

const returnValuesConcepts = ["return_values", "return_vs_print", "return_flow"] as const;

const activityConceptMap: Record<string, string> = {
  why_return: "return_values",
  return_flow: "return_flow",
  return_vs_print: "return_vs_print",
  predict_store: "return_flow",
  predict_use: "return_flow",
  predict_stop: "return_flow",
  return_values: "return_values",
  explain_return: "return_values",
};

const robinCheckConcepts: string[] = ["return_values", "return_vs_print", "return_flow"];

export const returnValuesMasteryConfig: LessonMasteryConfig = {
  concepts: returnValuesConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_return: ["return_values"],
  return_flow: ["return_flow", "return_values"],
  return_vs_print: ["return_vs_print"],
  predict_store: ["return_flow", "return_values"],
  predict_use: ["return_flow", "return_vs_print"],
  predict_stop: ["return_flow"],
  return_values: ["return_values", "return_flow"],
  explain_return: ["return_values", "return_vs_print", "return_flow"],
};

export const returnValuesRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["return_values", "return_vs_print", "return_flow"]; },
  chatConcepts(message: string): string[] {
    if (/\b(stop|berhenti|jalan|alur|flow|caller|pemanggil)\b/i.test(message)) return ["return_flow"];
    if (/\b(print|tampil|layar|display)\b/i.test(message)) return ["return_vs_print"];
    if (/\b(return|kembali|balik|hasil|result|value|nilai|store|simpan)\b/i.test(message)) return ["return_values"];
    return [];
  },
};

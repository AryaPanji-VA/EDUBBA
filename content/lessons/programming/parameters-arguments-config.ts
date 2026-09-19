import type { LessonMasteryConfig } from "@/lib/mastery/types";

const parametersArgumentsConcepts = ["parameters_arguments", "argument_flow", "multiple_parameters"] as const;

const activityConceptMap: Record<string, string> = {
  why_parameters: "parameters_arguments",
  parameters_arguments: "parameters_arguments",
  argument_flow: "argument_flow",
  multiple_parameters: "multiple_parameters",
  explain_parameters: "parameters_arguments",
};

const robinCheckConcepts: string[] = ["parameters_arguments", "argument_flow", "multiple_parameters"];

export const parametersArgumentsMasteryConfig: LessonMasteryConfig = {
  concepts: parametersArgumentsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_parameters: ["parameters_arguments"],
  parameters_arguments: ["parameters_arguments"],
  argument_flow: ["argument_flow"],
  multiple_parameters: ["multiple_parameters"],
  explain_parameters: ["parameters_arguments", "argument_flow", "multiple_parameters"],
};

export const parametersArgumentsRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["parameters_arguments", "argument_flow", "multiple_parameters"]; },
  chatConcepts(message: string): string[] {
    if (/\b(order|urutan|left.?to.?right|dua parameter|two parameters|multiple|position|posisi|count|jumlah)\b/i.test(message)) return ["multiple_parameters"];
    if (/\b(flow|alur|masuk|dipakai|fill|terisi|isi|inside the body|di dalam body|value travels)\b/i.test(message)) return ["argument_flow"];
    if (/\b(parameter|argument|def|call|panggil|slot)\b/i.test(message)) return ["parameters_arguments"];
    return [];
  },
};

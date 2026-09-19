import type { LessonMasteryConfig } from "@/lib/mastery/types";

const scopeBasicsConcepts = ["local_scope", "global_scope", "parameter_local"] as const;

const activityConceptMap: Record<string, string> = {
  why_scope: "local_scope",
  scope_intuition: "local_scope",
  local_vs_global: "global_scope",
  local_scope: "local_scope",
  local_lifetime: "local_scope",
  parameter_local: "parameter_local",
  explain_scope: "local_scope",
};

const robinCheckConcepts: string[] = ["local_scope", "global_scope", "parameter_local"];

export const scopeBasicsMasteryConfig: LessonMasteryConfig = {
  concepts: scopeBasicsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_scope: ["local_scope"],
  scope_intuition: ["local_scope"],
  local_vs_global: ["global_scope", "local_scope"],
  local_scope: ["local_scope"],
  local_lifetime: ["local_scope", "global_scope"],
  parameter_local: ["parameter_local"],
  explain_scope: ["local_scope", "global_scope", "parameter_local"],
};

export const scopeBasicsRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["local_scope", "global_scope", "parameter_local"]; },
  chatConcepts(message: string): string[] {
    if (/\b(parameter|argumen|param)\b/i.test(message)) return ["parameter_local"];
    if (/\b(nameerror|not defined|hilang|hapus|habis|lifetime|nggak bisa dipakai|ga bisa dipakai)\b/i.test(message)) return ["local_scope"];
    if (/\b(scope|lokal|local|di dalam|dalam function|area kerja|working area)\b/i.test(message)) return ["local_scope"];
    if (/\b(global|di luar|outside|luar function)\b/i.test(message)) return ["global_scope"];
    return [];
  },
};

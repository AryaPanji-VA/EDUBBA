import type { LessonMasteryConfig } from "@/lib/mastery/types";

const pseudocodeAndTracingConcepts = ["pseudocode", "tracing"] as const;

const activityConceptMap: Record<string, string> = {
  why_pseudocode: "pseudocode",
  pt_intuition: "pseudocode",
  trace_example: "tracing",
  tracing_steps: "tracing",
  tracing_conditions: "tracing",
  full_trace: "tracing",
  applying_trace: "tracing",
  explain_tracing: "tracing",
};

const robinCheckConcepts: string[] = ["tracing"];

export const pseudocodeAndTracingMasteryConfig: LessonMasteryConfig = {
  concepts: pseudocodeAndTracingConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_pseudocode: ["pseudocode"],
  pt_intuition: ["pseudocode", "tracing"],
  trace_example: ["tracing", "pseudocode"],
  tracing_steps: ["tracing"],
  tracing_conditions: ["tracing"],
  full_trace: ["tracing"],
  applying_trace: ["tracing"],
  explain_tracing: ["tracing"],
};

export const pseudocodeAndTracingRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["tracing"]; },
  chatConcepts(message: string): string[] {
    if (/\b(trace|tracing|tabel trace|debug by hand|tangan)\b/i.test(message)) return ["tracing"];
    if (/\b(pseudocode|pseudo|rencana|plan)\b/i.test(message)) return ["pseudocode"];
    return [];
  },
};

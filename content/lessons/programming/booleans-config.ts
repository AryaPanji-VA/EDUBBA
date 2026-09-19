import type { LessonMasteryConfig } from "@/lib/mastery/types";

const booleansConcepts = ["boolean_value", "boolean_literal", "boolean_result"] as const;

const activityConceptMap: Record<string, string> = {
  why_boolean: "boolean_value",
  boolean_intuition: "boolean_literal",
  boolean_value: "boolean_value",
  boolean_literal: "boolean_literal",
  boolean_result: "boolean_result",
  explain_booleans: "boolean_value",
};

const robinCheckConcepts: string[] = ["boolean_value", "boolean_literal", "boolean_result"];

export const booleansMasteryConfig: LessonMasteryConfig = {
  concepts: booleansConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_boolean: ["boolean_value"],
  boolean_intuition: ["boolean_literal"],
  boolean_value: ["boolean_value"],
  boolean_literal: ["boolean_literal"],
  boolean_result: ["boolean_result"],
  explain_booleans: ["boolean_value", "boolean_literal", "boolean_result"],
};

export const booleansRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["boolean_value", "boolean_literal", "boolean_result"]; },
  chatConcepts(message: string): string[] {
    if (/\b(comparison|membandingkan|banding|==|>|<|hasil perbandingan)\b/i.test(message)) return ["boolean_result"];
    if (/\b(literal|kapital|capital|\"True\"|\"False\"|menulis true)\b/i.test(message)) return ["boolean_literal"];
    if (/\b(boolean|bool|true|false|keadaan|state|is_online)\b/i.test(message)) return ["boolean_value"];
    return [];
  },
};

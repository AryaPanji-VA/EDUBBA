import type { LessonMasteryConfig } from "@/lib/mastery/types";

const castingConcepts = ["type_conversion", "conversion_functions", "conversion_result"] as const;

const activityConceptMap: Record<string, string> = {
  why_casting: "type_conversion",
  casting_intuition: "conversion_functions",
  see_conversion: "conversion_functions",
  conversion_model: "type_conversion",
  str_vs_int: "conversion_result",
  conversion_result: "conversion_result",
  choose_conversion: "conversion_functions",
  explain_casting: "type_conversion",
};

const robinCheckConcepts: string[] = ["type_conversion", "conversion_functions", "conversion_result"];

export const castingMasteryConfig: LessonMasteryConfig = {
  concepts: castingConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_casting: ["type_conversion"],
  casting_intuition: ["conversion_functions"],
  see_conversion: ["conversion_functions", "conversion_result"],
  conversion_model: ["type_conversion", "conversion_result"],
  str_vs_int: ["conversion_result", "type_conversion"],
  conversion_result: ["conversion_result"],
  choose_conversion: ["conversion_functions"],
  explain_casting: ["type_conversion", "conversion_functions", "conversion_result"],
};

export const castingRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["type_conversion", "conversion_functions", "conversion_result"]; },
  chatConcepts(message: string): string[] {
    if (/\b(int\(|float\(|str\(|fungsi mana|fungsi konversi|pilih)\b/i.test(message)) return ["conversion_functions"];
    if (/\b(hasil|result|jadi type apa|bertipe|setelah konversi)\b/i.test(message)) return ["conversion_result"];
    if (/\b(casting|konversi|convert|ubah tipe|type conversion)\b/i.test(message)) return ["type_conversion"];
    return [];
  },
};

import type { LessonMasteryConfig } from "@/lib/mastery/types";

const syntaxIndentationConcepts = ["syntax_rules", "case_sensitivity", "indentation_meaning"] as const;

const activityConceptMap: Record<string, string> = {
  why_syntax: "syntax_rules",
  syntax_intuition: "syntax_rules",
  syntax_anatomy: "syntax_rules",
  case_check: "case_sensitivity",
  indentation_concept: "indentation_meaning",
  spot_difference: "indentation_meaning",
  explain_syntax: "syntax_rules",
};

const robinCheckConcepts: string[] = ["syntax_rules", "case_sensitivity", "indentation_meaning"];

export const syntaxIndentationMasteryConfig: LessonMasteryConfig = {
  concepts: syntaxIndentationConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_syntax: ["syntax_rules"],
  syntax_intuition: ["syntax_rules"],
  syntax_anatomy: ["syntax_rules"],
  case_check: ["case_sensitivity"],
  indentation_concept: ["indentation_meaning"],
  spot_difference: ["indentation_meaning", "case_sensitivity"],
  explain_syntax: ["syntax_rules", "case_sensitivity", "indentation_meaning"],
};

export const syntaxIndentationRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["syntax_rules", "case_sensitivity", "indentation_meaning"]; },
  chatConcepts(message: string): string[] {
    if (/\b(indentation|indent|menjorok|rata kiri|spasi awal|whitespace|block)\b/i.test(message)) return ["indentation_meaning"];
    if (/\b(case.sensitive|huruf besar|huruf kecil|kapital|Print|print)\b/i.test(message)) return ["case_sensitivity"];
    if (/\b(syntax|aturan|bentuk|shape|kurung|kutip|quote|penulisan)\b/i.test(message)) return ["syntax_rules"];
    return [];
  },
};

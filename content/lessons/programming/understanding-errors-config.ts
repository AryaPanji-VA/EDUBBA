import type { LessonMasteryConfig } from "@/lib/mastery/types";

const understandingErrorsConcepts = ["error_as_information", "common_error_shapes", "fix_cycle"] as const;

const activityConceptMap: Record<string, string> = {
  why_errors: "error_as_information",
  error_intuition: "error_as_information",
  error_anatomy: "error_as_information",
  common_error_shapes: "common_error_shapes",
  runs_or_error: "common_error_shapes",
  spot_bug: "common_error_shapes",
  fix_cycle: "fix_cycle",
  explain_errors: "error_as_information",
};

const robinCheckConcepts: string[] = ["error_as_information", "common_error_shapes", "fix_cycle"];

export const understandingErrorsMasteryConfig: LessonMasteryConfig = {
  concepts: understandingErrorsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_errors: ["error_as_information"],
  error_intuition: ["error_as_information"],
  error_anatomy: ["error_as_information", "common_error_shapes"],
  common_error_shapes: ["common_error_shapes"],
  runs_or_error: ["common_error_shapes", "error_as_information"],
  spot_bug: ["common_error_shapes"],
  fix_cycle: ["fix_cycle", "error_as_information"],
  explain_errors: ["error_as_information", "common_error_shapes", "fix_cycle"],
};

export const understandingErrorsRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["error_as_information", "common_error_shapes", "fix_cycle"]; },
  chatConcepts(message: string): string[] {
    if (/\b(run lagi|perbaiki|fix|siklus|cycle|langkah)\b/i.test(message)) return ["fix_cycle"];
    if (/\b(SyntaxError|IndentationError|kutip|kurung|ejaan|menjorok|indent)\b/i.test(message)) return ["common_error_shapes"];
    if (/\b(error|pesan|gagal|salah|masalah|berhenti)\b/i.test(message)) return ["error_as_information"];
    return [];
  },
};

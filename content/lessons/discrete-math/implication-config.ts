import type { LessonMasteryConfig } from "@/lib/mastery/types";

// Implication lesson-owned mastery configuration (standard lesson).

const implicationConcepts = ["implication", "equivalence"] as const;

const activityConceptMap: Record<string, string> = {
  why_implication: "implication",
  promise_model: "implication",
  implication_intro: "implication",
  evaluating_implication: "implication",
  truth_tables: "equivalence",
  vacuous_truth: "implication",
  converse_check: "implication",
  explain_implication: "implication",
};

const robinCheckConcepts: string[] = ["implication"];

export const implicationMasteryConfig: LessonMasteryConfig = {
  concepts: implicationConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_implication: ["implication"],
  promise_model: ["implication"],
  implication_intro: ["implication"],
  evaluating_implication: ["implication"],
  truth_tables: ["equivalence", "implication"],
  vacuous_truth: ["implication"],
  converse_check: ["implication"],
  explain_implication: ["implication"],
};

export const implicationRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["implication"]; },
  chatConcepts(message: string): string[] {
    if (/[→↔]|converse|konvers/i.test(message)) return ["implication", "equivalence"];
    if (/\b(vacuous|antecedent|consequent|janji|promise)\b/i.test(message)) return ["implication"];
    if (/\b(equivalence|ekuivalen|if and only if|iff)\b/i.test(message)) return ["equivalence"];
    return [];
  },
};

import type { LessonMasteryConfig } from "@/lib/mastery/types";

const interfaceEvaluationConcepts = ["usability_testing", "heuristic_evaluation"] as const;

const activityConceptMap: Record<string, string> = {
  why_evaluation: "usability_testing",
  eval_intuition: "heuristic_evaluation",
  method_selection: "usability_testing",
  heuristic_findings: "heuristic_evaluation",
  recording_behavior: "usability_testing",
  applying_heuristics: "heuristic_evaluation",
  explain_evaluation: "heuristic_evaluation",
};

const robinCheckConcepts: string[] = ["usability_testing", "heuristic_evaluation"];

export const interfaceEvaluationMasteryConfig: LessonMasteryConfig = {
  concepts: interfaceEvaluationConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_evaluation: ["usability_testing", "heuristic_evaluation"],
  eval_intuition: ["heuristic_evaluation", "usability_testing"],
  method_selection: ["usability_testing"],
  heuristic_findings: ["heuristic_evaluation"],
  recording_behavior: ["usability_testing"],
  applying_heuristics: ["heuristic_evaluation"],
  explain_evaluation: ["usability_testing", "heuristic_evaluation"],
};

export const interfaceEvaluationRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["usability_testing", "heuristic_evaluation"]; },
  chatConcepts(message: string): string[] {
    if (/\b(usability test|uji pengguna|user test|test pengguna|observe)\b/i.test(message)) return ["usability_testing"];
    if (/\b(heuristic|heuristik|checklist|inspection|audit)\b/i.test(message)) return ["heuristic_evaluation"];
    if (/\b(evaluat|evaluasi)\b/i.test(message)) return ["usability_testing", "heuristic_evaluation"];
    return [];
  },
};

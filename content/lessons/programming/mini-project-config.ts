import type { LessonMasteryConfig } from "@/lib/mastery/types";

const miniProjectConcepts = ["project_inputs", "safe_conversion", "decision_output"] as const;

const activityConceptMap: Record<string, string> = {
  project_overview: "project_inputs",
  project_inputs: "project_inputs",
  safe_conversion: "safe_conversion",
  decision_output: "decision_output",
  explain_project: "decision_output",
};

const robinCheckConcepts: string[] = ["project_inputs", "safe_conversion", "decision_output"];

export const miniProjectMasteryConfig: LessonMasteryConfig = {
  concepts: miniProjectConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  project_overview: ["project_inputs"],
  project_inputs: ["project_inputs", "decision_output"],
  safe_conversion: ["safe_conversion"],
  decision_output: ["decision_output", "safe_conversion"],
  explain_project: ["project_inputs", "safe_conversion", "decision_output"],
};

export const miniProjectRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["project_inputs", "safe_conversion", "decision_output"]; },
  chatConcepts(message: string): string[] {
    if (/\b(input|nama|name|score|nilai)\b/i.test(message)) return ["project_inputs"];
    if (/\b(int|convert|konversi|casting|try|except|valueerror)\b/i.test(message)) return ["safe_conversion"];
    if (/\b(pass|try again|70|hasil|result|print|output)\b/i.test(message)) return ["decision_output"];
    if (/\b(project|checker|program)\b/i.test(message)) return ["project_inputs", "safe_conversion", "decision_output"];
    return [];
  },
};

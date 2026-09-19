import type { LessonMasteryConfig } from "@/lib/mastery/types";

const whatIsProgrammingConcepts = ["programming_definition", "code_instructions", "literal_execution"] as const;

const activityConceptMap: Record<string, string> = {
  why_programming: "programming_definition",
  programming_intuition: "programming_definition",
  simple_program: "code_instructions",
  literal_execution: "literal_execution",
  code_instructions: "code_instructions",
  explain_programming: "programming_definition",
};

const robinCheckConcepts: string[] = ["programming_definition", "code_instructions", "literal_execution"];

export const whatIsProgrammingMasteryConfig: LessonMasteryConfig = {
  concepts: whatIsProgrammingConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_programming: ["programming_definition"],
  programming_intuition: ["programming_definition"],
  simple_program: ["code_instructions"],
  literal_execution: ["literal_execution"],
  code_instructions: ["code_instructions"],
  explain_programming: ["programming_definition", "code_instructions", "literal_execution"],
};

export const whatIsProgrammingRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["programming_definition", "code_instructions", "literal_execution"]; },
  chatConcepts(message: string): string[] {
    if (/\b(literal|menebak|guess|persis|eksakt|exact|aturan|rule)\b/i.test(message)) return ["literal_execution"];
    if (/\b(code|kode|syntax|sintaks|instruksi|instruction)\b/i.test(message)) return ["code_instructions"];
    if (/\b(programming|program|koding|coding)\b/i.test(message)) return ["programming_definition"];
    return [];
  },
};

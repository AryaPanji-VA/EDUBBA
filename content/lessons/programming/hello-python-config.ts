import type { LessonMasteryConfig } from "@/lib/mastery/types";

const helloPythonConcepts = ["python_as_language", "code_to_output", "instruction_execution"] as const;

const activityConceptMap: Record<string, string> = {
  why_python: "python_as_language",
  python_intuition: "python_as_language",
  first_program: "code_to_output",
  code_to_output: "code_to_output",
  instruction_execution: "instruction_execution",
  explain_python: "python_as_language",
};

const robinCheckConcepts: string[] = ["python_as_language", "code_to_output", "instruction_execution"];

export const helloPythonMasteryConfig: LessonMasteryConfig = {
  concepts: helloPythonConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_python: ["python_as_language"],
  python_intuition: ["python_as_language"],
  first_program: ["code_to_output"],
  code_to_output: ["code_to_output", "instruction_execution"],
  instruction_execution: ["instruction_execution"],
  explain_python: ["python_as_language", "code_to_output", "instruction_execution"],
};

export const helloPythonRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["python_as_language", "code_to_output", "instruction_execution"]; },
  chatConcepts(message: string): string[] {
    if (/\b(output|print|tampil|layar|screen)\b/i.test(message)) return ["code_to_output"];
    if (/\b(python|interpreter|bahasa|language|syntax|sintaks)\b/i.test(message)) return ["python_as_language"];
    if (/\b(instruksi|instruction|urutan|order|jalan|execute|run|baca)\b/i.test(message)) return ["instruction_execution"];
    return [];
  },
};

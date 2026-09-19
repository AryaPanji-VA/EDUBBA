import type { LessonMasteryConfig } from "@/lib/mastery/types";

const whileLoopsConcepts = ["while_condition", "while_update", "while_structure"] as const;

const activityConceptMap: Record<string, string> = {
  why_while: "while_structure",
  while_intuition: "while_structure",
  while_structure: "while_structure",
  while_condition: "while_condition",
  while_update: "while_update",
  while_write: "while_update",
  explain_while: "while_structure",
};

const robinCheckConcepts: string[] = ["while_condition", "while_update", "while_structure"];

export const whileLoopsMasteryConfig: LessonMasteryConfig = {
  concepts: whileLoopsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_while: ["while_structure"],
  while_intuition: ["while_condition", "while_structure"],
  while_structure: ["while_structure"],
  while_condition: ["while_condition"],
  while_update: ["while_update"],
  while_write: ["while_structure", "while_condition", "while_update"],
  explain_while: ["while_structure", "while_condition", "while_update"],
};

export const whileLoopsRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["while_condition", "while_update", "while_structure"]; },
  chatConcepts(message: string): string[] {
    if (/\b(infinite|forever|never stops?|nggak berhenti|nggak pernah berhenti|muter terus|nggak selesai)\b/i.test(message)) return ["while_update", "while_condition"];
    if (/\b(update|increment|count\s*\+|nambah|naikin|\+=)\b/i.test(message)) return ["while_update"];
    if (/\b(condition|kondisi|check|cek|while|True|False)\b/i.test(message)) return ["while_condition"];
    if (/\b(loop|ulang|repeat|iterasi|iteration|muter|struktur)\b/i.test(message)) return ["while_structure"];
    return [];
  },
};

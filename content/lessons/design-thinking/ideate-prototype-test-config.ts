import type { LessonMasteryConfig } from "@/lib/mastery/types";

const ideatePrototypeTestConcepts = ["ideation", "prototyping", "testing"] as const;

const activityConceptMap: Record<string, string> = {
  why_ideate: "ideation",
  ipt_intuition: "ideation",
  first_idea_trap: "ideation",
  prototype_purpose: "prototyping",
  test_observation: "testing",
  reading_test_data: "testing",
  fidelity_rule: "prototyping",
  explain_ipt: "prototyping",
};

const robinCheckConcepts: string[] = ["prototyping", "testing"];

export const ideatePrototypeTestMasteryConfig: LessonMasteryConfig = {
  concepts: ideatePrototypeTestConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_ideate: ["ideation"],
  ipt_intuition: ["ideation", "prototyping"],
  first_idea_trap: ["ideation"],
  prototype_purpose: ["prototyping"],
  test_observation: ["testing"],
  reading_test_data: ["testing"],
  fidelity_rule: ["prototyping"],
  explain_ipt: ["prototyping", "testing"],
};

export const ideatePrototypeTestRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["prototyping", "testing"]; },
  chatConcepts(message: string): string[] {
    if (/\b(brainstorm|ideate|ide|divergen|widen)\b/i.test(message)) return ["ideation"];
    if (/\b(prototype|purwarupa|fidelity|sketsa|sketch|mockup)\b/i.test(message)) return ["prototyping"];
    if (/\b(test|uji|usability test|observe|observasi)\b/i.test(message)) return ["testing"];
    return [];
  },
};

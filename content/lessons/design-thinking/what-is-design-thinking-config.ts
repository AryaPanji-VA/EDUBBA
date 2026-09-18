import type { LessonMasteryConfig } from "@/lib/mastery/types";

const whatIsDesignThinkingConcepts = ["design_process", "human_centered"] as const;

const activityConceptMap: Record<string, string> = {
  why_design_thinking: "design_process",
  dt_intuition: "design_process",
  dt_loop: "design_process",
  iteration_check: "design_process",
  framing_example: "human_centered",
  human_centered_check: "human_centered",
  applying_dt_start: "human_centered",
  explain_dt: "design_process",
};

const robinCheckConcepts: string[] = ["design_process", "human_centered"];

export const whatIsDesignThinkingMasteryConfig: LessonMasteryConfig = {
  concepts: whatIsDesignThinkingConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_design_thinking: ["design_process"],
  dt_intuition: ["design_process", "human_centered"],
  dt_loop: ["design_process"],
  iteration_check: ["design_process"],
  framing_example: ["human_centered"],
  human_centered_check: ["human_centered"],
  applying_dt_start: ["human_centered"],
  explain_dt: ["design_process", "human_centered"],
};

export const whatIsDesignThinkingRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["design_process", "human_centered"]; },
  chatConcepts(message: string): string[] {
    if (/\b(iterat|loop|berputar|stage|tahap|linear)\b/i.test(message)) return ["design_process"];
    if (/\b(human|user|pengguna|manusia|empat|empath)/i.test(message)) return ["human_centered"];
    if (/\b(design thinking|desain)\b/i.test(message)) return ["design_process", "human_centered"];
    return [];
  },
};

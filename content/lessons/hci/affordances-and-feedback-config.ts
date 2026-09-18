import type { LessonMasteryConfig } from "@/lib/mastery/types";

const affordancesAndFeedbackConcepts = ["affordance", "feedback"] as const;

const activityConceptMap: Record<string, string> = {
  why_affordance: "affordance",
  af_intuition: "affordance",
  reading_affordance: "affordance",
  feedback_jobs: "feedback",
  silence_failure: "feedback",
  fake_clickable: "affordance",
  applying_channels: "feedback",
  explain_af: "affordance",
};

const robinCheckConcepts: string[] = ["affordance", "feedback"];

export const affordancesAndFeedbackMasteryConfig: LessonMasteryConfig = {
  concepts: affordancesAndFeedbackConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_affordance: ["affordance"],
  af_intuition: ["affordance", "feedback"],
  reading_affordance: ["affordance"],
  feedback_jobs: ["feedback"],
  silence_failure: ["feedback"],
  fake_clickable: ["affordance"],
  applying_channels: ["feedback"],
  explain_af: ["affordance", "feedback"],
};

export const affordancesAndFeedbackRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["affordance", "feedback"]; },
  chatConcepts(message: string): string[] {
    if (/\b(feedback|respons|jawaban sistem|spinner|silent)\b/i.test(message)) return ["feedback"];
    if (/\b(affordance|janji bentuk|signifier|tombol|button)\b/i.test(message)) return ["affordance"];
    return [];
  },
};

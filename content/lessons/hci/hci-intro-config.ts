import type { LessonMasteryConfig } from "@/lib/mastery/types";

const hciIntroConcepts = ["interaction", "usability"] as const;

const activityConceptMap: Record<string, string> = {
  why_hci: "interaction",
  hci_intuition: "interaction",
  interaction_not_user: "interaction",
  blame_attribution: "usability",
  recoverability: "usability",
  evaluating_recovery: "usability",
  applying_hci_subject: "interaction",
  explain_hci: "interaction",
};

const robinCheckConcepts: string[] = ["interaction", "usability"];

export const hciIntroMasteryConfig: LessonMasteryConfig = {
  concepts: hciIntroConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_hci: ["interaction"],
  hci_intuition: ["interaction"],
  interaction_not_user: ["interaction"],
  blame_attribution: ["usability"],
  recoverability: ["usability"],
  evaluating_recovery: ["usability"],
  applying_hci_subject: ["interaction"],
  explain_hci: ["interaction", "usability"],
};

export const hciIntroRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["interaction", "usability"]; },
  chatConcepts(message: string): string[] {
    if (/\b(usabilit|usab|kesulitan pakai|recover|undo)\b/i.test(message)) return ["usability"];
    if (/\b(hci|interaksi|interaction|antarmuka|interface)\b/i.test(message)) return ["interaction"];
    return [];
  },
};

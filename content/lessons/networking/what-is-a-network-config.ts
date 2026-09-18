import type { LessonMasteryConfig } from "@/lib/mastery/types";

const whatIsANetworkConcepts = ["network_structure", "protocols"] as const;

const activityConceptMap: Record<string, string> = {
  why_network: "network_structure",
  wn_intuition: "network_structure",
  protocol_necessity: "protocols",
  internet_structure: "network_structure",
  internet_ownership: "network_structure",
  applying_nodes: "network_structure",
  explain_network: "protocols",
};

const robinCheckConcepts: string[] = ["network_structure", "protocols"];

export const whatIsANetworkMasteryConfig: LessonMasteryConfig = {
  concepts: whatIsANetworkConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_network: ["network_structure"],
  wn_intuition: ["network_structure", "protocols"],
  protocol_necessity: ["protocols"],
  internet_structure: ["network_structure"],
  internet_ownership: ["network_structure"],
  applying_nodes: ["network_structure"],
  explain_network: ["protocols", "network_structure"],
};

export const whatIsANetworkRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["network_structure", "protocols"]; },
  chatConcepts(message: string): string[] {
    if (/\b(protokol|protocol|aturan|kesepakatan)\b/i.test(message)) return ["protocols"];
    if (/\b(network|jaringan|node|link|router|internet)\b/i.test(message)) return ["network_structure"];
    return [];
  },
};

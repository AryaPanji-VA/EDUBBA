import type { LessonMasteryConfig } from "@/lib/mastery/types";

const clientServerAndLayersConcepts = ["client_server", "layering"] as const;

const activityConceptMap: Record<string, string> = {
  why_client_server: "client_server",
  cs_intuition: "client_server",
  layering_intuition: "layering",
  client_server_roles: "client_server",
  dns_role: "client_server",
  layering_benefit: "layering",
  applying_roles: "client_server",
  formal_definitions: "layering",
  explain_cs_layers: "layering",
};

const robinCheckConcepts: string[] = ["layering"];

export const clientServerAndLayersMasteryConfig: LessonMasteryConfig = {
  concepts: clientServerAndLayersConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_client_server: ["client_server"],
  cs_intuition: ["client_server"],
  layering_intuition: ["layering"],
  client_server_roles: ["client_server"],
  dns_role: ["client_server"],
  layering_benefit: ["layering"],
  applying_roles: ["client_server"],
  formal_definitions: ["layering", "client_server"],
  explain_cs_layers: ["layering"],
};

export const clientServerAndLayersRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["layering"]; },
  chatConcepts(message: string): string[] {
    if (/\b(layer|lapisan|stack|tumpukan)\b/i.test(message)) return ["layering"];
    if (/\b(client|server|klien|dns|request|response|ip address)\b/i.test(message)) return ["client_server"];
    return [];
  },
};

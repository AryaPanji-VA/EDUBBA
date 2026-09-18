import type { LessonMasteryConfig } from "@/lib/mastery/types";

const packetsAndProtocolsConcepts = ["packet_switching", "protocol_layering"] as const;

const activityConceptMap: Record<string, string> = {
  why_packets: "packet_switching",
  pp_intuition: "packet_switching",
  sequence_numbers: "packet_switching",
  local_loss: "packet_switching",
  header_payload: "packet_switching",
  applying_header: "packet_switching",
  explain_packets: "packet_switching",
  formal_definitions: "protocol_layering",
};

const robinCheckConcepts: string[] = ["packet_switching"];

export const packetsAndProtocolsMasteryConfig: LessonMasteryConfig = {
  concepts: packetsAndProtocolsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_packets: ["packet_switching"],
  pp_intuition: ["packet_switching"],
  sequence_numbers: ["packet_switching"],
  local_loss: ["packet_switching"],
  header_payload: ["packet_switching"],
  applying_header: ["packet_switching"],
  explain_packets: ["packet_switching"],
  formal_definitions: ["protocol_layering", "packet_switching"],
};

export const packetsAndProtocolsRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["packet_switching"]; },
  chatConcepts(message: string): string[] {
    if (/\b(packet|paket|switching|sequence|nomor urut|reassemble)\b/i.test(message)) return ["packet_switching"];
    if (/\b(tcp|ip|http|protokol|protocol|layer)\b/i.test(message)) return ["protocol_layering"];
    return [];
  },
};

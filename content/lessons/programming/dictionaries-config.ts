import type { LessonMasteryConfig } from "@/lib/mastery/types";

const dictionariesConcepts = ["key_value_model", "key_retrieval", "dict_update"] as const;

const activityConceptMap: Record<string, string> = {
  why_dictionaries: "key_value_model",
  dict_intuition: "key_value_model",
  key_value_model: "key_value_model",
  dict_read: "key_retrieval",
  dict_update: "dict_update",
  key_vs_position: "key_value_model",
  build_dictionary: "key_retrieval",
  explain_dictionary: "key_value_model",
};

const robinCheckConcepts: string[] = ["key_value_model", "key_retrieval", "dict_update"];

export const dictionariesMasteryConfig: LessonMasteryConfig = {
  concepts: dictionariesConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_dictionaries: ["key_value_model"],
  dict_intuition: ["key_value_model"],
  key_value_model: ["key_value_model"],
  dict_read: ["key_retrieval"],
  dict_update: ["dict_update"],
  key_vs_position: ["key_value_model"],
  build_dictionary: ["key_retrieval", "key_value_model"],
  explain_dictionary: ["key_value_model", "key_retrieval", "dict_update"],
};

export const dictionariesRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["key_value_model", "key_retrieval", "dict_update"]; },
  chatConcepts(message: string): string[] {
    if (/\b(update|overwrite|ganti|timpa|ubah nilai|tambah key|95)\b/i.test(message)) return ["dict_update"];
    if (/\b(retriev|access|bracket|kurung siku|key|kunci|ambil|print\()\b/i.test(message)) return ["key_retrieval"];
    if (/\b(dictionary|dict|value|nilai|student|list|posisi)\b/i.test(message)) return ["key_value_model"];
    return [];
  },
};

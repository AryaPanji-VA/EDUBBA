import type { LessonMasteryConfig } from "@/lib/mastery/types";

const printOutputConcepts = ["output_concept", "print_instruction", "execution_order"] as const;

const activityConceptMap: Record<string, string> = {
  why_output: "output_concept",
  print_intuition: "print_instruction",
  code_vs_output: "output_concept",
  print_text: "print_instruction",
  execution_order: "execution_order",
  explain_print: "print_instruction",
};

const robinCheckConcepts: string[] = ["output_concept", "print_instruction", "execution_order"];

export const printOutputMasteryConfig: LessonMasteryConfig = {
  concepts: printOutputConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_output: ["output_concept"],
  print_intuition: ["print_instruction"],
  code_vs_output: ["output_concept"],
  print_text: ["print_instruction"],
  execution_order: ["execution_order", "output_concept"],
  explain_print: ["output_concept", "print_instruction", "execution_order"],
};

export const printOutputRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["output_concept", "print_instruction", "execution_order"]; },
  chatConcepts(message: string): string[] {
    if (/\b(urutan|order|berurutan|baris pertama|atas ke bawah|top.to.bottom)\b/i.test(message)) return ["execution_order"];
    if (/\b(print|tampilkan|show|kutip|quote|kurung)\b/i.test(message)) return ["print_instruction"];
    if (/\b(output|hasil|muncul|layar|screen|code)\b/i.test(message)) return ["output_concept"];
    return [];
  },
};

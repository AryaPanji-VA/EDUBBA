import type { LessonMasteryConfig } from "@/lib/mastery/types";

const sequentialVsParallelConcepts = ["parallelism", "dependencies"] as const;

const activityConceptMap: Record<string, string> = {
  why_parallel: "parallelism",
  svp_intuition: "parallelism",
  amdahl_intuition: "parallelism",
  dependency_check: "dependencies",
  amdahl_check: "parallelism",
  applying_independence: "dependencies",
  explain_svp: "parallelism",
};

const robinCheckConcepts: string[] = ["parallelism", "dependencies"];

export const sequentialVsParallelMasteryConfig: LessonMasteryConfig = {
  concepts: sequentialVsParallelConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_parallel: ["parallelism"],
  svp_intuition: ["parallelism"],
  amdahl_intuition: ["parallelism"],
  dependency_check: ["dependencies"],
  amdahl_check: ["parallelism"],
  applying_independence: ["dependencies"],
  explain_svp: ["parallelism", "dependencies"],
};

export const sequentialVsParallelRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["parallelism", "dependencies"]; },
  chatConcepts(message: string): string[] {
    if (/\b(dependen|ketergantungan|needs.*output|urutan)\b/i.test(message)) return ["dependencies"];
    if (/\b(paralel|parallel|sequential|berurutan|amdahl|speedup|processor)\b/i.test(message)) return ["parallelism"];
    return [];
  },
};

import type { LessonMasteryConfig } from "@/lib/mastery/types";

const commentsConcepts = ["comment_purpose", "comment_syntax", "code_comment_output"] as const;

const activityConceptMap: Record<string, string> = {
  why_comments: "comment_purpose",
  comment_intuition: "comment_purpose",
  code_vs_comment: "code_comment_output",
  predict_what_runs: "comment_purpose",
  inline_comments: "comment_syntax",
  spot_comment: "comment_syntax",
  explain_comments: "comment_purpose",
};

const robinCheckConcepts: string[] = ["comment_purpose", "comment_syntax", "code_comment_output"];

export const commentsMasteryConfig: LessonMasteryConfig = {
  concepts: commentsConcepts,
  activityConceptToMastery: (activityConcept: string) => activityConceptMap[activityConcept] ?? null,
  robinCheckSignalToEvidence: (signal: "strong" | "developing" | "shaky") => {
    const evidenceType = signal === "strong" ? "robin_check_strong" : signal === "developing" ? "robin_check_developing" : "robin_check_shaky";
    return { evidenceType, concepts: robinCheckConcepts };
  },
};

const conceptMap: Record<string, string[]> = {
  why_comments: ["comment_purpose"],
  comment_intuition: ["comment_purpose", "comment_syntax"],
  code_vs_comment: ["code_comment_output"],
  predict_what_runs: ["comment_purpose", "code_comment_output"],
  inline_comments: ["comment_syntax", "code_comment_output"],
  spot_comment: ["comment_syntax", "code_comment_output"],
  explain_comments: ["comment_purpose", "comment_syntax", "code_comment_output"],
};

export const commentsRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["comment_purpose", "comment_syntax", "code_comment_output"]; },
  chatConcepts(message: string): string[] {
    if (/\b(code|output|beda|membedakan|dijalankan|tampil|hasil)\b/i.test(message)) return ["code_comment_output"];
    if (/\b(hash|tanda pagar|#|inline|baris sama|menulis comment)\b/i.test(message)) return ["comment_syntax"];
    if (/\b(comment|komen|catatan|kenapa|gunanya|manusia)\b/i.test(message)) return ["comment_purpose"];
    return [];
  },
};

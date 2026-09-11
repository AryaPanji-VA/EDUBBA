export const checkConcepts = ["name", "value", "assignment"] as const;
export const checkMisconceptions = ["equality", "identity", "printing", "immutable_binding"] as const;
export type CheckEvaluation = {
  signal: "strong" | "developing" | "shaky";
  recognizedConcepts: string[];
  misconceptions: string[];
  feedback: string;
  recommendedAction: "continue" | "reinforce" | "reteach";
};
export type CheckRequest = { lessonSlug: string; answer: string; language: "id" | "en" };

export function validateCheckRequest(value: unknown): CheckRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (Object.keys(row).some((key) => !["lessonSlug", "answer", "language"].includes(key)) ||
      typeof row.lessonSlug !== "string" || !row.lessonSlug.trim() ||
      (row.language !== "id" && row.language !== "en") ||
      typeof row.answer !== "string" || !row.answer.trim() || row.answer.length > 2_000) return null;
  return { lessonSlug: row.lessonSlug.trim(), answer: row.answer.trim(), language: row.language as "id" | "en" };
}

export function parseCheckEvaluation(text: string, allowedConcepts: readonly string[] = checkConcepts, allowedMisconceptions: readonly string[] = checkMisconceptions): CheckEvaluation {
  if (text.length > 6_000) throw new Error("Invalid evaluation.");
  const row = JSON.parse(text.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, "$1"));
  if (!row || typeof row !== "object" || Array.isArray(row) || Object.keys(row).length !== 5 ||
      Object.keys(row).some((key) => !["signal", "recognizedConcepts", "misconceptions", "feedback", "recommendedAction"].includes(key))) {
    throw new Error("Invalid evaluation.");
  }
  const actions = { strong: "continue", developing: "reinforce", shaky: "reteach" } as const;
  if (!Object.hasOwn(actions, row.signal) || row.recommendedAction !== actions[row.signal as keyof typeof actions]) throw new Error("Invalid signal.");
  for (const [values, allowed] of [[row.recognizedConcepts, allowedConcepts], [row.misconceptions, allowedMisconceptions]] as const) {
    if (!Array.isArray(values) || values.length > allowed.length || new Set(values).size !== values.length ||
        values.some((value: unknown) => typeof value !== "string" || !(allowed as readonly string[]).includes(value))) throw new Error("Invalid concepts.");
  }
  if ((row.misconceptions.length && row.signal !== "shaky") ||
      (row.signal === "strong" && row.recognizedConcepts.length !== allowedConcepts.length) ||
      typeof row.feedback !== "string" || !row.feedback.trim() || row.feedback.length > 1_200 ||
      /https?:\/\/|\b(?:sb_secret_|sk-)|\b\d+(?:\.\d+)?\s*%/i.test(row.feedback)) throw new Error("Invalid feedback.");
  return { signal: row.signal, recognizedConcepts: row.recognizedConcepts, misconceptions: row.misconceptions,
    feedback: row.feedback.trim(), recommendedAction: row.recommendedAction };
}

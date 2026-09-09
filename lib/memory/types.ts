// A deliberately small vocabulary: no free-text personal data or chat transcripts.
export const memoryOptions = {
  explanation_style: { category: "preference", values: ["analogy-first", "code-first", "formal-first"] },
  answer_length: { category: "preference", values: ["concise", "detailed"] },
  variables: { category: "learning", values: ["understood", "shaky", "struggling"] },
  name_binding: { category: "learning", values: ["understood", "shaky", "struggling"] },
  assignment_vs_comparison: { category: "learning", values: ["understood", "shaky", "struggling"] },
} as const;

export type MemoryKey = keyof typeof memoryOptions;
export type MemoryInput = {
  category: "preference" | "learning";
  key: MemoryKey;
  value: string;
  status: "understood" | "shaky" | "struggling" | null;
};
export type Memory = MemoryInput & {
  id: string; confidence: number | null; source: "explicit";
  created_at: string; updated_at: string;
};
export type MemoryAction = Pick<MemoryInput, "category" | "key" | "value"> & {
  type: "saved" | "updated" | "deleted";
};

export function validateMemory(input: unknown): MemoryInput | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const row = input as Record<string, unknown>;
  if (Object.keys(row).some((key) => !["category", "key", "value", "status"].includes(key))) return null;
  if (typeof row.key !== "string" || !Object.hasOwn(memoryOptions, row.key)) return null;
  const key = row.key as MemoryKey;
  const option = memoryOptions[key];
  if (row.category !== option.category || typeof row.value !== "string" || row.value.length > 40 ||
      !(option.values as readonly string[]).includes(row.value)) return null;
  const status = row.status ?? null;
  if (option.category === "learning" ? status !== row.value : status !== null) return null;
  return { category: option.category, key, value: row.value, status: status as MemoryInput["status"] };
}

// Functions lesson-owned adaptation relevance mappings.

const functionsConceptMap: Record<string, string[]> = {
  reuse_need: ["function_definition", "function_call"],
  define_function: ["function_definition", "function_call"],
  call_trace: ["function_call", "function_definition"],
  definition_no_run: ["function_definition", "function_call"],
  writing_function: ["function_definition", "function_call"],
  function_state: ["function_definition", "function_call"],
  define_call_model: ["function_definition", "function_call"],
};

const checkConcepts = ["function_definition", "function_call"];

export const functionsRelevance = {
  activityConcepts(concept: string): string[] {
    return Object.hasOwn(functionsConceptMap, concept) ? [...functionsConceptMap[concept]] : [];
  },
  checkConcepts(): string[] {
    return [...checkConcepts];
  },
  chatConcepts(message: string): string[] {
    if (/\b(def|define|definisikan|mendefinisikan|buat function|nama function|menyimpan)\b/i.test(message)) return [...functionsConceptMap.define_function];
    if (/\b(call|panggil|manggil|memanggil|run function|dipanggil)\b/i.test(message)) return [...functionsConceptMap.call_trace];
    if (/\b(function|fungsi|reuse|gunakan ulang|pengulangan kode)\b/i.test(message)) return [...functionsConceptMap.reuse_need];
    return [];
  },
};

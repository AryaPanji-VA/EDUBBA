// Functions lesson-owned adaptation relevance mappings.

const functionsConceptMap: Record<string, string[]> = {
  reuse_need: ["function_definition", "function_call"],
  define_function: ["function_definition", "function_call"],
  call_trace: ["function_call", "function_definition"],
  return_trace: ["return_values", "function_call"],
  print_return_compare: ["return_values", "function_call"],
  writing_function: ["parameters_arguments", "function_definition"],
  function_state: ["function_call", "return_values"],
};

const checkConcepts = ["function_definition", "function_call", "return_values"];

export const functionsRelevance = {
  activityConcepts(concept: string): string[] {
    return Object.hasOwn(functionsConceptMap, concept) ? [...functionsConceptMap[concept]] : [];
  },
  checkConcepts(): string[] {
    return [...checkConcepts];
  },
  chatConcepts(message: string): string[] {
    if (/\b(return|kembalikan|nilai balik|mengembalikan|print vs return)\b/i.test(message)) return [...functionsConceptMap.print_return_compare];
    if (/\b(parameter|argument|input function|masukan)\b/i.test(message)) return [...functionsConceptMap.writing_function];
    if (/\b(def|define|definisikan|buat function|nama function)\b/i.test(message)) return [...functionsConceptMap.define_function];
    if (/\b(call|panggil|manggil|run function|memanggil)\b/i.test(message)) return [...functionsConceptMap.call_trace];
    return [];
  },
};

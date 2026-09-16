// Loops lesson-owned adaptation relevance mappings.

const loopsConceptMap: Record<string, string[]> = {
  repetition_need: ["loop_iteration"],
  for_loop: ["loop_iteration", "range_boundaries"],
  range_trace: ["range_boundaries", "loop_iteration"],
  while_trace: ["while_condition", "loop_iteration"],
  accumulator_trace: ["counter_accumulator", "loop_iteration"],
  while_condition: ["while_condition", "counter_accumulator"],
  loop_state: ["counter_accumulator", "loop_iteration"],
};

const checkConcepts = ["loop_iteration", "range_boundaries", "while_condition"];

export const loopsRelevance = {
  activityConcepts(concept: string): string[] {
    return Object.hasOwn(loopsConceptMap, concept) ? [...loopsConceptMap[concept]] : [];
  },
  checkConcepts(): string[] {
    return [...checkConcepts];
  },
  chatConcepts(message: string): string[] {
    if (/\b(while|selama|infinite|muter terus|nggak berhenti|never stops)\b/i.test(message)) return [...loopsConceptMap.while_trace];
    if (/\b(range\(|batas|boundary|off.by.one|start.*stop|dari.*sampai)\b/i.test(message)) return [...loopsConceptMap.range_trace];
    if (/\b(counter|count|total|accumulator|akumulator|jumlah|penampung)\b/i.test(message)) return [...loopsConceptMap.accumulator_trace];
    if (/\b(for|loop|iterasi|iteration|ulang|repeat)\b/i.test(message)) return [...loopsConceptMap.for_loop];
    return [];
  },
};

// For Loops lesson-owned adaptation relevance mappings.
// The lesson teaches only for-loop iteration; all activity concepts
// lead to the single mastery concept loop_iteration.

const loopsConceptMap: Record<string, string[]> = {
  repetition_need: ["loop_iteration"],
  for_loop: ["loop_iteration"],
  for_trace: ["loop_iteration"],
  for_body_trace: ["loop_iteration"],
  iteration_count: ["loop_iteration"],
  for_write: ["loop_iteration"],
  for_model: ["loop_iteration"],
};

const checkConcepts = ["loop_iteration"];

export const loopsRelevance = {
  activityConcepts(concept: string): string[] {
    return Object.hasOwn(loopsConceptMap, concept) ? [...loopsConceptMap[concept]] : [];
  },
  checkConcepts(): string[] {
    return [...checkConcepts];
  },
  chatConcepts(message: string): string[] {
    if (/\b(loop\s*variable|variabel\s*loop|variable\s*loop|loop\s*var)\b/i.test(message)) return [...loopsConceptMap.for_loop];
    if (/\b(for|loop|iterasi|iteration|ulang|ulangi|repeat|repeats|pengulangan)\b/i.test(message)) return [...loopsConceptMap.for_loop];
    return [];
  },
};

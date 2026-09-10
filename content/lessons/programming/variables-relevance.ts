// Variables lesson-owned adaptation relevance mappings.
// Reviewed mappings belong to the lesson, not to the generic adaptation policy.

const variablesConceptMap: Record<string, string[]> = {
  reading_a_name: ["variable", "name_binding"],
  named_values: ["variable", "name_binding"],
  reassignment: ["reassignment", "variable", "name_binding"],
  assignment: ["assignment", "name_binding", "variable"],
  name_binding: ["name_binding", "variable", "assignment"],
};

const checkConcepts = ["assignment", "name_binding", "variable"];

export const variablesRelevance = {
  activityConcepts(concept: string): string[] {
    return Object.hasOwn(variablesConceptMap, concept) ? [...variablesConceptMap[concept]] : [];
  },
  checkConcepts(): string[] {
    return [...checkConcepts];
  },
  chatConcepts(message: string): string[] {
    // Conservative v1: only explicit topic phrases in the latest message.
    if (/\b(reassignment|reassign|assign ulang|assignment ulang)\b/i.test(message)) return variablesConceptMap.reassignment;
    if (/\b(name binding|binding nama)\b/i.test(message)) return variablesConceptMap.name_binding;
    if (/\b(assignment|penugasan variabel)\b/i.test(message)) return variablesConceptMap.assignment;
    if (/\b(python variable|python variables|variabel python|variable python|variabel|variable|variables)\b/i.test(message)) return variablesConceptMap.reading_a_name;
    return [];
  },
};

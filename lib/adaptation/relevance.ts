// Reviewed mappings belong to the lesson, not to the generic policy.
const variablesConcepts: Record<string, string[]> = {
  reading_a_name: ["variable", "name_binding"],
  named_values: ["variable", "name_binding"],
  reassignment: ["reassignment", "variable", "name_binding"],
  assignment: ["assignment", "name_binding", "variable"],
  name_binding: ["name_binding", "variable", "assignment"],
};

export function relevantActivityConcepts(lesson: string, concept: string): string[] {
  return lesson === "variables" && Object.hasOwn(variablesConcepts, concept) ? [...variablesConcepts[concept]] : [];
}

export function relevantCheckConcepts(lesson: string): string[] {
  return relevantActivityConcepts(lesson, "assignment");
}

export function relevantChatConcepts(lesson: string, message: string): string[] {
  if (lesson !== "variables") return [];
  // Conservative v1: only explicit topic phrases in the latest message.
  // No inference from history, no AI-selected database keys, no whole-profile fallback.
  if (/\b(reassignment|reassign|assign ulang|assignment ulang)\b/i.test(message)) return relevantActivityConcepts(lesson, "reassignment");
  if (/\b(name binding|binding nama)\b/i.test(message)) return relevantActivityConcepts(lesson, "name_binding");
  if (/\b(assignment|penugasan variabel)\b/i.test(message)) return relevantActivityConcepts(lesson, "assignment");
  if (/\b(python variable|python variables|variabel python|variable python|variabel|variable|variables)\b/i.test(message)) return relevantActivityConcepts(lesson, "reading_a_name");
  return [];
}

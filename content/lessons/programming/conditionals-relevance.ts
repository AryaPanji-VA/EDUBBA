// Conditionals lesson-owned adaptation relevance mappings.

const conditionalsConceptMap: Record<string, string[]> = {
  decision_making: ["conditional_flow", "branch_selection"],
  if_else: ["conditional_flow", "branch_selection"],
  branch_trace: ["branch_selection", "conditional_flow"],
  elif_chain: ["branch_selection", "conditional_flow"],
  comparison: ["comparison_expression", "conditional_flow"],
  writing_condition: ["comparison_expression", "branch_selection"],
  input_condition: ["input_conversion", "comparison_expression"],
};

const checkConcepts = ["conditional_flow", "comparison_expression", "branch_selection"];

export const conditionalsRelevance = {
  activityConcepts(concept: string): string[] {
    return Object.hasOwn(conditionalsConceptMap, concept) ? [...conditionalsConceptMap[concept]] : [];
  },
  checkConcepts(): string[] {
    return [...checkConcepts];
  },
  chatConcepts(message: string): string[] {
    if (/\b(elif|else if|cabang|branch|milih|pilih)\b/i.test(message)) return [...conditionalsConceptMap.branch_trace];
    if (/\b(input|konversi|convert|int\(|str ke|string ke angka)\b/i.test(message)) return [...conditionalsConceptMap.input_condition];
    if (/\b(==|!=|>=|<=|compare|comparison|banding|operator)\b/i.test(message)) return [...conditionalsConceptMap.comparison];
    if (/\b(if|kondisi|condition|indentasi|indentation)\b/i.test(message)) return [...conditionalsConceptMap.if_else];
    return [];
  },
};

const conceptMap: Record<string, string[]> = {
  operator_bridge: ["comparison_operators", "logical_operators"],
  expression_model: ["arithmetic_operations", "comparison_operators"],
  precedence_trace: ["operator_precedence", "arithmetic_operations"],
  arithmetic_trace: ["arithmetic_operations"],
  logical_trace: ["logical_operators", "comparison_operators"],
  writing_expression: ["comparison_operators", "logical_operators"],
  operator_system: ["operator_precedence", "comparison_operators"],
};

export const operatorsRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["comparison_operators", "logical_operators", "operator_precedence"]; },
  chatConcepts(message: string): string[] {
    if (/\b(precedence|urutan|parentheses|kurung|duluan)\b/i.test(message)) return ["operator_precedence", "arithmetic_operations"];
    if (/\b(and|or|not|logika|logical)\b/i.test(message)) return ["logical_operators", "comparison_operators"];
    if (/\b(compare|comparison|banding|==|!=|>=|<=|boolean|bool)\b/i.test(message)) return ["comparison_operators"];
    if (/\b(arithmetic|hitung|tambah|kurang|kali|bagi|modulo|remainder|%|\/\/)\b/i.test(message)) return ["arithmetic_operations"];
    return [];
  },
};

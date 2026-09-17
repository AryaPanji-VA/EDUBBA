const conceptMap: Record<string, string[]> = {
  why_logic: ["proposition"],
  proposition_intuition: ["proposition"],
  proposition_symbols: ["proposition"],
  identifying_propositions: ["proposition"],
  proposition_truth_value: ["truth_value"],
  negation_intro: ["negation"],
  evaluating_negation: ["negation"],
  conjunction_table: ["conjunction"],
  evaluating_conjunction: ["conjunction"],
  disjunction_intro: ["disjunction"],
  evaluating_disjunction: ["disjunction"],
  explain_conjunction: ["conjunction", "proposition"],
};

export const propositionsRelevance = {
  activityConcepts(concept: string): string[] { return Object.hasOwn(conceptMap, concept) ? [...conceptMap[concept]] : []; },
  checkConcepts(): string[] { return ["proposition", "truth_value", "conjunction"]; },
  chatConcepts(message: string): string[] {
    if (/[∧]|\b(dan|and|conjunction)\b/i.test(message)) return ["conjunction", "proposition"];
    if (/[∨]|\b(atau|or|disjunction|exclusive|eksklusif)\b/i.test(message)) return ["disjunction"];
    if (/[¬]|\b(negasi|negation|not)\b/i.test(message)) return ["negation"];
    if (/\b(benar|salah|true|false|truth value|nilai kebenaran)\b/i.test(message)) return ["truth_value"];
    if (/\b(proposisi|proposition|pernyataan|statement)\b/i.test(message)) return ["proposition"];
    return [];
  },
};

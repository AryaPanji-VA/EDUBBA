// Data Types lesson-owned adaptation relevance mappings.

const dataTypeConceptMap: Record<string, string[]> = {
  data_type: ["data_type", "string", "integer"],
  integer: ["integer", "data_type"],
  float: ["float", "data_type"],
  string: ["string", "integer", "data_type"],
  boolean: ["boolean", "data_type"],
  type_inspection: ["type_inspection", "data_type"],
};

const checkConcepts = ["data_type", "string", "integer"];

export const dataTypesRelevance = {
  activityConcepts(concept: string): string[] {
    return Object.hasOwn(dataTypeConceptMap, concept) ? [...dataTypeConceptMap[concept]] : [];
  },
  checkConcepts(): string[] {
    return [...checkConcepts];
  },
  chatConcepts(message: string): string[] {
    if (/\b(string vs number|42 dan .42.|beda.*42|42.*beda|difference.*42)\b/i.test(message)) return [...dataTypeConceptMap.string];
    if (/\b(int|integer|bilangan bulat)\b/i.test(message)) return [...dataTypeConceptMap.integer];
    if (/\b(float|desimal|decimal)\b/i.test(message)) return [...dataTypeConceptMap.float];
    if (/\b(bool|boolean|true false|benar salah)\b/i.test(message)) return [...dataTypeConceptMap.boolean];
    if (/\b(type|tipe|type\(\))\b/i.test(message)) return [...dataTypeConceptMap.data_type];
    return [];
  },
};

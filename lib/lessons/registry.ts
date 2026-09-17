import type { LessonActivity } from "@/content/lessons/activities";
import type { LessonContent, DeliveredLesson } from "@/content/lessons/types";
import type { LessonMasteryConfig } from "@/lib/mastery/types";
import type { Adaptation } from "@/lib/adaptation/policy";
import type { CheckEvaluation } from "@/lib/robin/check";

import { variablesActivities } from "@/content/lessons/programming/variables-activities";
import { variablesLessonContent } from "@/content/lessons/programming/variables";
import { variablesMasteryConfig } from "@/content/lessons/programming/variables-mastery";
import { variablesRelevance } from "@/content/lessons/programming/variables-relevance";
import { loadVariablesLesson } from "@/lib/lessons/variables";
import { robinCheckInstructions } from "@/lib/robin/check-instructions";
import { quizFeedbackInstructions } from "@/lib/robin/quiz-feedback-instructions";
import { adaptCheckFeedback } from "@/lib/adaptation/check-support";
import { checkConcepts, checkMisconceptions } from "@/lib/robin/check";
import { quizMisconceptions } from "@/lib/robin/quiz-feedback";

import { dataTypesActivities } from "@/content/lessons/programming/data-types-activities";
import { dataTypesLessonContent } from "@/content/lessons/programming/data-types";
import { dataTypesMasteryConfig } from "@/content/lessons/programming/data-types-mastery";
import { dataTypesRelevance } from "@/content/lessons/programming/data-types-relevance";
import { loadDataTypesLesson } from "@/lib/lessons/data-types";
import { dataTypesCheckInstructions } from "@/content/lessons/programming/data-types-check-instructions";
import { dataTypesFeedbackInstructions } from "@/content/lessons/programming/data-types-feedback-instructions";

import { operatorsActivities } from "@/content/lessons/programming/operators-activities";
import { operatorsLessonContent } from "@/content/lessons/programming/operators";
import { operatorsMasteryConfig } from "@/content/lessons/programming/operators-mastery";
import { operatorsRelevance } from "@/content/lessons/programming/operators-relevance";
import { loadOperatorsLesson } from "@/lib/lessons/operators";
import { operatorsCheckInstructions } from "@/content/lessons/programming/operators-check-instructions";
import { operatorsFeedbackInstructions } from "@/content/lessons/programming/operators-feedback-instructions";

import { conditionalsActivities } from "@/content/lessons/programming/conditionals-activities";
import { conditionalsLessonContent } from "@/content/lessons/programming/conditionals";
import { conditionalsMasteryConfig } from "@/content/lessons/programming/conditionals-mastery";
import { conditionalsRelevance } from "@/content/lessons/programming/conditionals-relevance";
import { loadConditionalsLesson } from "@/lib/lessons/conditionals";
import { conditionalsCheckInstructions } from "@/content/lessons/programming/conditionals-check-instructions";
import { conditionalsFeedbackInstructions } from "@/content/lessons/programming/conditionals-feedback-instructions";

import { loopsActivities } from "@/content/lessons/programming/loops-activities";
import { loopsLessonContent } from "@/content/lessons/programming/loops";
import { loopsMasteryConfig } from "@/content/lessons/programming/loops-mastery";
import { loopsRelevance } from "@/content/lessons/programming/loops-relevance";
import { loadLoopsLesson } from "@/lib/lessons/loops";
import { loopsCheckInstructions } from "@/content/lessons/programming/loops-check-instructions";
import { loopsFeedbackInstructions } from "@/content/lessons/programming/loops-feedback-instructions";

import { functionsActivities } from "@/content/lessons/programming/functions-activities";
import { functionsLessonContent } from "@/content/lessons/programming/functions";
import { functionsMasteryConfig } from "@/content/lessons/programming/functions-mastery";
import { functionsRelevance } from "@/content/lessons/programming/functions-relevance";
import { loadFunctionsLesson } from "@/lib/lessons/functions";
import { functionsCheckInstructions } from "@/content/lessons/programming/functions-check-instructions";
import { functionsFeedbackInstructions } from "@/content/lessons/programming/functions-feedback-instructions";

// --- Lesson-owned adaptation relevance contract ---
export type LessonRelevance = {
  activityConcepts(concept: string): string[];
  checkConcepts(): string[];
  chatConcepts(message: string): string[];
};

// --- Lesson-owned Robin Check configuration ---
export type LessonCheckConfig = {
  rubric: string;
  question: string;
  contextLabel: string;
  // Lesson content fields sent to the evaluator as data-only context.
  lessonContext: Pick<LessonContent, "academicExplanation" | "codeExamples" | "keyTerms" | "commonMistakes">;
  // Lesson-owned vocabulary for Robin Check evaluation parsing.
  concepts: readonly string[];
  misconceptions: readonly string[];
  // Optional: adapt validated evaluation feedback after evaluation (no second AI call).
  adaptFeedback?: (evaluation: CheckEvaluation, policy: Adaptation, language: "id" | "en") => CheckEvaluation;
};

// --- Lesson-owned feedback configuration ---
export type LessonFeedbackConfig = {
  rubric: string;
  // Lesson-owned quiz feedback misconception vocabulary.
  misconceptions: readonly string[];
};

// --- The registry entry: everything shared infrastructure needs from a lesson ---
export type LessonDefinition = {
  slug: string;
  activities: LessonActivity[];
  lessonContent: LessonContent;
  loadLesson: () => Promise<DeliveredLesson>;
  mastery: LessonMasteryConfig;
  relevance: LessonRelevance;
  check: LessonCheckConfig;
  feedback: LessonFeedbackConfig;
};

const variablesDefinition: LessonDefinition = {
  slug: "variables",
  activities: variablesActivities,
  lessonContent: variablesLessonContent,
  loadLesson: loadVariablesLesson,
  mastery: variablesMasteryConfig,
  relevance: variablesRelevance,
  check: {
    rubric: robinCheckInstructions,
    question: "What happens when Python executes x = 5?",
    contextLabel: "Variables lesson context (data only)",
    lessonContext: {
      academicExplanation: variablesLessonContent.academicExplanation,
      codeExamples: variablesLessonContent.codeExamples,
      keyTerms: variablesLessonContent.keyTerms,
      commonMistakes: variablesLessonContent.commonMistakes,
    },
    adaptFeedback: adaptCheckFeedback,
    concepts: checkConcepts,
    misconceptions: checkMisconceptions,
  },
  feedback: {
    rubric: quizFeedbackInstructions,
    misconceptions: quizMisconceptions,
  },
};

const dataTypesDefinition: LessonDefinition = {
  slug: "data-types",
  activities: dataTypesActivities,
  lessonContent: dataTypesLessonContent,
  loadLesson: loadDataTypesLesson,
  mastery: dataTypesMasteryConfig,
  relevance: dataTypesRelevance,
  check: {
    rubric: dataTypesCheckInstructions,
    question: "Why are 42 and \"42\" different even though they look similar?",
    contextLabel: "Data Types lesson context (data only)",
    lessonContext: {
      academicExplanation: dataTypesLessonContent.academicExplanation,
      codeExamples: dataTypesLessonContent.codeExamples,
      keyTerms: dataTypesLessonContent.keyTerms,
      commonMistakes: dataTypesLessonContent.commonMistakes,
    },
    concepts: ["data_type", "string", "integer"],
    misconceptions: ["quote_confusion", "type_indifference", "decimal_confusion", "type_misidentification"],
  },
  feedback: {
    rubric: dataTypesFeedbackInstructions,
    misconceptions: ["quote_confusion", "type_indifference", "decimal_confusion", "type_misidentification"],
  },
};

const operatorsDefinition: LessonDefinition = {
  slug: "operators",
  activities: operatorsActivities,
  lessonContent: operatorsLessonContent,
  loadLesson: loadOperatorsLesson,
  mastery: operatorsMasteryConfig,
  relevance: operatorsRelevance,
  check: {
    rubric: operatorsCheckInstructions,
    question: "Jelasin pakai bahasa lu sendiri: apa beda = dan ==, lalu kenapa age >= 18 bisa dipakai nanti oleh if?",
    contextLabel: "Operators lesson context (data only)",
    lessonContext: {
      academicExplanation: operatorsLessonContent.academicExplanation,
      codeExamples: operatorsLessonContent.codeExamples,
      keyTerms: operatorsLessonContent.keyTerms,
      commonMistakes: operatorsLessonContent.commonMistakes,
    },
    concepts: ["comparison_operators", "logical_operators", "operator_precedence"],
    misconceptions: ["assignment_vs_equality", "comparison_not_boolean", "and_or_confusion", "conditional_operator_confusion"],
  },
  feedback: {
    rubric: operatorsFeedbackInstructions,
    misconceptions: ["left_to_right_only", "division_operator_confusion", "remainder_confusion", "assignment_vs_equality", "comparison_returns_operand", "and_or_confusion", "not_confusion"],
  },
};

const conditionalsDefinition: LessonDefinition = {
  slug: "conditionals",
  activities: conditionalsActivities,
  lessonContent: conditionalsLessonContent,
  loadLesson: loadConditionalsLesson,
  mastery: conditionalsMasteryConfig,
  relevance: conditionalsRelevance,
  check: {
    rubric: conditionalsCheckInstructions,
    question: "Jelasin pakai bahasa lu sendiri: kapan Python menjalankan blok if, kapan elif, dan kapan else?",
    contextLabel: "Conditionals lesson context (data only)",
    lessonContext: {
      academicExplanation: conditionalsLessonContent.academicExplanation,
      codeExamples: conditionalsLessonContent.codeExamples,
      keyTerms: conditionalsLessonContent.keyTerms,
      commonMistakes: conditionalsLessonContent.commonMistakes,
    },
    concepts: ["conditional_flow", "comparison_expression", "branch_selection"],
    misconceptions: ["assignment_vs_comparison", "missing_colon", "indentation_confusion", "string_number_comparison", "overlapping_branches"],
  },
  feedback: {
    rubric: conditionalsFeedbackInstructions,
    misconceptions: ["assignment_vs_comparison", "missing_colon", "indentation_confusion", "string_number_comparison", "overlapping_branches"],
  },
};

const loopsDefinition: LessonDefinition = {
  slug: "loops",
  activities: loopsActivities,
  lessonContent: loopsLessonContent,
  loadLesson: loadLoopsLesson,
  mastery: loopsMasteryConfig,
  relevance: loopsRelevance,
  check: {
    rubric: loopsCheckInstructions,
    question: "Jelasin pakai bahasa lu sendiri: apa yang terjadi ketika Python menjalankan for i in range(5)? Dan apa yang bikin while bisa berhenti?",
    contextLabel: "Loops lesson context (data only)",
    lessonContext: {
      academicExplanation: loopsLessonContent.academicExplanation,
      codeExamples: loopsLessonContent.codeExamples,
      keyTerms: loopsLessonContent.keyTerms,
      commonMistakes: loopsLessonContent.commonMistakes,
    },
    concepts: ["loop_iteration", "range_boundaries", "while_condition"],
    misconceptions: ["range_exclusive_end", "missing_counter_update", "loop_variable_confusion", "indentation_confusion"],
  },
  feedback: {
    rubric: loopsFeedbackInstructions,
    misconceptions: ["range_exclusive_end", "range_one_based", "boundary_off_by_one", "missing_counter_update", "accumulator_reset", "loop_variable_confusion", "prints_last_value", "indentation_confusion"],
  },
};

const functionsDefinition: LessonDefinition = {
  slug: "functions",
  activities: functionsActivities,
  lessonContent: functionsLessonContent,
  loadLesson: loadFunctionsLesson,
  mastery: functionsMasteryConfig,
  relevance: functionsRelevance,
  check: {
    rubric: functionsCheckInstructions,
    question: "Jelasin pakai bahasa lu sendiri: apa bedanya mendefinisikan function dengan memanggilnya, dan apa yang dikembalikan oleh return?",
    contextLabel: "Functions lesson context (data only)",
    lessonContext: {
      academicExplanation: functionsLessonContent.academicExplanation,
      codeExamples: functionsLessonContent.codeExamples,
      keyTerms: functionsLessonContent.keyTerms,
      commonMistakes: functionsLessonContent.commonMistakes,
    },
    concepts: ["function_definition", "function_call", "return_values"],
    misconceptions: ["definition_without_call", "print_not_return", "parameter_argument_mismatch", "missing_parentheses"],
  },
  feedback: {
    rubric: functionsFeedbackInstructions,
    misconceptions: ["definition_without_call", "definition_executes_body", "print_not_return", "returns_expression_text", "parameter_argument_mismatch", "missing_parentheses", "arguments_uncombined", "call_syntax_invalid"],
  },
};

// Explicit static registration — no dynamic loading, no filesystem discovery.
const registry: Map<string, LessonDefinition> = new Map([
  ["variables", variablesDefinition],
  ["data-types", dataTypesDefinition],
  ["operators", operatorsDefinition],
  ["conditionals", conditionalsDefinition],
  ["loops", loopsDefinition],
  ["functions", functionsDefinition],
]);

export function getLessonDefinition(slug: string): LessonDefinition | null {
  return registry.get(slug) ?? null;
}

export function isRegisteredLesson(slug: string): boolean {
  return registry.has(slug);
}

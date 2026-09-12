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

// Explicit static registration — no dynamic loading, no filesystem discovery.
const registry: Map<string, LessonDefinition> = new Map([
  ["variables", variablesDefinition],
  ["data-types", dataTypesDefinition],
]);

export function getLessonDefinition(slug: string): LessonDefinition | null {
  return registry.get(slug) ?? null;
}

export function isRegisteredLesson(slug: string): boolean {
  return registry.has(slug);
}

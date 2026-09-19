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

// Phase 20.4: Module 04 — While Loops and Range & Loop Patterns. The legacy
// `loops` lesson is modernized in place as For Loops (persisted identity kept).
import { whileLoopsActivities } from "@/content/lessons/programming/while-loops-activities";
import { whileLoopsLessonContent } from "@/content/lessons/programming/while-loops";
import { whileLoopsMasteryConfig, whileLoopsRelevance } from "@/content/lessons/programming/while-loops-config";
import { loadWhileLoopsLesson } from "@/lib/lessons/while-loops";
import { whileLoopsCheckInstructions, whileLoopsFeedbackInstructions } from "@/content/lessons/programming/while-loops-instructions";

// Phase 20.4: Module 04 — Range & Loop Patterns.
import { rangeLoopPatternsActivities } from "@/content/lessons/programming/range-loop-patterns-activities";
import { rangeLoopPatternsLessonContent } from "@/content/lessons/programming/range-loop-patterns";
import { rangeLoopPatternsMasteryConfig, rangeLoopPatternsRelevance } from "@/content/lessons/programming/range-loop-patterns-config";
import { loadRangeLoopPatternsLesson } from "@/lib/lessons/range-loop-patterns";
import { rangeLoopPatternsCheckInstructions, rangeLoopPatternsFeedbackInstructions } from "@/content/lessons/programming/range-loop-patterns-instructions";

import { functionsActivities } from "@/content/lessons/programming/functions-activities";
import { functionsLessonContent } from "@/content/lessons/programming/functions";
import { functionsMasteryConfig } from "@/content/lessons/programming/functions-mastery";
import { functionsRelevance } from "@/content/lessons/programming/functions-relevance";
import { loadFunctionsLesson } from "@/lib/lessons/functions";
import { functionsCheckInstructions } from "@/content/lessons/programming/functions-check-instructions";
import { functionsFeedbackInstructions } from "@/content/lessons/programming/functions-feedback-instructions";

// Phase 20.1A: beginner onboarding — the first lesson of Programming Fundamentals.
import { whatIsProgrammingActivities } from "@/content/lessons/programming/what-is-programming-activities";
import { whatIsProgrammingLessonContent } from "@/content/lessons/programming/what-is-programming";
import { whatIsProgrammingMasteryConfig, whatIsProgrammingRelevance } from "@/content/lessons/programming/what-is-programming-config";
import { loadWhatIsProgrammingLesson } from "@/lib/lessons/what-is-programming";
import { whatIsProgrammingCheckInstructions, whatIsProgrammingFeedbackInstructions } from "@/content/lessons/programming/what-is-programming-instructions";

// Phase 20.1B: beginner onboarding — Meet Python, the first language.
import { helloPythonActivities } from "@/content/lessons/programming/hello-python-activities";
import { helloPythonLessonContent } from "@/content/lessons/programming/hello-python";
import { helloPythonMasteryConfig, helloPythonRelevance } from "@/content/lessons/programming/hello-python-config";
import { loadHelloPythonLesson } from "@/lib/lessons/hello-python";
import { helloPythonCheckInstructions, helloPythonFeedbackInstructions } from "@/content/lessons/programming/hello-python-instructions";

// Phase 20.1C: beginner onboarding — Output with print().
import { printOutputActivities } from "@/content/lessons/programming/print-output-activities";
import { printOutputLessonContent } from "@/content/lessons/programming/print-output";
import { printOutputMasteryConfig, printOutputRelevance } from "@/content/lessons/programming/print-output-config";
import { loadPrintOutputLesson } from "@/lib/lessons/print-output";
import { printOutputCheckInstructions, printOutputFeedbackInstructions } from "@/content/lessons/programming/print-output-instructions";

// Phase 20.1D: beginner onboarding — Syntax & Indentation.
import { syntaxIndentationActivities } from "@/content/lessons/programming/syntax-indentation-activities";
import { syntaxIndentationLessonContent } from "@/content/lessons/programming/syntax-indentation";
import { syntaxIndentationMasteryConfig, syntaxIndentationRelevance } from "@/content/lessons/programming/syntax-indentation-config";
import { loadSyntaxIndentationLesson } from "@/lib/lessons/syntax-indentation";
import { syntaxIndentationCheckInstructions, syntaxIndentationFeedbackInstructions } from "@/content/lessons/programming/syntax-indentation-instructions";

// Phase 20.1E: beginner onboarding — Comments.
import { commentsActivities } from "@/content/lessons/programming/comments-activities";
import { commentsLessonContent } from "@/content/lessons/programming/comments";
import { commentsMasteryConfig, commentsRelevance } from "@/content/lessons/programming/comments-config";
import { loadCommentsLesson } from "@/lib/lessons/comments";
import { commentsCheckInstructions, commentsFeedbackInstructions } from "@/content/lessons/programming/comments-instructions";

// Phase 20.1F: beginner onboarding — Understanding Errors. Closes Module 01.
import { understandingErrorsActivities } from "@/content/lessons/programming/understanding-errors-activities";
import { understandingErrorsLessonContent } from "@/content/lessons/programming/understanding-errors";
import { understandingErrorsMasteryConfig, understandingErrorsRelevance } from "@/content/lessons/programming/understanding-errors-config";
import { loadUnderstandingErrorsLesson } from "@/lib/lessons/understanding-errors";
import { understandingErrorsCheckInstructions, understandingErrorsFeedbackInstructions } from "@/content/lessons/programming/understanding-errors-instructions";

// Phase 20.2C: Module 02 — Numbers.
import { numbersActivities } from "@/content/lessons/programming/numbers-activities";
import { numbersLessonContent } from "@/content/lessons/programming/numbers";
import { numbersMasteryConfig, numbersRelevance } from "@/content/lessons/programming/numbers-config";
import { loadNumbersLesson } from "@/lib/lessons/numbers";
import { numbersCheckInstructions, numbersFeedbackInstructions } from "@/content/lessons/programming/numbers-instructions";

// Phase 20.2D: Module 02 — Casting.
import { castingActivities } from "@/content/lessons/programming/casting-activities";
import { castingLessonContent } from "@/content/lessons/programming/casting";
import { castingMasteryConfig, castingRelevance } from "@/content/lessons/programming/casting-config";
import { loadCastingLesson } from "@/lib/lessons/casting";
import { castingCheckInstructions, castingFeedbackInstructions } from "@/content/lessons/programming/casting-instructions";

// Phase 20.2E: Module 02 — Strings.
import { stringsActivities } from "@/content/lessons/programming/strings-activities";
import { stringsLessonContent } from "@/content/lessons/programming/strings";
import { stringsMasteryConfig, stringsRelevance } from "@/content/lessons/programming/strings-config";
import { loadStringsLesson } from "@/lib/lessons/strings";
import { stringsCheckInstructions, stringsFeedbackInstructions } from "@/content/lessons/programming/strings-instructions";

// Phase 20.2F: Module 02 — Booleans. Closes Module 02.
import { booleansActivities } from "@/content/lessons/programming/booleans-activities";
import { booleansLessonContent } from "@/content/lessons/programming/booleans";
import { booleansMasteryConfig, booleansRelevance } from "@/content/lessons/programming/booleans-config";
import { loadBooleansLesson } from "@/lib/lessons/booleans";
import { booleansCheckInstructions, booleansFeedbackInstructions } from "@/content/lessons/programming/booleans-instructions";

// Phase 20.3B: Module 03 — User Input.
import { userInputActivities } from "@/content/lessons/programming/user-input-activities";
import { userInputLessonContent } from "@/content/lessons/programming/user-input";
import { userInputMasteryConfig, userInputRelevance } from "@/content/lessons/programming/user-input-config";
import { loadUserInputLesson } from "@/lib/lessons/user-input";
import { userInputCheckInstructions, userInputFeedbackInstructions } from "@/content/lessons/programming/user-input-instructions";

import { propositionsActivities } from "@/content/lessons/discrete-math/propositions-activities";
import { propositionsLessonContent } from "@/content/lessons/discrete-math/propositions";
import { propositionsMasteryConfig } from "@/content/lessons/discrete-math/propositions-mastery";
import { propositionsRelevance } from "@/content/lessons/discrete-math/propositions-relevance";
import { loadPropositionsLesson } from "@/lib/lessons/propositions";
import { propositionsCheckInstructions } from "@/content/lessons/discrete-math/propositions-check-instructions";
import { propositionsFeedbackInstructions } from "@/content/lessons/discrete-math/propositions-feedback-instructions";

import { implicationActivities } from "@/content/lessons/discrete-math/implication-activities";
import { implicationLessonContent } from "@/content/lessons/discrete-math/implication";
import { implicationMasteryConfig, implicationRelevance } from "@/content/lessons/discrete-math/implication-config";
import { loadImplicationLesson } from "@/lib/lessons/implication";
import { implicationCheckInstructions, implicationFeedbackInstructions } from "@/content/lessons/discrete-math/implication-instructions";

import { setsIntroActivities } from "@/content/lessons/discrete-math/sets-intro-activities";
import { setsIntroLessonContent } from "@/content/lessons/discrete-math/sets-intro";
import { setsIntroMasteryConfig, setsIntroRelevance } from "@/content/lessons/discrete-math/sets-intro-config";
import { loadSetsIntroLesson } from "@/lib/lessons/sets-intro";
import { setsIntroCheckInstructions, setsIntroFeedbackInstructions } from "@/content/lessons/discrete-math/sets-intro-instructions";

import { whatIsDesignThinkingActivities } from "@/content/lessons/design-thinking/what-is-design-thinking-activities";
import { whatIsDesignThinkingLessonContent } from "@/content/lessons/design-thinking/what-is-design-thinking";
import { whatIsDesignThinkingMasteryConfig, whatIsDesignThinkingRelevance } from "@/content/lessons/design-thinking/what-is-design-thinking-config";
import { loadWhatIsDesignThinkingLesson } from "@/lib/lessons/what-is-design-thinking";
import { whatIsDesignThinkingCheckInstructions, whatIsDesignThinkingFeedbackInstructions } from "@/content/lessons/design-thinking/what-is-design-thinking-instructions";

import { empathyAndDefineActivities } from "@/content/lessons/design-thinking/empathy-and-define-activities";
import { empathyAndDefineLessonContent } from "@/content/lessons/design-thinking/empathy-and-define";
import { empathyAndDefineMasteryConfig, empathyAndDefineRelevance } from "@/content/lessons/design-thinking/empathy-and-define-config";
import { loadEmpathyAndDefineLesson } from "@/lib/lessons/empathy-and-define";
import { empathyAndDefineCheckInstructions, empathyAndDefineFeedbackInstructions } from "@/content/lessons/design-thinking/empathy-and-define-instructions";

import { ideatePrototypeTestActivities } from "@/content/lessons/design-thinking/ideate-prototype-test-activities";
import { ideatePrototypeTestLessonContent } from "@/content/lessons/design-thinking/ideate-prototype-test";
import { ideatePrototypeTestMasteryConfig, ideatePrototypeTestRelevance } from "@/content/lessons/design-thinking/ideate-prototype-test-config";
import { loadIdeatePrototypeTestLesson } from "@/lib/lessons/ideate-prototype-test";
import { ideatePrototypeTestCheckInstructions, ideatePrototypeTestFeedbackInstructions } from "@/content/lessons/design-thinking/ideate-prototype-test-instructions";

import { hciIntroActivities } from "@/content/lessons/hci/hci-intro-activities";
import { hciIntroLessonContent } from "@/content/lessons/hci/hci-intro";
import { hciIntroMasteryConfig, hciIntroRelevance } from "@/content/lessons/hci/hci-intro-config";
import { loadHciIntroLesson } from "@/lib/lessons/hci-intro";
import { hciIntroCheckInstructions, hciIntroFeedbackInstructions } from "@/content/lessons/hci/hci-intro-instructions";

import { affordancesAndFeedbackActivities } from "@/content/lessons/hci/affordances-and-feedback-activities";
import { affordancesAndFeedbackLessonContent } from "@/content/lessons/hci/affordances-and-feedback";
import { affordancesAndFeedbackMasteryConfig, affordancesAndFeedbackRelevance } from "@/content/lessons/hci/affordances-and-feedback-config";
import { loadAffordancesAndFeedbackLesson } from "@/lib/lessons/affordances-and-feedback";
import { affordancesAndFeedbackCheckInstructions, affordancesAndFeedbackFeedbackInstructions } from "@/content/lessons/hci/affordances-and-feedback-instructions";

import { interfaceEvaluationActivities } from "@/content/lessons/hci/interface-evaluation-activities";
import { interfaceEvaluationLessonContent } from "@/content/lessons/hci/interface-evaluation";
import { interfaceEvaluationMasteryConfig, interfaceEvaluationRelevance } from "@/content/lessons/hci/interface-evaluation-config";
import { loadInterfaceEvaluationLesson } from "@/lib/lessons/interface-evaluation";
import { interfaceEvaluationCheckInstructions, interfaceEvaluationFeedbackInstructions } from "@/content/lessons/hci/interface-evaluation-instructions";

import { whatIsAnAlgorithmActivities } from "@/content/lessons/algorithms/what-is-an-algorithm-activities";
import { whatIsAnAlgorithmLessonContent } from "@/content/lessons/algorithms/what-is-an-algorithm";
import { whatIsAnAlgorithmMasteryConfig, whatIsAnAlgorithmRelevance } from "@/content/lessons/algorithms/what-is-an-algorithm-config";
import { loadWhatIsAnAlgorithmLesson } from "@/lib/lessons/what-is-an-algorithm";
import { whatIsAnAlgorithmCheckInstructions, whatIsAnAlgorithmFeedbackInstructions } from "@/content/lessons/algorithms/what-is-an-algorithm-instructions";

import { pseudocodeAndTracingActivities } from "@/content/lessons/algorithms/pseudocode-and-tracing-activities";
import { pseudocodeAndTracingLessonContent } from "@/content/lessons/algorithms/pseudocode-and-tracing";
import { pseudocodeAndTracingMasteryConfig, pseudocodeAndTracingRelevance } from "@/content/lessons/algorithms/pseudocode-and-tracing-config";
import { loadPseudocodeAndTracingLesson } from "@/lib/lessons/pseudocode-and-tracing";
import { pseudocodeAndTracingCheckInstructions, pseudocodeAndTracingFeedbackInstructions } from "@/content/lessons/algorithms/pseudocode-and-tracing-instructions";

import { efficiencyIntuitionActivities } from "@/content/lessons/algorithms/efficiency-intuition-activities";
import { efficiencyIntuitionLessonContent } from "@/content/lessons/algorithms/efficiency-intuition";
import { efficiencyIntuitionMasteryConfig, efficiencyIntuitionRelevance } from "@/content/lessons/algorithms/efficiency-intuition-config";
import { loadEfficiencyIntuitionLesson } from "@/lib/lessons/efficiency-intuition";
import { efficiencyIntuitionCheckInstructions, efficiencyIntuitionFeedbackInstructions } from "@/content/lessons/algorithms/efficiency-intuition-instructions";

import { sequentialVsParallelActivities } from "@/content/lessons/parallel/sequential-vs-parallel-activities";
import { sequentialVsParallelLessonContent } from "@/content/lessons/parallel/sequential-vs-parallel";
import { sequentialVsParallelMasteryConfig, sequentialVsParallelRelevance } from "@/content/lessons/parallel/sequential-vs-parallel-config";
import { loadSequentialVsParallelLesson } from "@/lib/lessons/sequential-vs-parallel";
import { sequentialVsParallelCheckInstructions, sequentialVsParallelFeedbackInstructions } from "@/content/lessons/parallel/sequential-vs-parallel-instructions";

import { distributedBasicsActivities } from "@/content/lessons/parallel/distributed-basics-activities";
import { distributedBasicsLessonContent } from "@/content/lessons/parallel/distributed-basics";
import { distributedBasicsMasteryConfig, distributedBasicsRelevance } from "@/content/lessons/parallel/distributed-basics-config";
import { loadDistributedBasicsLesson } from "@/lib/lessons/distributed-basics";
import { distributedBasicsCheckInstructions, distributedBasicsFeedbackInstructions } from "@/content/lessons/parallel/distributed-basics-instructions";

import { whatIsANetworkActivities } from "@/content/lessons/networking/what-is-a-network-activities";
import { whatIsANetworkLessonContent } from "@/content/lessons/networking/what-is-a-network";
import { whatIsANetworkMasteryConfig, whatIsANetworkRelevance } from "@/content/lessons/networking/what-is-a-network-config";
import { loadWhatIsANetworkLesson } from "@/lib/lessons/what-is-a-network";
import { whatIsANetworkCheckInstructions, whatIsANetworkFeedbackInstructions } from "@/content/lessons/networking/what-is-a-network-instructions";

import { packetsAndProtocolsActivities } from "@/content/lessons/networking/packets-and-protocols-activities";
import { packetsAndProtocolsLessonContent } from "@/content/lessons/networking/packets-and-protocols";
import { packetsAndProtocolsMasteryConfig, packetsAndProtocolsRelevance } from "@/content/lessons/networking/packets-and-protocols-config";
import { loadPacketsAndProtocolsLesson } from "@/lib/lessons/packets-and-protocols";
import { packetsAndProtocolsCheckInstructions, packetsAndProtocolsFeedbackInstructions } from "@/content/lessons/networking/packets-and-protocols-instructions";

import { clientServerAndLayersActivities } from "@/content/lessons/networking/client-server-and-layers-activities";
import { clientServerAndLayersLessonContent } from "@/content/lessons/networking/client-server-and-layers";
import { clientServerAndLayersMasteryConfig, clientServerAndLayersRelevance } from "@/content/lessons/networking/client-server-and-layers-config";
import { loadClientServerAndLayersLesson } from "@/lib/lessons/client-server-and-layers";
import { clientServerAndLayersCheckInstructions, clientServerAndLayersFeedbackInstructions } from "@/content/lessons/networking/client-server-and-layers-instructions";

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
// courseSlug is the trusted, server-side course ownership of this lesson.
// The flat registry is keyed by lesson slug, which is therefore globally unique
// across all courses — choose lesson slugs that no other course will claim.
export type LessonDefinition = {
  slug: string;
  courseSlug: string;
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
  courseSlug: "programming",
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
  courseSlug: "programming",
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
  courseSlug: "programming",
  activities: operatorsActivities,
  lessonContent: operatorsLessonContent,
  loadLesson: loadOperatorsLesson,
  mastery: operatorsMasteryConfig,
  relevance: operatorsRelevance,
  check: {
    rubric: operatorsCheckInstructions,
    question: "Jelasin pakai bahasa lu sendiri: apa beda = dan ==, dan apa hasil dari score > 5 kalau score bernilai 10?",
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
  courseSlug: "programming",
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
  courseSlug: "programming",
  activities: loopsActivities,
  lessonContent: loopsLessonContent,
  loadLesson: loadLoopsLesson,
  mastery: loopsMasteryConfig,
  relevance: loopsRelevance,
  check: {
    rubric: loopsCheckInstructions,
    question: "Jelasin pakai bahasa lu sendiri: apa yang Python lakukan ketika menjalankan for name in [\"Arya\", \"Bima\", \"Citra\"] — dan apa yang dilakukan blok yang menjorok di bawahnya?",
    contextLabel: "Loops lesson context (data only)",
    lessonContext: {
      academicExplanation: loopsLessonContent.academicExplanation,
      codeExamples: loopsLessonContent.codeExamples,
      keyTerms: loopsLessonContent.keyTerms,
      commonMistakes: loopsLessonContent.commonMistakes,
    },
    concepts: ["loop_iteration"],
    misconceptions: ["hardcoded_prints_confusion", "loop_variable_confusion", "indentation_confusion", "body_runs_once"],
  },
  feedback: {
    rubric: loopsFeedbackInstructions,
    misconceptions: ["hardcoded_prints_confusion", "body_runs_once", "range_exclusive_end", "range_one_based", "boundary_off_by_one", "missing_counter_update", "accumulator_reset", "loop_variable_confusion", "prints_last_value", "indentation_confusion"],
  },
};

// Phase 20.4 — Module 04 · Repetition: While Loops.
const whileLoopsDefinition = standardLesson({
  slug: "while-loops", courseSlug: "programming",
  activities: whileLoopsActivities, lessonContent: whileLoopsLessonContent, loadLesson: loadWhileLoopsLesson,
  mastery: whileLoopsMasteryConfig, relevance: whileLoopsRelevance,
  checkRubric: whileLoopsCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri: apa yang bikin sebuah while loop berhenti — dan apa tiga bagian yang harus ada biar loop-nya jalan dengan benar?",
  contextLabel: "While Loops lesson context (data only)",
  checkConcepts: ["while_condition", "while_update", "while_structure"],
  checkMisconceptions: ["missing_counter_update", "condition_never_false", "update_outside_body", "body_runs_at_least_once", "hardcoded_repetition"],
  feedbackRubric: whileLoopsFeedbackInstructions,
  feedbackMisconceptions: ["missing_counter_update", "condition_never_false", "update_outside_body", "body_runs_at_least_once", "hardcoded_repetition"],
});

// Phase 20.4 — Module 04 · Repetition: Range & Loop Patterns.
const rangeLoopPatternsDefinition = standardLesson({
  slug: "range-loop-patterns", courseSlug: "programming",
  activities: rangeLoopPatternsActivities, lessonContent: rangeLoopPatternsLessonContent, loadLesson: loadRangeLoopPatternsLesson,
  mastery: rangeLoopPatternsMasteryConfig, relevance: rangeLoopPatternsRelevance,
  checkRubric: rangeLoopPatternsCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri: range(1, 4) menghasilkan angka apa saja — dan kenapa angka 4-nya nggak ikut?",
  contextLabel: "Range & Loop Patterns lesson context (data only)",
  checkConcepts: ["range_sequence", "range_boundaries", "range_step"],
  checkMisconceptions: ["range_one_based", "range_inclusive_end", "boundary_off_by_one", "step_confusion", "hardcoded_repetition"],
  feedbackRubric: rangeLoopPatternsFeedbackInstructions,
  feedbackMisconceptions: ["range_one_based", "range_inclusive_end", "boundary_off_by_one", "step_confusion", "hardcoded_repetition"],
});

const functionsDefinition: LessonDefinition = {
  slug: "functions",
  courseSlug: "programming",
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

const propositionsDefinition: LessonDefinition = {
  slug: "propositions",
  courseSlug: "discrete-math",
  activities: propositionsActivities,
  lessonContent: propositionsLessonContent,
  loadLesson: loadPropositionsLesson,
  mastery: propositionsMasteryConfig,
  relevance: propositionsRelevance,
  check: {
    rubric: propositionsCheckInstructions,
    question: "Kalau p bernilai true dan q bernilai false, jelasin dengan kata-kata lu sendiri kenapa p ∧ q bernilai false.",
    contextLabel: "Propositions lesson context (data only)",
    lessonContext: {
      academicExplanation: propositionsLessonContent.academicExplanation,
      codeExamples: propositionsLessonContent.codeExamples,
      keyTerms: propositionsLessonContent.keyTerms,
      commonMistakes: propositionsLessonContent.commonMistakes,
    },
    concepts: ["proposition", "truth_value", "conjunction"],
    misconceptions: ["and_requires_one_true", "and_confused_with_or"],
  },
  feedback: {
    rubric: propositionsFeedbackInstructions,
    misconceptions: ["command_is_proposition", "question_is_proposition", "proposition_requires_true", "and_requires_one_true", "or_is_exclusive"],
  },
};

// Phase 15: factory for standard lessons. Same explicit static registration
// philosophy as the golden lessons above — just less repetition. Every field
// still comes from the lesson's own content modules.
type StandardLessonInput = {
  slug: string;
  courseSlug: string;
  activities: LessonActivity[];
  lessonContent: LessonContent;
  loadLesson: () => Promise<DeliveredLesson>;
  mastery: LessonMasteryConfig;
  relevance: LessonRelevance;
  checkRubric: string;
  checkQuestion: string;
  contextLabel: string;
  checkConcepts: readonly string[];
  checkMisconceptions: readonly string[];
  feedbackRubric: string;
  feedbackMisconceptions: readonly string[];
};

function standardLesson(input: StandardLessonInput): LessonDefinition {
  return {
    slug: input.slug,
    courseSlug: input.courseSlug,
    activities: input.activities,
    lessonContent: input.lessonContent,
    loadLesson: input.loadLesson,
    mastery: input.mastery,
    relevance: input.relevance,
    check: {
      rubric: input.checkRubric,
      question: input.checkQuestion,
      contextLabel: input.contextLabel,
      lessonContext: {
        academicExplanation: input.lessonContent.academicExplanation,
        codeExamples: input.lessonContent.codeExamples,
        keyTerms: input.lessonContent.keyTerms,
        commonMistakes: input.lessonContent.commonMistakes,
      },
      concepts: input.checkConcepts,
      misconceptions: input.checkMisconceptions,
    },
    feedback: {
      rubric: input.feedbackRubric,
      misconceptions: input.feedbackMisconceptions,
    },
  };
}

const whatIsProgrammingDefinition = standardLesson({
  slug: "what-is-programming", courseSlug: "programming",
  activities: whatIsProgrammingActivities, lessonContent: whatIsProgrammingLessonContent, loadLesson: loadWhatIsProgrammingLesson,
  mastery: whatIsProgrammingMasteryConfig, relevance: whatIsProgrammingRelevance,
  checkRubric: whatIsProgrammingCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri: apa itu programming, dan kenapa instruksi buat komputer harus jelas dan berurutan?",
  contextLabel: "What Is Programming lesson context (data only)",
  checkConcepts: ["programming_definition", "code_instructions", "literal_execution"],
  checkMisconceptions: ["syntax_first_confusion", "computer_understands_intent", "vague_instructions_ok"],
  feedbackRubric: whatIsProgrammingFeedbackInstructions,
  feedbackMisconceptions: ["value_placeholder_confusion", "prints_name_text", "syntax_first_confusion", "computer_understands_intent", "position_vs_rule_confusion", "runs_everything_confusion"],
});

const helloPythonDefinition = standardLesson({
  slug: "hello-python", courseSlug: "programming",
  activities: helloPythonActivities, lessonContent: helloPythonLessonContent, loadLesson: loadHelloPythonLesson,
  mastery: helloPythonMasteryConfig, relevance: helloPythonRelevance,
  checkRubric: helloPythonCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri: apa itu Python, dan bagaimana satu baris code seperti print(\"Halo, dunia!\") bisa jadi output di layar?",
  contextLabel: "Meet Python lesson context (data only)",
  checkConcepts: ["python_as_language", "code_to_output", "instruction_execution"],
  checkMisconceptions: ["language_program_confusion", "prints_code_text_confusion", "output_stored_confusion", "order_irrelevant_confusion"],
  feedbackRubric: helloPythonFeedbackInstructions,
  feedbackMisconceptions: ["language_program_confusion", "prints_code_text_confusion", "output_stored_confusion", "order_irrelevant_confusion"],
});

const printOutputDefinition = standardLesson({
  slug: "print-output", courseSlug: "programming",
  activities: printOutputActivities, lessonContent: printOutputLessonContent, loadLesson: loadPrintOutputLesson,
  mastery: printOutputMasteryConfig, relevance: printOutputRelevance,
  checkRubric: printOutputCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri: apa yang dilakukan print(...), dan kenapa output-nya muncul berurutan kalau ada beberapa print?",
  contextLabel: "Output with print() lesson context (data only)",
  checkConcepts: ["output_concept", "print_instruction", "execution_order"],
  checkMisconceptions: ["prints_code_text_confusion", "output_stored_confusion", "order_irrelevant_confusion", "quotes_optional_confusion"],
  feedbackRubric: printOutputFeedbackInstructions,
  feedbackMisconceptions: ["prints_code_text_confusion", "output_stored_confusion", "order_irrelevant_confusion", "quotes_optional_confusion"],
});

const syntaxIndentationDefinition = standardLesson({
  slug: "syntax-indentation", courseSlug: "programming",
  activities: syntaxIndentationActivities, lessonContent: syntaxIndentationLessonContent, loadLesson: loadSyntaxIndentationLesson,
  mastery: syntaxIndentationMasteryConfig, relevance: syntaxIndentationRelevance,
  checkRubric: syntaxIndentationCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri: apa itu syntax di Python, dan kenapa indentation nggak boleh dianggap cuma dekorasi?",
  contextLabel: "Syntax & Indentation lesson context (data only)",
  checkConcepts: ["syntax_rules", "case_sensitivity", "indentation_meaning"],
  checkMisconceptions: ["case_insensitive_confusion", "indentation_decorative_confusion", "whitespace_ignored_confusion"],
  feedbackRubric: syntaxIndentationFeedbackInstructions,
  feedbackMisconceptions: ["case_insensitive_confusion", "indentation_decorative_confusion", "whitespace_ignored_confusion"],
});

const commentsDefinition = standardLesson({
  slug: "comments", courseSlug: "programming",
  activities: commentsActivities, lessonContent: commentsLessonContent, loadLesson: loadCommentsLesson,
  mastery: commentsMasteryConfig, relevance: commentsRelevance,
  checkRubric: commentsCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri: apa itu comment, dan kenapa Python tidak menjalankannya?",
  contextLabel: "Comments lesson context (data only)",
  checkConcepts: ["comment_purpose", "comment_syntax", "code_comment_output"],
  checkMisconceptions: ["comments_executed_confusion", "comments_displayed_confusion", "comment_stops_program_confusion", "comment_syntax_confusion"],
  feedbackRubric: commentsFeedbackInstructions,
  feedbackMisconceptions: ["comments_executed_confusion", "comments_displayed_confusion", "comment_stops_program_confusion", "comment_syntax_confusion"],
});

const understandingErrorsDefinition = standardLesson({
  slug: "understanding-errors", courseSlug: "programming",
  activities: understandingErrorsActivities, lessonContent: understandingErrorsLessonContent, loadLesson: loadUnderstandingErrorsLesson,
  mastery: understandingErrorsMasteryConfig, relevance: understandingErrorsRelevance,
  checkRubric: understandingErrorsCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri: apa yang Python lakukan saat menemukan masalah, dan apa langkah lu setelah melihat pesan error?",
  contextLabel: "Understanding Errors lesson context (data only)",
  checkConcepts: ["error_as_information", "common_error_shapes", "fix_cycle"],
  checkMisconceptions: ["error_dead_end_confusion", "broken_shape_runs_confusion", "guess_without_reading_confusion"],
  feedbackRubric: understandingErrorsFeedbackInstructions,
  feedbackMisconceptions: ["error_dead_end_confusion", "broken_shape_runs_confusion", "guess_without_reading_confusion"],
});

const numbersDefinition = standardLesson({
  slug: "numbers", courseSlug: "programming",
  activities: numbersActivities, lessonContent: numbersLessonContent, loadLesson: loadNumbersLesson,
  mastery: numbersMasteryConfig, relevance: numbersRelevance,
  checkRubric: numbersCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri: apa beda 5 dan 5.0 di Python, dan apa yang Python tampilkan kalau dijalankan print(10 + 5)?",
  contextLabel: "Numbers lesson context (data only)",
  checkConcepts: ["numeric_values", "integer_float", "basic_calculation"],
  checkMisconceptions: ["float_as_int_confusion", "negative_not_numeric_confusion", "quoted_number_confusion", "calculation_result_confusion"],
  feedbackRubric: numbersFeedbackInstructions,
  feedbackMisconceptions: ["float_as_int_confusion", "negative_not_numeric_confusion", "quoted_number_confusion", "calculation_result_confusion"],
});

const castingDefinition = standardLesson({
  slug: "casting", courseSlug: "programming",
  activities: castingActivities, lessonContent: castingLessonContent, loadLesson: loadCastingLesson,
  mastery: castingMasteryConfig, relevance: castingRelevance,
  checkRubric: castingCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri: apa yang berubah setelah int(\"20\") dijalankan, dan apa bedanya dengan \"20\"?",
  contextLabel: "Casting lesson context (data only)",
  checkConcepts: ["type_conversion", "conversion_functions", "conversion_result"],
  checkMisconceptions: ["assignment_changes_type_confusion", "quotes_number_confusion", "wrong_conversion_function", "conversion_always_works_confusion"],
  feedbackRubric: castingFeedbackInstructions,
  feedbackMisconceptions: ["assignment_changes_type_confusion", "quotes_number_confusion", "wrong_conversion_function", "conversion_always_works_confusion"],
});

const stringsDefinition = standardLesson({
  slug: "strings", courseSlug: "programming",
  activities: stringsActivities, lessonContent: stringsLessonContent, loadLesson: loadStringsLesson,
  mastery: stringsMasteryConfig, relevance: stringsRelevance,
  checkRubric: stringsCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri: apa yang membuat sebuah value menjadi string, dan kenapa name[1] pada \"Arya\" hasilnya \"r\"?",
  contextLabel: "Strings lesson context (data only)",
  checkConcepts: ["string_value", "string_concatenation", "string_indexing"],
  checkMisconceptions: ["quoted_number_confusion", "variable_vs_string_confusion", "zero_index_confusion", "string_plus_numeric_plus_confusion"],
  feedbackRubric: stringsFeedbackInstructions,
  feedbackMisconceptions: ["quoted_number_confusion", "variable_vs_string_confusion", "zero_index_confusion", "string_plus_numeric_plus_confusion"],
});

const booleansDefinition = standardLesson({
  slug: "booleans", courseSlug: "programming",
  activities: booleansActivities, lessonContent: booleansLessonContent, loadLesson: loadBooleansLesson,
  mastery: booleansMasteryConfig, relevance: booleansRelevance,
  checkRubric: booleansCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri: apa beda True dan \"True\", dan dari mana value True bisa berasal?",
  contextLabel: "Booleans lesson context (data only)",
  checkConcepts: ["boolean_value", "boolean_literal", "boolean_result"],
  checkMisconceptions: ["quoted_boolean_confusion", "lowercase_boolean_confusion", "assignment_comparison_confusion", "boolean_as_text_confusion"],
  feedbackRubric: booleansFeedbackInstructions,
  feedbackMisconceptions: ["quoted_boolean_confusion", "lowercase_boolean_confusion", "assignment_comparison_confusion", "boolean_as_text_confusion"],
});

const userInputDefinition = standardLesson({
  slug: "user-input", courseSlug: "programming",
  activities: userInputActivities, lessonContent: userInputLessonContent, loadLesson: loadUserInputLesson,
  mastery: userInputMasteryConfig, relevance: userInputRelevance,
  checkRubric: userInputCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri: apa yang diterima program setelah input(\"Age: \") diisi 20 — dan bagaimana cara mengubahnya jadi angka?",
  contextLabel: "User Input lesson context (data only)",
  checkConcepts: ["user_input", "input_returns_string", "input_conversion"],
  checkMisconceptions: ["input_is_number_confusion", "input_vs_output_confusion", "hardcoded_value_confusion", "conversion_order_confusion"],
  feedbackRubric: userInputFeedbackInstructions,
  feedbackMisconceptions: ["input_is_number_confusion", "input_vs_output_confusion", "hardcoded_value_confusion", "conversion_order_confusion"],
});

const implicationDefinition = standardLesson({
  slug: "implication", courseSlug: "discrete-math",
  activities: implicationActivities, lessonContent: implicationLessonContent, loadLesson: loadImplicationLesson,
  mastery: implicationMasteryConfig, relevance: implicationRelevance,
  checkRubric: implicationCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri: kenapa p → q cuma bernilai false ketika p benar tapi q salah?",
  contextLabel: "Implication lesson context (data only)",
  checkConcepts: ["implication"], checkMisconceptions: ["false_case_missed", "converse_confusion"],
  feedbackRubric: implicationFeedbackInstructions,
  feedbackMisconceptions: ["false_case_missed", "vacuous_truth_rejected", "converse_confusion"],
});

const setsIntroDefinition = standardLesson({
  slug: "sets-intro", courseSlug: "discrete-math",
  activities: setsIntroActivities, lessonContent: setsIntroLessonContent, loadLesson: loadSetsIntroLesson,
  mastery: setsIntroMasteryConfig, relevance: setsIntroRelevance,
  checkRubric: setsIntroCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri bedanya 2 ∈ A dan {2} ⊆ A, pakai contoh A = {1, 2, 3}.",
  contextLabel: "Sets intro lesson context (data only)",
  checkConcepts: ["set", "membership", "subset"], checkMisconceptions: ["element_subset_confusion", "subset_requires_all"],
  feedbackRubric: setsIntroFeedbackInstructions,
  feedbackMisconceptions: ["membership_check_failed", "subset_requires_all", "element_subset_confusion"],
});

const whatIsDesignThinkingDefinition = standardLesson({
  slug: "what-is-design-thinking", courseSlug: "design-thinking",
  activities: whatIsDesignThinkingActivities, lessonContent: whatIsDesignThinkingLessonContent, loadLesson: loadWhatIsDesignThinkingLesson,
  mastery: whatIsDesignThinkingMasteryConfig, relevance: whatIsDesignThinkingRelevance,
  checkRubric: whatIsDesignThinkingCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri kenapa design thinking disebut human-centered dan iteratif — dan kenapa dua sifat itu nyambung.",
  contextLabel: "Design Thinking intro lesson context (data only)",
  checkConcepts: ["design_process", "human_centered"], checkMisconceptions: ["linear_pipeline_confusion", "solution_first_confusion"],
  feedbackRubric: whatIsDesignThinkingFeedbackInstructions,
  feedbackMisconceptions: ["linear_pipeline_confusion", "solution_first_confusion"],
});

const empathyAndDefineDefinition = standardLesson({
  slug: "empathy-and-define", courseSlug: "design-thinking",
  activities: empathyAndDefineActivities, lessonContent: empathyAndDefineLessonContent, loadLesson: loadEmpathyAndDefineLesson,
  mastery: empathyAndDefineMasteryConfig, relevance: empathyAndDefineRelevance,
  checkRubric: empathyAndDefineCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri bedanya observasi dan asumsi di kerja empathy — dan kenapa problem definition yang bagus nggak menyebut solusi.",
  contextLabel: "Empathy & Define lesson context (data only)",
  checkConcepts: ["empathy", "problem_definition"], checkMisconceptions: ["observation_assumption_confusion", "vague_problem_confusion"],
  feedbackRubric: empathyAndDefineFeedbackInstructions,
  feedbackMisconceptions: ["observation_assumption_confusion", "vague_problem_confusion"],
});

const ideatePrototypeTestDefinition = standardLesson({
  slug: "ideate-prototype-test", courseSlug: "design-thinking",
  activities: ideatePrototypeTestActivities, lessonContent: ideatePrototypeTestLessonContent, loadLesson: loadIdeatePrototypeTestLesson,
  mastery: ideatePrototypeTestMasteryConfig, relevance: ideatePrototypeTestRelevance,
  checkRubric: ideatePrototypeTestCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri kenapa prototyping dan testing itu lebih murah daripada langsung membangun produknya — dan apa yang sebenarnya dicari saat testing.",
  contextLabel: "Ideate-Prototype-Test lesson context (data only)",
  checkConcepts: ["prototyping", "testing"], checkMisconceptions: ["prototype_as_product_confusion", "blame_the_user"],
  feedbackRubric: ideatePrototypeTestFeedbackInstructions,
  feedbackMisconceptions: ["first_idea_committed", "prototype_as_product_confusion", "blame_the_user"],
});

const hciIntroDefinition = standardLesson({
  slug: "hci-intro", courseSlug: "hci",
  activities: hciIntroActivities, lessonContent: hciIntroLessonContent, loadLesson: loadHciIntroLesson,
  mastery: hciIntroMasteryConfig, relevance: hciIntroRelevance,
  checkRubric: hciIntroCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri kenapa usability itu sifat dari interaksi, bukan sifat tetap penggunanya — pakai contoh kalau bisa.",
  contextLabel: "HCI intro lesson context (data only)",
  checkConcepts: ["interaction", "usability"], checkMisconceptions: ["blame_the_user", "minimalism_over_recovery"],
  feedbackRubric: hciIntroFeedbackInstructions,
  feedbackMisconceptions: ["blame_the_user", "minimalism_over_recovery"],
});

const affordancesAndFeedbackDefinition = standardLesson({
  slug: "affordances-and-feedback", courseSlug: "hci",
  activities: affordancesAndFeedbackActivities, lessonContent: affordancesAndFeedbackLessonContent, loadLesson: loadAffordancesAndFeedbackLesson,
  mastery: affordancesAndFeedbackMasteryConfig, relevance: affordancesAndFeedbackRelevance,
  checkRubric: affordancesAndFeedbackCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri bedanya affordance dan feedback — dan kenapa tombol yang nggak merespon setelah ditekan itu masalah desain, bukan masalah pengguna.",
  contextLabel: "Affordances & Feedback lesson context (data only)",
  checkConcepts: ["affordance", "feedback"], checkMisconceptions: ["fake_clickable_confusion", "silence_confusion"],
  feedbackRubric: affordancesAndFeedbackFeedbackInstructions,
  feedbackMisconceptions: ["affordance_confusion", "fake_clickable_confusion", "silence_confusion"],
});

const interfaceEvaluationDefinition = standardLesson({
  slug: "interface-evaluation", courseSlug: "hci",
  activities: interfaceEvaluationActivities, lessonContent: interfaceEvaluationLessonContent, loadLesson: loadInterfaceEvaluationLesson,
  mastery: interfaceEvaluationMasteryConfig, relevance: interfaceEvaluationRelevance,
  checkRubric: interfaceEvaluationCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri bedanya usability testing dan heuristic evaluation — dan kenapa keduanya saling melengkapi, bukan saling menggantikan.",
  contextLabel: "Interface Evaluation lesson context (data only)",
  checkConcepts: ["usability_testing", "heuristic_evaluation"], checkMisconceptions: ["analytics_substitutes_evaluation", "user_as_designer"],
  feedbackRubric: interfaceEvaluationFeedbackInstructions,
  feedbackMisconceptions: ["analytics_substitutes_evaluation", "user_as_designer"],
});

const whatIsAnAlgorithmDefinition = standardLesson({
  slug: "what-is-an-algorithm", courseSlug: "algorithms",
  activities: whatIsAnAlgorithmActivities, lessonContent: whatIsAnAlgorithmLessonContent, loadLesson: loadWhatIsAnAlgorithmLesson,
  mastery: whatIsAnAlgorithmMasteryConfig, relevance: whatIsAnAlgorithmRelevance,
  checkRubric: whatIsAnAlgorithmCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri bedanya algoritma dan program — dan sebutkan dua syarat yang bikin urutan langkah layak disebut algoritma.",
  contextLabel: "What Is an Algorithm lesson context (data only)",
  checkConcepts: ["algorithm_definition", "algorithm_properties"], checkMisconceptions: ["ambiguity_confusion", "termination_confusion"],
  feedbackRubric: whatIsAnAlgorithmFeedbackInstructions,
  feedbackMisconceptions: ["ambiguity_confusion", "termination_confusion"],
});

const pseudocodeAndTracingDefinition = standardLesson({
  slug: "pseudocode-and-tracing", courseSlug: "algorithms",
  activities: pseudocodeAndTracingActivities, lessonContent: pseudocodeAndTracingLessonContent, loadLesson: loadPseudocodeAndTracingLesson,
  mastery: pseudocodeAndTracingMasteryConfig, relevance: pseudocodeAndTracingRelevance,
  checkRubric: pseudocodeAndTracingCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri kenapa tracing pakai tabel itu berguna — dan apa aturan mainnya supaya trace-nya jujur.",
  contextLabel: "Pseudocode & Tracing lesson context (data only)",
  checkConcepts: ["tracing"], checkMisconceptions: ["trace_condition_failed", "trace_stops_early"],
  feedbackRubric: pseudocodeAndTracingFeedbackInstructions,
  feedbackMisconceptions: ["trace_condition_failed", "trace_stops_early"],
});

const efficiencyIntuitionDefinition = standardLesson({
  slug: "efficiency-intuition", courseSlug: "algorithms",
  activities: efficiencyIntuitionActivities, lessonContent: efficiencyIntuitionLessonContent, loadLesson: loadEfficiencyIntuitionLesson,
  mastery: efficiencyIntuitionMasteryConfig, relevance: efficiencyIntuitionRelevance,
  checkRubric: efficiencyIntuitionCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri kenapa “berapa detik” itu ukuran efisiensi yang buruk — dan apa yang sebaiknya dihitung, pakai contoh linear vs binary search.",
  contextLabel: "Efficiency Intuition lesson context (data only)",
  checkConcepts: ["growth_rate"], checkMisconceptions: ["seconds_confusion", "linear_assumption", "precondition_ignored"],
  feedbackRubric: efficiencyIntuitionFeedbackInstructions,
  feedbackMisconceptions: ["seconds_confusion", "linear_assumption", "precondition_ignored"],
});

const sequentialVsParallelDefinition = standardLesson({
  slug: "sequential-vs-parallel", courseSlug: "parallel",
  activities: sequentialVsParallelActivities, lessonContent: sequentialVsParallelLessonContent, loadLesson: loadSequentialVsParallelLesson,
  mastery: sequentialVsParallelMasteryConfig, relevance: sequentialVsParallelRelevance,
  checkRubric: sequentialVsParallelCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri kenapa nambah prosesor nggak selalu bikin program jauh lebih cepat — pakai ide bagian yang harus tetap berurutan.",
  contextLabel: "Sequential vs Parallel lesson context (data only)",
  checkConcepts: ["parallelism", "dependencies"], checkMisconceptions: ["amdahl_ignored", "dependency_ignored"],
  feedbackRubric: sequentialVsParallelFeedbackInstructions,
  feedbackMisconceptions: ["dependency_ignored", "amdahl_ignored"],
});

const distributedBasicsDefinition = standardLesson({
  slug: "distributed-basics", courseSlug: "parallel",
  activities: distributedBasicsActivities, lessonContent: distributedBasicsLessonContent, loadLesson: loadDistributedBasicsLesson,
  mastery: distributedBasicsMasteryConfig, relevance: distributedBasicsRelevance,
  checkRubric: distributedBasicsCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri kenapa sistem terdistribusi lebih tahan mati-matian satu mesin — dan apa harga yang harus dibayarnya.",
  contextLabel: "Distributed Basics lesson context (data only)",
  checkConcepts: ["distribution_model", "failure_handling"], checkMisconceptions: ["shared_memory_confusion", "free_speedup_confusion"],
  feedbackRubric: distributedBasicsFeedbackInstructions,
  feedbackMisconceptions: ["shared_memory_confusion", "failure_mode_confusion", "free_speedup_confusion"],
});

const whatIsANetworkDefinition = standardLesson({
  slug: "what-is-a-network", courseSlug: "networking",
  activities: whatIsANetworkActivities, lessonContent: whatIsANetworkLessonContent, loadLesson: loadWhatIsANetworkLesson,
  mastery: whatIsANetworkMasteryConfig, relevance: whatIsANetworkRelevance,
  checkRubric: whatIsANetworkCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri kenapa dua perangkat yang tersambung kabel belum tentu bisa saling ngobrol — dan apa yang mengubahnya jadi bisa.",
  contextLabel: "What Is a Network lesson context (data only)",
  checkConcepts: ["network_structure", "protocols"], checkMisconceptions: ["connection_equals_communication", "single_owner_confusion"],
  feedbackRubric: whatIsANetworkFeedbackInstructions,
  feedbackMisconceptions: ["connection_equals_communication", "single_owner_confusion"],
});

const packetsAndProtocolsDefinition = standardLesson({
  slug: "packets-and-protocols", courseSlug: "networking",
  activities: packetsAndProtocolsActivities, lessonContent: packetsAndProtocolsLessonContent, loadLesson: loadPacketsAndProtocolsLesson,
  mastery: packetsAndProtocolsMasteryConfig, relevance: packetsAndProtocolsRelevance,
  checkRubric: packetsAndProtocolsCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri kenapa jaringan ngirim data dalam paket-paket kecil bernomor — dan apa keuntungannya dibanding kirim sekaligus.",
  contextLabel: "Packets & Protocols lesson context (data only)",
  checkConcepts: ["packet_switching"], checkMisconceptions: ["order_confusion", "lossless_wire_confusion"],
  feedbackRubric: packetsAndProtocolsFeedbackInstructions,
  feedbackMisconceptions: ["order_confusion", "lossless_wire_confusion"],
});

const clientServerAndLayersDefinition = standardLesson({
  slug: "client-server-and-layers", courseSlug: "networking",
  activities: clientServerAndLayersActivities, lessonContent: clientServerAndLayersLessonContent, loadLesson: loadClientServerAndLayersLesson,
  mastery: clientServerAndLayersMasteryConfig, relevance: clientServerAndLayersRelevance,
  checkRubric: clientServerAndLayersCheckInstructions, checkQuestion: "Jelasin pakai bahasa lu sendiri kenapa jaringan diatur per lapisan (layer) — dan apa untungnya buat aplikasi baru yang mau lahir.",
  contextLabel: "Client-Server & Layers lesson context (data only)",
  checkConcepts: ["layering"], checkMisconceptions: ["server_initiates_confusion", "layering_confusion"],
  feedbackRubric: clientServerAndLayersFeedbackInstructions,
  feedbackMisconceptions: ["server_initiates_confusion", "dns_role_confusion", "layering_confusion"],
});

// Explicit static registration — no dynamic loading, no filesystem discovery.
const registry: Map<string, LessonDefinition> = new Map([
  ["variables", variablesDefinition],
  ["what-is-programming", whatIsProgrammingDefinition],
  ["hello-python", helloPythonDefinition],
  ["print-output", printOutputDefinition],
  ["syntax-indentation", syntaxIndentationDefinition],
  ["comments", commentsDefinition],
  ["understanding-errors", understandingErrorsDefinition],
  ["numbers", numbersDefinition],
  ["casting", castingDefinition],
  ["strings", stringsDefinition],
  ["booleans", booleansDefinition],
  ["user-input", userInputDefinition],
  ["data-types", dataTypesDefinition],
  ["operators", operatorsDefinition],
  ["conditionals", conditionalsDefinition],
  ["loops", loopsDefinition],
  ["while-loops", whileLoopsDefinition],
  ["range-loop-patterns", rangeLoopPatternsDefinition],
  ["functions", functionsDefinition],
  ["propositions", propositionsDefinition],
  ["implication", implicationDefinition],
  ["sets-intro", setsIntroDefinition],
  ["what-is-design-thinking", whatIsDesignThinkingDefinition],
  ["empathy-and-define", empathyAndDefineDefinition],
  ["ideate-prototype-test", ideatePrototypeTestDefinition],
  ["hci-intro", hciIntroDefinition],
  ["affordances-and-feedback", affordancesAndFeedbackDefinition],
  ["interface-evaluation", interfaceEvaluationDefinition],
  ["what-is-an-algorithm", whatIsAnAlgorithmDefinition],
  ["pseudocode-and-tracing", pseudocodeAndTracingDefinition],
  ["efficiency-intuition", efficiencyIntuitionDefinition],
  ["sequential-vs-parallel", sequentialVsParallelDefinition],
  ["distributed-basics", distributedBasicsDefinition],
  ["what-is-a-network", whatIsANetworkDefinition],
  ["packets-and-protocols", packetsAndProtocolsDefinition],
  ["client-server-and-layers", clientServerAndLayersDefinition],
]);

export function getLessonDefinition(slug: string): LessonDefinition | null {
  return registry.get(slug) ?? null;
}

export function isRegisteredLesson(slug: string): boolean {
  return registry.has(slug);
}

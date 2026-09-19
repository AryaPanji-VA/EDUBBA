// Client-safe lesson display registry (Phase 15).
// Maps lesson slug → per-lesson UI material (localized activities, content,
// copy, mastery labels, reinforcement). Kept separate from the server-only
// lesson registry (lib/lessons/registry.ts) because loaders import
// "server-only"; this module must stay importable from client components.
// Lesson slugs are globally unique across courses, so one flat map serves all.

import type { LessonActivity } from "@/content/lessons/activities";
import type { LessonContent } from "@/content/lessons/types";
import type { LessonLanguage } from "@/content/lessons/shared-copy";
import type { CheckEvaluation } from "@/lib/robin/check";

// Golden lessons (existing bespoke components)
import { getVariablesActivities, localizeVariablesContent, lessonCopy as variablesLessonCopy } from "@/content/lessons/variables-localization";
import { variablesMasteryConceptLabels, variablesReinforcement } from "@/content/lessons/programming/variables-lesson-config";
import { getDataTypesActivities, localizeDataTypesContent, dataTypesCopy } from "@/content/lessons/programming/data-types-localization";
import { dataTypesMasteryConceptLabels } from "@/content/lessons/programming/data-types-lesson-config";
import { getOperatorsActivities, localizeOperatorsContent, operatorsCopy } from "@/content/lessons/programming/operators-localization";
import { operatorsMasteryConceptLabels, operatorsReinforcement } from "@/content/lessons/programming/operators-lesson-config";
import { getConditionalsActivities, localizeConditionalsContent, conditionalsCopy } from "@/content/lessons/programming/conditionals-localization";
import { conditionalsMasteryConceptLabels, conditionalsReinforcement } from "@/content/lessons/programming/conditionals-lesson-config";
import { getLoopsActivities, localizeLoopsContent, loopsCopy } from "@/content/lessons/programming/loops-localization";
import { loopsMasteryConceptLabels, loopsReinforcement } from "@/content/lessons/programming/loops-lesson-config";
import { getFunctionsActivities, localizeFunctionsContent, functionsCopy } from "@/content/lessons/programming/functions-localization";
import { functionsMasteryConceptLabels, functionsReinforcement } from "@/content/lessons/programming/functions-lesson-config";
import { getWhatIsProgrammingActivities, localizeWhatIsProgrammingContent, whatIsProgrammingCopy, whatIsProgrammingMasteryConceptLabels, whatIsProgrammingReinforcement } from "@/content/lessons/programming/what-is-programming-localization";
import { getHelloPythonActivities, localizeHelloPythonContent, helloPythonCopy, helloPythonMasteryConceptLabels, helloPythonReinforcement } from "@/content/lessons/programming/hello-python-localization";
import { getPrintOutputActivities, localizePrintOutputContent, printOutputCopy, printOutputMasteryConceptLabels, printOutputReinforcement } from "@/content/lessons/programming/print-output-localization";
import { getSyntaxIndentationActivities, localizeSyntaxIndentationContent, syntaxIndentationCopy, syntaxIndentationMasteryConceptLabels, syntaxIndentationReinforcement } from "@/content/lessons/programming/syntax-indentation-localization";
import { getCommentsActivities, localizeCommentsContent, commentsCopy, commentsMasteryConceptLabels, commentsReinforcement } from "@/content/lessons/programming/comments-localization";
import { getUnderstandingErrorsActivities, localizeUnderstandingErrorsContent, understandingErrorsCopy, understandingErrorsMasteryConceptLabels, understandingErrorsReinforcement } from "@/content/lessons/programming/understanding-errors-localization";
import { getNumbersActivities, localizeNumbersContent, numbersCopy, numbersMasteryConceptLabels, numbersReinforcement } from "@/content/lessons/programming/numbers-localization";
import { getCastingActivities, localizeCastingContent, castingCopy, castingMasteryConceptLabels, castingReinforcement } from "@/content/lessons/programming/casting-localization";
import { getStringsActivities, localizeStringsContent, stringsCopy, stringsMasteryConceptLabels, stringsReinforcement } from "@/content/lessons/programming/strings-localization";
import { getBooleansActivities, localizeBooleansContent, booleansCopy, booleansMasteryConceptLabels, booleansReinforcement } from "@/content/lessons/programming/booleans-localization";
import { getPropositionsActivities, localizePropositionsContent, propositionsCopy } from "@/content/lessons/discrete-math/propositions-localization";
import { propositionsMasteryConceptLabels, propositionsReinforcement } from "@/content/lessons/discrete-math/propositions-lesson-config";
// Standard lessons (Phase 15) — localization modules also export labels and
// reinforcement where the lesson uses Robin Check.
import { getImplicationActivities, localizeImplicationContent, implicationCopy, implicationMasteryConceptLabels, implicationReinforcement } from "@/content/lessons/discrete-math/implication-localization";
import { getSetsIntroActivities, localizeSetsIntroContent, setsIntroCopy, setsIntroMasteryConceptLabels, setsIntroReinforcement } from "@/content/lessons/discrete-math/sets-intro-localization";
import { getWhatIsDesignThinkingActivities, localizeWhatIsDesignThinkingContent, whatIsDesignThinkingCopy, whatIsDesignThinkingMasteryConceptLabels, whatIsDesignThinkingReinforcement } from "@/content/lessons/design-thinking/what-is-design-thinking-localization";
import { getEmpathyAndDefineActivities, localizeEmpathyAndDefineContent, empathyAndDefineCopy, empathyAndDefineMasteryConceptLabels, empathyAndDefineReinforcement } from "@/content/lessons/design-thinking/empathy-and-define-localization";
import { getIdeatePrototypeTestActivities, localizeIdeatePrototypeTestContent, ideatePrototypeTestCopy, ideatePrototypeTestMasteryConceptLabels, ideatePrototypeTestReinforcement } from "@/content/lessons/design-thinking/ideate-prototype-test-localization";
import { getHciIntroActivities, localizeHciIntroContent, hciIntroCopy, hciIntroMasteryConceptLabels, hciIntroReinforcement } from "@/content/lessons/hci/hci-intro-localization";
import { getAffordancesAndFeedbackActivities, localizeAffordancesAndFeedbackContent, affordancesAndFeedbackCopy, affordancesAndFeedbackMasteryConceptLabels, affordancesAndFeedbackReinforcement } from "@/content/lessons/hci/affordances-and-feedback-localization";
import { getInterfaceEvaluationActivities, localizeInterfaceEvaluationContent, interfaceEvaluationCopy, interfaceEvaluationMasteryConceptLabels, interfaceEvaluationReinforcement } from "@/content/lessons/hci/interface-evaluation-localization";
import { getWhatIsAnAlgorithmActivities, localizeWhatIsAnAlgorithmContent, whatIsAnAlgorithmCopy, whatIsAnAlgorithmMasteryConceptLabels, whatIsAnAlgorithmReinforcement } from "@/content/lessons/algorithms/what-is-an-algorithm-localization";
import { getPseudocodeAndTracingActivities, localizePseudocodeAndTracingContent, pseudocodeAndTracingCopy, pseudocodeAndTracingMasteryConceptLabels, pseudocodeAndTracingReinforcement } from "@/content/lessons/algorithms/pseudocode-and-tracing-localization";
import { getEfficiencyIntuitionActivities, localizeEfficiencyIntuitionContent, efficiencyIntuitionCopy, efficiencyIntuitionMasteryConceptLabels, efficiencyIntuitionReinforcement } from "@/content/lessons/algorithms/efficiency-intuition-localization";
import { getSequentialVsParallelActivities, localizeSequentialVsParallelContent, sequentialVsParallelCopy, sequentialVsParallelMasteryConceptLabels, sequentialVsParallelReinforcement } from "@/content/lessons/parallel/sequential-vs-parallel-localization";
import { getDistributedBasicsActivities, localizeDistributedBasicsContent, distributedBasicsCopy, distributedBasicsMasteryConceptLabels, distributedBasicsReinforcement } from "@/content/lessons/parallel/distributed-basics-localization";
import { getWhatIsANetworkActivities, localizeWhatIsANetworkContent, whatIsANetworkCopy, whatIsANetworkMasteryConceptLabels, whatIsANetworkReinforcement } from "@/content/lessons/networking/what-is-a-network-localization";
import { getPacketsAndProtocolsActivities, localizePacketsAndProtocolsContent, packetsAndProtocolsCopy, packetsAndProtocolsMasteryConceptLabels, packetsAndProtocolsReinforcement } from "@/content/lessons/networking/packets-and-protocols-localization";
import { getClientServerAndLayersActivities, localizeClientServerAndLayersContent, clientServerAndLayersCopy, clientServerAndLayersMasteryConceptLabels, clientServerAndLayersReinforcement } from "@/content/lessons/networking/client-server-and-layers-localization";

export type LessonDisplay = {
  getActivities: (language: LessonLanguage) => LessonActivity[];
  localizeContent: (content: LessonContent, language: LessonLanguage) => LessonContent;
  copy: Record<LessonLanguage, Record<string, string>>;
  masteryConceptLabels?: Record<string, string>;
  reinforcement?: (result: CheckEvaluation, language: LessonLanguage) => string;
};

const displays: Map<string, LessonDisplay> = new Map([
  ["variables", { getActivities: getVariablesActivities, localizeContent: localizeVariablesContent, copy: variablesLessonCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: variablesMasteryConceptLabels, reinforcement: variablesReinforcement }],
  ["data-types", { getActivities: getDataTypesActivities, localizeContent: localizeDataTypesContent, copy: dataTypesCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: dataTypesMasteryConceptLabels }],
  ["operators", { getActivities: getOperatorsActivities, localizeContent: localizeOperatorsContent, copy: operatorsCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: operatorsMasteryConceptLabels, reinforcement: operatorsReinforcement }],
  ["conditionals", { getActivities: getConditionalsActivities, localizeContent: localizeConditionalsContent, copy: conditionalsCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: conditionalsMasteryConceptLabels, reinforcement: conditionalsReinforcement }],
  ["loops", { getActivities: getLoopsActivities, localizeContent: localizeLoopsContent, copy: loopsCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: loopsMasteryConceptLabels, reinforcement: loopsReinforcement }],
  ["functions", { getActivities: getFunctionsActivities, localizeContent: localizeFunctionsContent, copy: functionsCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: functionsMasteryConceptLabels, reinforcement: functionsReinforcement }],
  ["what-is-programming", { getActivities: getWhatIsProgrammingActivities, localizeContent: localizeWhatIsProgrammingContent, copy: whatIsProgrammingCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: whatIsProgrammingMasteryConceptLabels, reinforcement: whatIsProgrammingReinforcement }],
  ["hello-python", { getActivities: getHelloPythonActivities, localizeContent: localizeHelloPythonContent, copy: helloPythonCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: helloPythonMasteryConceptLabels, reinforcement: helloPythonReinforcement }],
  ["print-output", { getActivities: getPrintOutputActivities, localizeContent: localizePrintOutputContent, copy: printOutputCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: printOutputMasteryConceptLabels, reinforcement: printOutputReinforcement }],
  ["syntax-indentation", { getActivities: getSyntaxIndentationActivities, localizeContent: localizeSyntaxIndentationContent, copy: syntaxIndentationCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: syntaxIndentationMasteryConceptLabels, reinforcement: syntaxIndentationReinforcement }],
  ["comments", { getActivities: getCommentsActivities, localizeContent: localizeCommentsContent, copy: commentsCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: commentsMasteryConceptLabels, reinforcement: commentsReinforcement }],
  ["understanding-errors", { getActivities: getUnderstandingErrorsActivities, localizeContent: localizeUnderstandingErrorsContent, copy: understandingErrorsCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: understandingErrorsMasteryConceptLabels, reinforcement: understandingErrorsReinforcement }],
  ["numbers", { getActivities: getNumbersActivities, localizeContent: localizeNumbersContent, copy: numbersCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: numbersMasteryConceptLabels, reinforcement: numbersReinforcement }],
  ["casting", { getActivities: getCastingActivities, localizeContent: localizeCastingContent, copy: castingCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: castingMasteryConceptLabels, reinforcement: castingReinforcement }],
  ["strings", { getActivities: getStringsActivities, localizeContent: localizeStringsContent, copy: stringsCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: stringsMasteryConceptLabels, reinforcement: stringsReinforcement }],
  ["booleans", { getActivities: getBooleansActivities, localizeContent: localizeBooleansContent, copy: booleansCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: booleansMasteryConceptLabels, reinforcement: booleansReinforcement }],
  ["propositions", { getActivities: getPropositionsActivities, localizeContent: localizePropositionsContent, copy: propositionsCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: propositionsMasteryConceptLabels, reinforcement: propositionsReinforcement }],
  ["implication", { getActivities: getImplicationActivities, localizeContent: localizeImplicationContent, copy: implicationCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: implicationMasteryConceptLabels, reinforcement: implicationReinforcement }],
  ["sets-intro", { getActivities: getSetsIntroActivities, localizeContent: localizeSetsIntroContent, copy: setsIntroCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: setsIntroMasteryConceptLabels, reinforcement: setsIntroReinforcement }],
  ["what-is-design-thinking", { getActivities: getWhatIsDesignThinkingActivities, localizeContent: localizeWhatIsDesignThinkingContent, copy: whatIsDesignThinkingCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: whatIsDesignThinkingMasteryConceptLabels, reinforcement: whatIsDesignThinkingReinforcement }],
  ["empathy-and-define", { getActivities: getEmpathyAndDefineActivities, localizeContent: localizeEmpathyAndDefineContent, copy: empathyAndDefineCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: empathyAndDefineMasteryConceptLabels, reinforcement: empathyAndDefineReinforcement }],
  ["ideate-prototype-test", { getActivities: getIdeatePrototypeTestActivities, localizeContent: localizeIdeatePrototypeTestContent, copy: ideatePrototypeTestCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: ideatePrototypeTestMasteryConceptLabels, reinforcement: ideatePrototypeTestReinforcement }],
  ["hci-intro", { getActivities: getHciIntroActivities, localizeContent: localizeHciIntroContent, copy: hciIntroCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: hciIntroMasteryConceptLabels, reinforcement: hciIntroReinforcement }],
  ["affordances-and-feedback", { getActivities: getAffordancesAndFeedbackActivities, localizeContent: localizeAffordancesAndFeedbackContent, copy: affordancesAndFeedbackCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: affordancesAndFeedbackMasteryConceptLabels, reinforcement: affordancesAndFeedbackReinforcement }],
  ["interface-evaluation", { getActivities: getInterfaceEvaluationActivities, localizeContent: localizeInterfaceEvaluationContent, copy: interfaceEvaluationCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: interfaceEvaluationMasteryConceptLabels, reinforcement: interfaceEvaluationReinforcement }],
  ["what-is-an-algorithm", { getActivities: getWhatIsAnAlgorithmActivities, localizeContent: localizeWhatIsAnAlgorithmContent, copy: whatIsAnAlgorithmCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: whatIsAnAlgorithmMasteryConceptLabels, reinforcement: whatIsAnAlgorithmReinforcement }],
  ["pseudocode-and-tracing", { getActivities: getPseudocodeAndTracingActivities, localizeContent: localizePseudocodeAndTracingContent, copy: pseudocodeAndTracingCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: pseudocodeAndTracingMasteryConceptLabels, reinforcement: pseudocodeAndTracingReinforcement }],
  ["efficiency-intuition", { getActivities: getEfficiencyIntuitionActivities, localizeContent: localizeEfficiencyIntuitionContent, copy: efficiencyIntuitionCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: efficiencyIntuitionMasteryConceptLabels, reinforcement: efficiencyIntuitionReinforcement }],
  ["sequential-vs-parallel", { getActivities: getSequentialVsParallelActivities, localizeContent: localizeSequentialVsParallelContent, copy: sequentialVsParallelCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: sequentialVsParallelMasteryConceptLabels, reinforcement: sequentialVsParallelReinforcement }],
  ["distributed-basics", { getActivities: getDistributedBasicsActivities, localizeContent: localizeDistributedBasicsContent, copy: distributedBasicsCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: distributedBasicsMasteryConceptLabels, reinforcement: distributedBasicsReinforcement }],
  ["what-is-a-network", { getActivities: getWhatIsANetworkActivities, localizeContent: localizeWhatIsANetworkContent, copy: whatIsANetworkCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: whatIsANetworkMasteryConceptLabels, reinforcement: whatIsANetworkReinforcement }],
  ["packets-and-protocols", { getActivities: getPacketsAndProtocolsActivities, localizeContent: localizePacketsAndProtocolsContent, copy: packetsAndProtocolsCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: packetsAndProtocolsMasteryConceptLabels, reinforcement: packetsAndProtocolsReinforcement }],
  ["client-server-and-layers", { getActivities: getClientServerAndLayersActivities, localizeContent: localizeClientServerAndLayersContent, copy: clientServerAndLayersCopy as Record<LessonLanguage, Record<string, string>>, masteryConceptLabels: clientServerAndLayersMasteryConceptLabels, reinforcement: clientServerAndLayersReinforcement }],
]);

export function getLessonDisplay(slug: string): LessonDisplay | null {
  return displays.get(slug) ?? null;
}

export function isDisplayableLesson(slug: string): boolean {
  return displays.has(slug);
}

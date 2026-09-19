// Shared test helper: builds vm-global stubs for the Phase 15 standard
// lessons registered in lib/lessons/registry.ts, plus loads their real
// activities where a test wants genuine data. Mirrors the stub pattern used
// for the golden lessons in each registry-loading test.

import { readFileSync } from "node:fs";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";

// Standard lessons registered via the standardLesson factory. [slug, courseSlug]
// Phase 15 batch plus the Phase 20.1A beginner onboarding lesson.
export const standardLessons = [
  ["what-is-programming", "programming"],
  ["hello-python", "programming"],
  ["print-output", "programming"],
  ["syntax-indentation", "programming"],
  ["comments", "programming"],
  ["understanding-errors", "programming"],
  ["numbers", "programming"],
  ["casting", "programming"],
  ["strings", "programming"],
  ["booleans", "programming"],
  ["user-input", "programming"],
  ["while-loops", "programming"],
  ["range-loop-patterns", "programming"],
  ["implication", "discrete-math"],
  ["sets-intro", "discrete-math"],
  ["what-is-design-thinking", "design-thinking"],
  ["empathy-and-define", "design-thinking"],
  ["ideate-prototype-test", "design-thinking"],
  ["hci-intro", "hci"],
  ["affordances-and-feedback", "hci"],
  ["interface-evaluation", "hci"],
  ["what-is-an-algorithm", "algorithms"],
  ["pseudocode-and-tracing", "algorithms"],
  ["efficiency-intuition", "algorithms"],
  ["sequential-vs-parallel", "parallel"],
  ["distributed-basics", "parallel"],
  ["what-is-a-network", "networking"],
  ["packets-and-protocols", "networking"],
  ["client-server-and-layers", "networking"],
];

const contentBase = {
  programming: "content/lessons/programming",
  "discrete-math": "content/lessons/discrete-math",
  "design-thinking": "content/lessons/design-thinking",
  hci: "content/lessons/hci",
  algorithms: "content/lessons/algorithms",
  parallel: "content/lessons/parallel",
  networking: "content/lessons/networking",
};

export function courseBase(courseSlug) {
  return contentBase[courseSlug];
}

// Load a real module export for use as a stub value (content modules only).
export function loadRealModule(relativePath, exportNames) {
  const raw = stripTypeScriptTypes(readFileSync(new URL(`../../${relativePath}.ts`, import.meta.url), "utf8"), { mode: "transform" });
  const code = raw
    .replace(/import type \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import \{[^}]+\} from "[^"]+";/g, "")
    .replace(/import (\w+) from "[^"]+";/g, "")
    .replace(/export /g, "") + exportNames.map((name) => `\nexports.${name}=${name};`).join("");
  const exports = {};
  vm.runInNewContext(code, { URL, exports });
  return exports;
}

// Build the minimal vm-global stubs every registry-loading test needs for the
// Phase 15 standard lessons. Real content where cheap; inert stubs elsewhere.
export function standardLessonStubs({ realActivities = true } = {}) {
  const stubs = {};
  for (const [slug, courseSlug] of standardLessons) {
    const base = courseBase(courseSlug);
    const camel = slug.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    const lessonContent = {
      academicExplanation: [], codeExamples: [], keyTerms: [], commonMistakes: [],
    };
    if (realActivities) {
      const loaded = loadRealModule(`${base}/${slug}-activities`, [`${camel}Activities`]);
      stubs[`${camel}Activities`] = loaded[`${camel}Activities`];
    } else {
      stubs[`${camel}Activities`] = [];
    }
    stubs[`${camel}LessonContent`] = lessonContent;
    stubs[`load${camel.charAt(0).toUpperCase()}${camel.slice(1)}Lesson`] = async () => ({});
    stubs[`${camel}MasteryConfig`] = { concepts: [], activityConceptToMastery: () => null, robinCheckSignalToEvidence: () => ({ evidenceType: "robin_check_strong", concepts: [] }) };
    stubs[`${camel}Relevance`] = { activityConcepts: () => [], checkConcepts: () => [], chatConcepts: () => [] };
    stubs[`${camel}CheckInstructions`] = `${slug}-rubric`;
    stubs[`${camel}FeedbackInstructions`] = `${slug}-feedback-rubric`;
  }
  return stubs;
}

// Build a require()-map fragment for tests whose loaders resolve imports by
// path suffix (loops-lesson, conditionals-lesson). Keys are chosen so the
// import paths end with them; values are module objects of stubs.
export function requireMapForStandardLessons() {
  const map = {};
  for (const [slug, courseSlug] of standardLessons) {
    const camel = slug.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    const loaderName = `load${camel.charAt(0).toUpperCase()}${camel.slice(1)}Lesson`;
    map[`${slug}-activities`] = { [`${camel}Activities`]: [] };
    map[`${courseSlug}/${slug}`] = { [`${camel}LessonContent`]: { academicExplanation: [], codeExamples: [], keyTerms: [], commonMistakes: [] } };
    map[`${slug}-config`] = { [`${camel}MasteryConfig`]: { concepts: [] }, [`${camel}Relevance`]: {} };
    map[`${slug}-instructions`] = { [`${camel}CheckInstructions`]: `${slug} rubric`, [`${camel}FeedbackInstructions`]: `${slug} feedback` };
    map[`lib/lessons/${slug}`] = { [loaderName]: async () => ({}) };
  }
  return map;
}

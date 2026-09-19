export type CourseStatus = "In progress" | "Up next" | "Not started";

export type Course = {
  slug: string;
  code: string;
  title: string;
  description: string;
  progress: number;
  lessons: number;
  status: CourseStatus;
};

// Honest neutral presentation fallbacks (Phase 15): the static progress
// values here are NOT learner progress. Real course progress derives from
// persisted lesson progress server-side (see /api/courses); these entries
// only provide codes, titles, and a neutral 0% / "Not started" baseline.
export const courses: Course[] = [
  { slug: "programming", code: "CS-101", title: "Foundations of Programming Language", description: "Build the mental model behind code, from values and variables to functions.", progress: 0, lessons: 16, status: "Not started" },
  { slug: "design-thinking", code: "DT-101", title: "Design Thinking", description: "Turn fuzzy human problems into ideas you can test and improve.", progress: 0, lessons: 8, status: "Not started" },
  { slug: "discrete-math", code: "MA-105", title: "Discrete Mathematics", description: "Logic, sets, relations, and the mathematical language of computing.", progress: 0, lessons: 12, status: "Not started" },
  { slug: "hci", code: "CS-112", title: "Human-Computer Interaction", description: "Understand how people experience, use, and sometimes fight with software.", progress: 0, lessons: 9, status: "Not started" },
  { slug: "algorithms", code: "CS-120", title: "Algorithms Foundations", description: "Learn to describe, compare, and reason about problem-solving procedures.", progress: 0, lessons: 11, status: "Not started" },
  { slug: "parallel", code: "CS-130", title: "Parallel and Distributed Computing", description: "Explore how many computers and processes coordinate useful work.", progress: 0, lessons: 10, status: "Not started" },
  { slug: "networking", code: "CS-140", title: "Networking and Communication", description: "Follow data as it moves between devices, protocols, and people.", progress: 0, lessons: 10, status: "Not started" },
];

// These values are presentation fallbacks. Persisted lesson progress is authoritative
// for implemented lesson routes; broader course progress derives from the
// lesson_progress table server-side.
export const coursePresentationBySlug: Record<string, Pick<Course, "code" | "progress" | "status">> =
  Object.fromEntries(
    courses.map(({ slug, code, progress, status }) => [slug, { code, progress, status }]),
  );

// Courses with an implemented overview page, keyed by course slug. Courses
// without an entry have no dedicated course page yet and link back to /courses.
export const courseOverviewRouteBySlug: Record<string, string> = {
  programming: "/courses/programming",
  "discrete-math": "/courses/discrete-math",
  "design-thinking": "/courses/design-thinking",
  hci: "/courses/hci",
  algorithms: "/courses/algorithms",
  parallel: "/courses/parallel",
  networking: "/courses/networking",
};

// Presentation states on course pages. Progression is a recommendation, not
// an access restriction:
//   completed → DONE · current → CONTINUE · next → recommended next step ·
//   available → implemented and open · coming-soon → no route yet, not
//   clickable · locked → legacy default on the generic course client only.
export type LessonPresentationState = "completed" | "current" | "next" | "available" | "coming-soon" | "locked";

// Implemented lesson routes, in the intended beginner learning order.
// Phase 20.1 onboarding lessons complete Module 01: What is Programming?,
// Meet Python, Output with print(), Syntax & Indentation, Comments, and
// Understanding Errors.
export const implementedProgrammingLessonSlugs = [
  "what-is-programming",
  "hello-python",
  "print-output",
  "syntax-indentation",
  "comments",
  "understanding-errors",
  "variables",
  "data-types",
  "operators",
  "conditionals",
  "loops",
  "functions",
] as const;

// Implemented Discrete Mathematics lesson routes (Phase 14B golden lesson
// plus the Phase 15 standard lessons).
export const implementedDiscreteMathLessonSlugs = [
  "propositions",
  "implication",
  "sets-intro",
] as const;

// Implemented Design Thinking lesson routes (Phase 15 standard lessons).
export const implementedDesignThinkingLessonSlugs = [
  "what-is-design-thinking",
  "empathy-and-define",
  "ideate-prototype-test",
] as const;

// Implemented Human-Computer Interaction lesson routes (Phase 15 standard lessons).
export const implementedHciLessonSlugs = [
  "hci-intro",
  "affordances-and-feedback",
  "interface-evaluation",
] as const;

// Implemented Algorithms Foundations lesson routes (Phase 15 standard lessons).
export const implementedAlgorithmsLessonSlugs = [
  "what-is-an-algorithm",
  "pseudocode-and-tracing",
  "efficiency-intuition",
] as const;

// Implemented Parallel and Distributed Computing lesson routes (Phase 15 standard lessons).
export const implementedParallelLessonSlugs = [
  "sequential-vs-parallel",
  "distributed-basics",
] as const;

// Implemented Networking and Communication lesson routes (Phase 15 standard lessons).
export const implementedNetworkingLessonSlugs = [
  "what-is-a-network",
  "packets-and-protocols",
  "client-server-and-layers",
] as const;

// All implemented lessons per course. Trusted source for course pages,
// navigation, and fallbacks. Lesson slugs are globally unique across courses
// (flat lesson registry constraint).
export const implementedLessonSlugsByCourse: Record<string, readonly string[]> = {
  programming: implementedProgrammingLessonSlugs,
  "discrete-math": implementedDiscreteMathLessonSlugs,
  "design-thinking": implementedDesignThinkingLessonSlugs,
  hci: implementedHciLessonSlugs,
  algorithms: implementedAlgorithmsLessonSlugs,
  parallel: implementedParallelLessonSlugs,
  networking: implementedNetworkingLessonSlugs,
};

// Default "start here" context, derived from the implemented-lesson map —
// never a hardcoded course assumption. Programming is simply the first course
// with implemented lessons; as soon as persisted progress exists, it wins.
const firstImplemented = Object.entries(implementedLessonSlugsByCourse)
  .find(([, slugs]) => slugs.length > 0) ?? null;

export const defaultCurrentLesson: { courseSlug: string; lessonSlug: string } = {
  courseSlug: firstImplemented?.[0] ?? "",
  lessonSlug: firstImplemented?.[1][0] ?? "",
};

// Static curriculum fallback used when the local progress API is unavailable.
// Implemented lessons fall back to "available" (completion is unknown without
// the API). The programming-fundamentals placeholders (programming-languages,
// syntax-vs-semantics) have no lesson content or route yet, so they render as
// coming soon — never clickable, never a fake "completed".
export const programmingLessonStateBySlug: Record<string, LessonPresentationState> = {
  "what-is-programming": "available",
  "hello-python": "available",
  "print-output": "available",
  "syntax-indentation": "available",
  "comments": "available",
  "understanding-errors": "available",
  "programming-languages": "coming-soon",
  "syntax-vs-semantics": "coming-soon",
  "compiler-vs-interpreter": "completed",
  "source-code-to-program-execution": "locked",
  variables: "completed",
  "data-types": "completed",
  operators: "current",
  conditionals: "completed",
  loops: "completed",
  functions: "completed",
};

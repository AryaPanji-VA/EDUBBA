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

export const courses: Course[] = [
  { slug: "programming", code: "CS-101", title: "Foundations of Programming Language", description: "Build the mental model behind code, from values and variables to functions.", progress: 36, lessons: 11, status: "In progress" },
  { slug: "design-thinking", code: "DT-101", title: "Design Thinking", description: "Turn fuzzy human problems into ideas you can test and improve.", progress: 22, lessons: 8, status: "In progress" },
  { slug: "discrete-math", code: "MA-105", title: "Discrete Mathematics", description: "Logic, sets, relations, and the mathematical language of computing.", progress: 16, lessons: 12, status: "In progress" },
  { slug: "hci", code: "CS-112", title: "Human-Computer Interaction", description: "Understand how people experience, use, and sometimes fight with software.", progress: 0, lessons: 9, status: "Up next" },
  { slug: "algorithms", code: "CS-120", title: "Algorithms Foundations", description: "Learn to describe, compare, and reason about problem-solving procedures.", progress: 0, lessons: 11, status: "Not started" },
  { slug: "parallel", code: "CS-130", title: "Parallel and Distributed Computing", description: "Explore how many computers and processes coordinate useful work.", progress: 0, lessons: 10, status: "Not started" },
  { slug: "networking", code: "CS-140", title: "Networking and Communication", description: "Follow data as it moves between devices, protocols, and people.", progress: 0, lessons: 10, status: "Not started" },
];

// These values are presentation fallbacks. Persisted lesson progress is authoritative
// for implemented lesson routes; broader course progress remains a later phase.
export const coursePresentationBySlug: Record<string, Pick<Course, "code" | "progress" | "status">> =
  Object.fromEntries(
    courses.map(({ slug, code, progress, status }) => [slug, { code, progress, status }]),
  );

// Courses with an implemented overview page, keyed by course slug. Courses
// without an entry have no dedicated course page yet and link back to /courses.
export const courseOverviewRouteBySlug: Record<string, string> = {
  programming: "/courses/programming",
  "discrete-math": "/courses/discrete-math",
};

export type LessonPresentationState = "completed" | "current" | "locked";

// Implemented lesson routes, in the intended beginner learning order.
export const implementedProgrammingLessonSlugs = [
  "variables",
  "data-types",
  "operators",
  "conditionals",
  "loops",
  "functions",
] as const;

// Implemented Discrete Mathematics lesson routes (Phase 14B golden lesson).
export const implementedDiscreteMathLessonSlugs = [
  "propositions",
] as const;

// Static curriculum fallback used when the local progress API is unavailable.
export const programmingLessonStateBySlug: Record<string, LessonPresentationState> = {
  "what-is-programming": "completed",
  "programming-languages": "completed",
  "syntax-vs-semantics": "completed",
  "compiler-vs-interpreter": "completed",
  "source-code-to-program-execution": "locked",
  variables: "completed",
  "data-types": "completed",
  operators: "current",
  conditionals: "completed",
  loops: "completed",
  functions: "completed",
};

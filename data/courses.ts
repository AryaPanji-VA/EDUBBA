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

// Progress and status still belong to the Phase 1 presentation layer.
// The database stores shared course metadata, not Arya's personal progress.
export const coursePresentationBySlug: Record<string, Pick<Course, "code" | "progress" | "status">> =
  Object.fromEntries(
    courses.map(({ slug, code, progress, status }) => [slug, { code, progress, status }]),
  );

export type LessonPresentationState = "completed" | "current" | "locked";

// Personal learning state remains local until ROBIN has users and progress storage.
export const programmingLessonStateBySlug: Record<string, LessonPresentationState> = {
  "what-is-programming": "completed",
  "programming-languages": "completed",
  "syntax-vs-semantics": "completed",
  "compiler-vs-interpreter": "completed",
  "source-code-to-program-execution": "locked",
  variables: "current",
  "data-types": "locked",
  operators: "locked",
  conditionals: "locked",
  loops: "locked",
  functions: "locked",
};

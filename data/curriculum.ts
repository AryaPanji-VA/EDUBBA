// Phase 13.1: static semester mirror of the official curriculum.
// The database (semesters table + courses.semester_id) is authoritative;
// this module is the offline presentation fallback, mirroring
// coursePresentationBySlug conventions. The official Semester 1-8 curriculum
// is the authoritative WHAT and WHEN — EDUBBA only represents it. No new
// courses are invented here: only the seven already-seeded Semester 1 courses
// are placed, and Semesters 2-8 stay empty until the official course lists
// are supplied.

export type Semester = {
  number: number;
  title: string;
  courseSlugs: string[];
};

// The current semester context for presentation. Stays 1 until the learner's
// official schedule moves on.
export const currentSemesterNumber = 1;

export const semesters: Semester[] = [
  { number: 1, title: "Semester 1", courseSlugs: ["programming", "design-thinking", "discrete-math", "hci", "algorithms", "parallel", "networking"] },
  { number: 2, title: "Semester 2", courseSlugs: [] },
  { number: 3, title: "Semester 3", courseSlugs: [] },
  { number: 4, title: "Semester 4", courseSlugs: [] },
  { number: 5, title: "Semester 5", courseSlugs: [] },
  { number: 6, title: "Semester 6", courseSlugs: [] },
  { number: 7, title: "Semester 7", courseSlugs: [] },
  { number: 8, title: "Semester 8", courseSlugs: [] },
];

export function getSemester(number: number): Semester | null {
  return semesters.find((semester) => semester.number === number) ?? null;
}

export function getCoursesForSemester(number: number): string[] {
  return getSemester(number)?.courseSlugs ?? [];
}

// Course -> semester placement for quick presentation lookups.
export const semesterNumberByCourseSlug: Record<string, number> = Object.fromEntries(
  semesters.flatMap((semester) => semester.courseSlugs.map((slug) => [slug, semester.number])),
);

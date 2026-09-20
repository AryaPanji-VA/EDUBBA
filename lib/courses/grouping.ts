import type { Course } from "@/data/courses";
import { coursePresentationBySlug } from "@/data/courses";

// Pure course-overview grouping, shared by the /api/courses route and its
// tests. No server/client coupling: everything here derives from the rows it
// is handed.

export type DatabaseSemester = {
  id: string;
  number: number;
  title: string;
};

export type DatabaseCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  total_lessons: number;
  semester_id: string | null;
};

export type SemesterCourseGroup = {
  number: number;
  title: string;
  courses: Course[];
};

export function toCourse(course: DatabaseCourse, lessonCount: number, completedCount: number): Course {
  const presentation = coursePresentationBySlug[course.slug];
  // Real lesson count from seeded structure; the DB total_lessons column is
  // curriculum metadata, not a claim about what exists today.
  const lessons = Math.max(0, lessonCount);
  // Real progress from persisted lesson completion; honest 0 when unknown.
  const progress = lessons > 0 ? Math.min(100, Math.round((completedCount / lessons) * 100)) : 0;

  return {
    slug: course.slug,
    title: course.title,
    description: course.description,
    lessons,
    code: presentation?.code ?? "CS",
    progress,
    status: completedCount > 0 ? "In progress" : "Not started",
  };
}

// Pure grouping: semesters come only from the database, courses are placed by
// their semester_id, and rows without a resolvable semester are reported as
// unassigned instead of being silently placed.
export function groupCoursesBySemester(
  semesterRows: DatabaseSemester[],
  courseRows: DatabaseCourse[],
  lessonCountsByCourse: Record<string, number> = {},
  completedCountsByCourse: Record<string, number> = {},
): { semesters: SemesterCourseGroup[]; unassignedCourses: Course[] } {
  const groupsById = new Map<string, SemesterCourseGroup>();
  const semesters = [...semesterRows]
    .sort((a, b) => a.number - b.number)
    .map((row) => {
      const group: SemesterCourseGroup = { number: row.number, title: row.title, courses: [] };
      groupsById.set(row.id, group);
      return group;
    });
  const unassignedCourses: Course[] = [];
  for (const row of courseRows) {
    const course = toCourse(row, lessonCountsByCourse[row.slug] ?? 0, completedCountsByCourse[row.slug] ?? 0);
    const group = row.semester_id ? groupsById.get(row.semester_id) : undefined;
    if (group) group.courses.push(course);
    else unassignedCourses.push(course);
  }
  return { semesters, unassignedCourses };
}

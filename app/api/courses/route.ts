import type { Course } from "@/data/courses";
import { coursePresentationBySlug } from "@/data/courses";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadCompletedLessonCountsByCourse } from "@/lib/progress/server";

export const dynamic = "force-dynamic";

type DatabaseSemester = {
  id: string;
  number: number;
  title: string;
};

type DatabaseCourse = {
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

function toCourse(course: DatabaseCourse, lessonCount: number, completedCount: number): Course {
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

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: semesterData, error: semesterError } = await supabase
      .from("semesters")
      .select("id, number, title")
      .order("number", { ascending: true });

    if (semesterError) {
      return Response.json(
        { error: "Unable to load semesters from Supabase. Check the semesters table and its SELECT policy." },
        { status: 500 },
      );
    }

    if (!semesterData || semesterData.length === 0) {
      return Response.json(
        { error: "The semesters table is empty. Run database/phase13-semesters.sql in Supabase." },
        { status: 500 },
      );
    }

    const { data, error } = await supabase
      .from("courses")
      .select("id, slug, title, description, total_lessons, semester_id")
      .order("created_at", { ascending: true });

    if (error) {
      return Response.json(
        { error: "Unable to load courses from Supabase. Check the table and its SELECT policy." },
        { status: 500 },
      );
    }

    if (!data || data.length === 0) {
      return Response.json(
        { courses: [], count: 0, error: "The courses table is empty. Run database/seed.sql in Supabase." },
        { status: 404 },
      );
    }

    const courseRows = data as DatabaseCourse[];

    // Real lesson counts per course from the seeded structure. Best-effort:
    // unreadable tables fall back to 0, which is honest.
    const lessonCounts: Record<string, number> = {};
    try {
      const { data: moduleRows } = await supabase.from("modules").select("id, course_id");
      const { data: lessonRows } = await supabase.from("lessons").select("module_id");
      if (moduleRows && lessonRows) {
        const lessonsPerModule = new Map<string, number>();
        for (const row of (lessonRows as { module_id: string }[])) {
          lessonsPerModule.set(row.module_id, (lessonsPerModule.get(row.module_id) ?? 0) + 1);
        }
        const slugByCourseId = new Map(courseRows.map((row) => [row.id, row.slug]));
        for (const row of (moduleRows as { id: string; course_id: string }[])) {
          const slug = slugByCourseId.get(row.course_id);
          if (slug) lessonCounts[slug] = (lessonCounts[slug] ?? 0) + (lessonsPerModule.get(row.id) ?? 0);
        }
      }
    } catch { /* Honest fallback: zero lessons. */ }

    // Real completed-lesson counts from persisted progress (local-dev guarded).
    const completedCounts = await loadCompletedLessonCountsByCourse(request);

    const { semesters, unassignedCourses } = groupCoursesBySemester(
      semesterData as DatabaseSemester[],
      courseRows,
      lessonCounts,
      completedCounts,
    );

    // Flat legacy list preserved in the original database order.
    const courses: Course[] = courseRows.map((row) =>
      toCourse(row, lessonCounts[row.slug] ?? 0, completedCounts[row.slug] ?? 0),
    );

    return Response.json({ courses, count: courses.length, semesters, unassignedCourses });
  } catch {
    return Response.json(
      { error: "Supabase is not configured. Add the server environment variables, then restart Next.js." },
      { status: 503 },
    );
  }
}

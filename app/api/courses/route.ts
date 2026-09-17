import type { Course } from "@/data/courses";
import { coursePresentationBySlug } from "@/data/courses";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type DatabaseSemester = {
  id: string;
  number: number;
  title: string;
};

type DatabaseCourse = {
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

function toCourse(course: DatabaseCourse): Course {
  const presentation = coursePresentationBySlug[course.slug];

  return {
    slug: course.slug,
    title: course.title,
    description: course.description,
    lessons: course.total_lessons,
    code: presentation?.code ?? "CS",
    progress: presentation?.progress ?? 0,
    status: presentation?.status ?? "Not started",
  };
}

// Pure grouping: semesters come only from the database, courses are placed by
// their semester_id, and rows without a resolvable semester are reported as
// unassigned instead of being silently placed.
export function groupCoursesBySemester(
  semesterRows: DatabaseSemester[],
  courseRows: DatabaseCourse[],
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
    const course = toCourse(row);
    const group = row.semester_id ? groupsById.get(row.semester_id) : undefined;
    if (group) group.courses.push(course);
    else unassignedCourses.push(course);
  }
  return { semesters, unassignedCourses };
}

export async function GET() {
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
      .select("slug, title, description, total_lessons, semester_id")
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
    const { semesters, unassignedCourses } = groupCoursesBySemester(
      semesterData as DatabaseSemester[],
      courseRows,
    );

    // Flat legacy list preserved in the original database order.
    const courses: Course[] = courseRows.map(toCourse);

    return Response.json({ courses, count: courses.length, semesters, unassignedCourses });
  } catch {
    return Response.json(
      { error: "Supabase is not configured. Add the server environment variables, then restart Next.js." },
      { status: 503 },
    );
  }
}

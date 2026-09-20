import type { Course } from "@/data/courses";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadCompletedLessonCountsByCourse } from "@/lib/progress/server";
import { groupCoursesBySemester, toCourse, type DatabaseCourse, type DatabaseSemester } from "@/lib/courses/grouping";

export const dynamic = "force-dynamic";

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

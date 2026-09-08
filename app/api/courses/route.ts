import type { Course } from "@/data/courses";
import { coursePresentationBySlug } from "@/data/courses";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type DatabaseCourse = {
  slug: string;
  title: string;
  description: string;
  total_lessons: number;
};

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("courses")
      .select("slug, title, description, total_lessons")
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

    const courses: Course[] = (data as DatabaseCourse[]).map((course) => {
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
    });

    return Response.json({ courses, count: courses.length });
  } catch {
    return Response.json(
      { error: "Supabase is not configured. Add the server environment variables, then restart Next.js." },
      { status: 503 },
    );
  }
}

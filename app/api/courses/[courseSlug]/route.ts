import { loadCourseOverview } from "@/lib/courses/overview";

export const dynamic = "force-dynamic";

// Generic course overview API (Phase 15). Static course routes
// (programming, discrete-math) take precedence; this route serves the rest.
export async function GET(_request: Request, { params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  let result;
  try {
    result = await loadCourseOverview(courseSlug);
  } catch {
    return Response.json(
      { error: "Supabase is not configured. Add the server environment variables, then restart Next.js." },
      { status: 503 },
    );
  }
  if (!result.ok) {
    switch (result.error) {
      case "course-read":
        return Response.json({ error: `Unable to read the ${courseSlug} course from Supabase.` }, { status: 500 });
      case "course-not-found":
        return Response.json({ error: "Course not found. Run database/seed.sql first." }, { status: 404 });
      case "module-read":
        return Response.json({ error: "Unable to read modules. Run database/phase4-relations.sql and check its SELECT policy." }, { status: 500 });
      case "no-modules":
        return Response.json({ error: "No course modules found. Run database/phase15-semester1-structure.sql in Supabase." }, { status: 404 });
      case "lesson-read":
        return Response.json({ error: "Unable to read lessons. Check the lessons table and its SELECT policy." }, { status: 500 });
      case "no-lessons":
        return Response.json({ error: "No course lessons found. Run database/phase15-semester1-structure.sql in Supabase." }, { status: 404 });
      case "module-without-lessons":
        return Response.json({ error: `The ${result.moduleTitle} module has no lessons. Run database/phase15-semester1-structure.sql in Supabase.` }, { status: 404 });
    }
  }
  return Response.json({ course: result.course });
}

import { loadCourseOverview } from "@/lib/courses/overview";

export const dynamic = "force-dynamic";

// Discrete Mathematics course overview. Until the Phase 14B structure SQL is
// applied, this returns a clear setup error instead of faking course content.
export async function GET() {
  let result;
  try {
    result = await loadCourseOverview("discrete-math");
  } catch {
    return Response.json(
      { error: "Supabase is not configured. Add the server environment variables, then restart Next.js." },
      { status: 503 },
    );
  }
  if (!result.ok) {
    switch (result.error) {
      case "course-read":
        return Response.json({ error: "Unable to read the Discrete Mathematics course from Supabase." }, { status: 500 });
      case "course-not-found":
        return Response.json({ error: "Discrete Mathematics course not found. Run database/seed.sql first." }, { status: 404 });
      case "module-read":
        return Response.json({ error: "Unable to read modules. Run database/phase4-relations.sql and check its SELECT policy." }, { status: 500 });
      case "no-modules":
        return Response.json({ error: "No Discrete Mathematics modules found. Run database/phase14b-propositions-structure.sql in Supabase." }, { status: 404 });
      case "lesson-read":
        return Response.json({ error: "Unable to read lessons. Check the lessons table and its SELECT policy." }, { status: 500 });
      case "no-lessons":
        return Response.json({ error: "No Discrete Mathematics lessons found. Run database/phase14b-propositions-structure.sql in Supabase." }, { status: 404 });
      case "module-without-lessons":
        return Response.json({ error: `The ${result.moduleTitle} module has no lessons. Run database/phase14b-propositions-structure.sql in Supabase.` }, { status: 404 });
    }
  }
  return Response.json({ course: result.course });
}

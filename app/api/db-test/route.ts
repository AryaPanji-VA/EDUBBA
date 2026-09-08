import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { count, error } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true });

    if (error) {
      return Response.json(
        { status: "error", error: "Database query failed. Check the courses table and its SELECT policy." },
        { status: 500 },
      );
    }

    return Response.json({
      status: "online",
      database: "supabase-postgres",
      coursesFound: count ?? 0,
    });
  } catch {
    return Response.json(
      { status: "error", error: "Supabase is not configured. Add the server environment variables and restart Next.js." },
      { status: 503 },
    );
  }
}

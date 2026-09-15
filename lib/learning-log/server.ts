import "server-only";
import { createMemorySupabaseClient } from "@/lib/supabase/memory-server";
import { validateLearningLog, type LearningLog, type LearningLogInput, type LearningLogSummary } from "./types";

const columns = "id,user_id,course_slug,lesson_slug,summary,concepts_learned,weak_concepts,misconceptions,next_step,mastery_snapshot,created_at,updated_at";

export class LogError extends Error {
  constructor(message: string, public status = 503) { super(message); }
}

export function requireLocalLog(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (process.env.NODE_ENV !== "development" ||
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      (host && host !== url.host) || (origin && origin !== url.origin) ||
      ["cross-site", "same-site"].includes(request.headers.get("sec-fetch-site") ?? "")) {
    throw new LogError("Learning Log hanya tersedia di development lokal. Belum ada authentication.", 403);
  }
}

export function logResponse(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function logFailure(error: unknown) {
  return logResponse(
    { error: error instanceof LogError ? error.message : "Learning Log belum tersedia. Coba lagi sebentar." },
    error instanceof LogError ? error.status : 503,
  );
}

export async function createLog(input: LearningLogInput): Promise<LearningLog> {
  const client = createMemorySupabaseClient();
  const { data, error } = await client.from("learning_logs").insert({
    course_slug: input.courseSlug,
    lesson_slug: input.lessonSlug,
    summary: input.summary,
    concepts_learned: input.conceptsLearned ?? null,
    weak_concepts: input.weakConcepts ?? null,
    misconceptions: input.misconceptions ?? null,
    next_step: input.nextStep ?? null,
    mastery_snapshot: input.masterySnapshot ?? null,
  }).select(columns).single();
  if (error) throw new Error("Learning Log write unavailable.");
  return data as LearningLog;
}

export async function listRecentLogs(limit = 5): Promise<LearningLogSummary[]> {
  const client = createMemorySupabaseClient();
  const { data, error } = await client.from("learning_logs")
    .select("id,lesson_slug,summary,concepts_learned,weak_concepts,next_step,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error("Learning Log read unavailable.");
  return (data ?? []).map((row) => ({
    id: row.id,
    lesson_slug: row.lesson_slug,
    summary: row.summary,
    concepts_learned: row.concepts_learned ?? [],
    weak_concepts: row.weak_concepts ?? [],
    next_step: row.next_step,
    created_at: row.created_at,
  }));
}

export async function updateLogSummary(id: string, summary: string): Promise<void> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new LogError("Log ID tidak valid.", 400);
  }
  if (typeof summary !== "string" || !summary.trim() || summary.length > 2000) {
    throw new LogError("Ringkasan tidak valid.", 400);
  }
  const client = createMemorySupabaseClient();
  const { error } = await client.from("learning_logs")
    .update({ summary: summary.trim() })
    .eq("id", id);
  if (error) throw new Error("Learning Log update unavailable.");
}

export async function deleteLog(id: string): Promise<void> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new LogError("Log ID tidak valid.", 400);
  }
  const client = createMemorySupabaseClient();
  const { error } = await client.from("learning_logs").delete().eq("id", id);
  if (error) throw new Error("Learning Log delete unavailable.");
}

// Compact context for Robin chat — best-effort, never blocks chat.
export async function loadLogContext(request: Request): Promise<string> {
  try {
    requireLocalLog(request);
    const logs = await listRecentLogs(3);
    if (!logs.length) return "";
    return "RECENT LEARNING LOGS:\n" + logs.map((log) =>
      `${log.lesson_slug} (${new Date(log.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}) — ${log.summary.substring(0, 120)}`
    ).join("\n");
  } catch {
    return "";
  }
}

export { validateLearningLog };

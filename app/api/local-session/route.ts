import { cookies } from "next/headers";
import { isLocalUserId } from "@/lib/local-user/local-users";
import { LOCAL_USER_COOKIE } from "@/lib/local-user/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
    return Response.json({ error: "Kirim request sebagai JSON." }, { status: 415 });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "JSON tidak valid." }, { status: 400 }); }
  const localUserId = body && typeof body === "object" && !Array.isArray(body)
    ? (body as Record<string, unknown>).localUserId
    : null;
  if (!isLocalUserId(localUserId)) return Response.json({ error: "Local user tidak valid." }, { status: 400 });
  (await cookies()).set(LOCAL_USER_COOKIE, localUserId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE() {
  (await cookies()).delete(LOCAL_USER_COOKIE);
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

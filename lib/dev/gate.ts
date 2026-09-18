import "server-only";

// Phase 19.2: diagnostic/dev tools stay available in development and can be
// explicitly enabled in production deployments with ENABLE_DEV_TOOLS=true.
// Default in production is disabled.
export function devToolsEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ENABLE_DEV_TOOLS?.trim() === "true";
}

export function devToolsDisabledResponse(): Response {
  return Response.json(
    { error: "Dev tools tidak tersedia di production." },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );
}

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    status: "online",
    message: "akhirnya nyambung juga.",
    from: "ROBIN backend",
    endpoint: "/api/hello",
    servedAt: new Date().toISOString(),
  });
}

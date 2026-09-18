import { devToolsDisabledResponse, devToolsEnabled } from "@/lib/dev/gate";

export const dynamic = "force-dynamic";

export function GET() {
  if (!devToolsEnabled()) return devToolsDisabledResponse();
  return Response.json({
    status: "online",
    message: "akhirnya nyambung juga.",
    from: "ROBIN backend",
    endpoint: "/api/hello",
    servedAt: new Date().toISOString(),
  });
}

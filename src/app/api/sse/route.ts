import { NextRequest } from "next/server";
import { AZURACAST_BASE_URL as BASE_URL, STATION_SHORTCODE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const upstreamUrl = `${BASE_URL}/api/live/nowplaying/sse?cf=${STATION_SHORTCODE}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      signal: AbortSignal.timeout(60_000),
      headers: { Accept: "text/event-stream" },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("SSE upstream unavailable", { status: 503 });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return new Response("SSE upstream unreachable", { status: 503 });
  }
}

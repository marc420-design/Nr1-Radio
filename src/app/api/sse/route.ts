import { NextRequest } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL ?? "http://192.168.0.224";
const STATION_SHORTCODE = process.env.NEXT_PUBLIC_STATION_SHORTCODE ?? "nr1_dnb_radio";

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

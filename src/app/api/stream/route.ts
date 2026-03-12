export const runtime = "edge";
export const dynamic = "force-dynamic";

import { AZURACAST_BASE_URL as BASE_URL, STATION_SHORTCODE as SHORTCODE } from "@/lib/constants";

export async function GET(req: Request) {
  const url = `${BASE_URL}/listen/${SHORTCODE}/radio.mp3`;

  try {
    const upstream = await fetch(url, {
      signal: req.signal,
      headers: { "Icy-MetaData": "0" },
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("Stream unavailable", { status: 503 });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") ?? "audio/mpeg",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return new Response("Stream unreachable", { status: 503 });
  }
}

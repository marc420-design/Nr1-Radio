export const runtime = "edge";
export const dynamic = "force-dynamic";

const BASE_URL =
  process.env.NEXT_PUBLIC_AZURACAST_BASE_URL ??
  "http://radio.listen-nr1dnb.com";
const SHORTCODE =
  process.env.NEXT_PUBLIC_STATION_SHORTCODE ?? "nr1_dnb_radio";

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

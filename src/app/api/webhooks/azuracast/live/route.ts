import { NextResponse } from "next/server";
import { AZURACAST_BASE_URL, STATION_ID } from "@/lib/constants";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { sendToAllSubscribers, isPushConfigured } from "@/lib/push";

export const dynamic = "force-dynamic";

/**
 * AzuraCast live_connect / live_disconnect webhook.
 *
 * Nothing in the request is trusted. AzuraCast's web hook connector has no
 * confirmed support for custom request headers, and the usual workaround - a
 * shared secret in the query string - puts a credential in a URL that lands in
 * access logs and referrers. So this endpoint treats the request purely as a
 * "something changed, go and look" ping and re-reads the live state from
 * AzuraCast's own API with the station API key. The body is never parsed.
 *
 * That makes an unauthenticated call harmless: the worst an attacker achieves is
 * one authenticated fetch to AzuraCast, and a notification goes out only if
 * AzuraCast itself reports a live broadcast that has not been announced yet.
 *
 * Idempotency comes from live.broadcast_start, which is stable for the duration
 * of a broadcast and is the primary key of push_broadcasts. A duplicate delivery
 * conflicts on insert and sends nothing.
 *
 * An optional X-Webhook-Secret header is honoured when PUSH_WEBHOOK_SECRET is
 * set, as defence in depth for installs where headers can be configured. It is
 * not required, because correctness does not depend on it.
 */
export async function POST(request: Request) {
  const expectedSecret = process.env.PUSH_WEBHOOK_SECRET;
  if (expectedSecret) {
    const provided = request.headers.get("x-webhook-secret");
    if (provided !== expectedSecret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  if (!isPushConfigured()) {
    return NextResponse.json({ status: "push_not_configured" }, { status: 503 });
  }

  const apiKey = process.env.AZURACAST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "no api key" }, { status: 500 });
  }

  // Verify against AzuraCast rather than believing the caller.
  let np: {
    live?: { is_live?: boolean; streamer_name?: string; broadcast_start?: number | null };
    station?: { name?: string };
  };
  try {
    const res = await fetch(`${AZURACAST_BASE_URL}/api/nowplaying/${STATION_ID}`, {
      headers: { "X-API-Key": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "nowplaying unavailable" }, { status: 502 });
    }
    np = await res.json();
  } catch {
    return NextResponse.json({ error: "nowplaying unreachable" }, { status: 502 });
  }

  // live_disconnect pings land here too. There is nothing to announce, and the
  // push_broadcasts row stays so a reconnect under the same broadcast_start
  // cannot notify twice.
  if (!np.live?.is_live) {
    return NextResponse.json({ status: "not_live" });
  }

  // Without a broadcast_start there is no idempotency key, so staying silent is
  // better than risking a notification on every keepalive.
  if (!np.live.broadcast_start) {
    return NextResponse.json({ status: "no_broadcast_start" });
  }

  const broadcastStart = new Date(np.live.broadcast_start * 1000).toISOString();
  const streamerName = np.live.streamer_name?.trim() || "";
  const supabase = getSupabaseAdminClient();

  // Claim the broadcast first. The primary key makes this the dedupe: if another
  // delivery already inserted this broadcast_start, the insert fails and we stop
  // before sending anything.
  const { error: claimError } = await supabase
    .from("push_broadcasts")
    .insert({ broadcast_start: broadcastStart, streamer_name: streamerName || null });

  if (claimError) {
    return NextResponse.json({ status: "already_notified", broadcast_start: broadcastStart });
  }

  const result = await sendToAllSubscribers({
    title: streamerName ? `${streamerName} is live on NR1` : "NR1 is live",
    body: streamerName
      ? "Tap to listen to the live show."
      : "A live show just started. Tap to listen.",
    url: "/listen",
    // Collapses with any earlier unread live alert, so a listener who missed one
    // does not come back to a stack of them.
    tag: "nr1-live",
  });

  await supabase
    .from("push_broadcasts")
    .update({ recipients: result.sent })
    .eq("broadcast_start", broadcastStart);

  return NextResponse.json({ status: "notified", broadcast_start: broadcastStart, ...result });
}

// AzuraCast sends POST, but a GET is handy for confirming the route is reachable
// from the Norwich box without triggering a send.
export async function GET() {
  return NextResponse.json({
    ok: true,
    push_configured: isPushConfigured(),
    expects: "POST from AzuraCast live_connect / live_disconnect",
  });
}

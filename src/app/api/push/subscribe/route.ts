import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { isPushConfigured } from "@/lib/push";

export const dynamic = "force-dynamic";

// A push endpoint is a URL from the browser's push service. Accepting an
// arbitrary string would let anyone fill the table with junk, so require it to
// be https and cap the length well above what real services use.
const MAX_ENDPOINT_LENGTH = 1024;

function isValidEndpoint(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value.length > MAX_ENDPOINT_LENGTH) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Store a browser's push subscription.
 *
 * The browser posts here rather than writing to Supabase directly: the table has
 * RLS on with no policies, so only this route's service-role client can touch
 * it. That keeps the subscriber list unreadable with the public anon key.
 */
export async function POST(request: Request) {
  if (!isPushConfigured()) {
    return NextResponse.json({ error: "push not configured" }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { endpoint, keys } = (payload ?? {}) as {
    endpoint?: unknown;
    keys?: { p256dh?: unknown; auth?: unknown };
  };

  if (!isValidEndpoint(endpoint)) {
    return NextResponse.json({ error: "invalid endpoint" }, { status: 400 });
  }
  if (typeof keys?.p256dh !== "string" || typeof keys?.auth !== "string") {
    return NextResponse.json({ error: "missing keys" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      endpoint,
      p256dh_key: keys.p256dh,
      auth_key: keys.auth,
      // Kept only to tell Android from iOS when a delivery problem is reported.
      user_agent: request.headers.get("user-agent")?.slice(0, 256) ?? null,
      failure_count: 0,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    return NextResponse.json({ error: "could not store subscription" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

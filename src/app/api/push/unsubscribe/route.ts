import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Forget a browser's push subscription.
 *
 * Knowing an endpoint is what authorises deleting it: the endpoint is a secret
 * held by that browser and the push service, and the table cannot be read with
 * the anon key, so there is nothing to enumerate. Deleting an endpoint that was
 * never stored is a no-op and still answers ok, so the client can treat
 * unsubscribing as idempotent.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { endpoint } = (payload ?? {}) as { endpoint?: unknown };
  if (typeof endpoint !== "string" || endpoint.length === 0) {
    return NextResponse.json({ error: "invalid endpoint" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    return NextResponse.json({ error: "could not remove subscription" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

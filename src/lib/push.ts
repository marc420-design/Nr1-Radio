import webpush from "web-push";
import { getSupabaseAdminClient } from "@/lib/supabase";

export interface PushSubscriptionRow {
  id: number;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  failure_count: number;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag?: string;
}

let configured = false;

/**
 * Configure web-push from the environment. Returns false when the VAPID keys are
 * absent, which is the normal state in a checkout that has not been set up, so
 * callers can skip sending instead of throwing on every request.
 */
function configure(): boolean {
  if (configured) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:nr1family420@gmail.com";
  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export function isPushConfigured(): boolean {
  return configure();
}

/**
 * Send one payload to every stored subscription.
 *
 * Subscriptions die silently and often - the browser is uninstalled, the user
 * clears site data, the push service rotates the endpoint - so a 404 or 410 is
 * expected rather than exceptional and prunes the row. Anything else increments
 * a failure counter and leaves the row in place for the next broadcast.
 */
export async function sendToAllSubscribers(
  payload: PushPayload
): Promise<{ sent: number; pruned: number; failed: number }> {
  if (!configure()) return { sent: 0, pruned: 0, failed: 0 };

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh_key, auth_key, failure_count");

  if (error || !data) return { sent: 0, pruned: 0, failed: 0 };

  const subscriptions = data as unknown as PushSubscriptionRow[];
  const body = JSON.stringify(payload);
  const expired: number[] = [];
  const degraded: PushSubscriptionRow[] = [];
  let sent = 0;

  // Sent concurrently: a few hundred subscriptions against a 10s function budget
  // leaves no room to walk them one at a time.
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh_key, auth: sub.auth_key },
          },
          body
        );
        sent += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          expired.push(sub.id);
        } else {
          degraded.push(sub);
        }
      }
    })
  );

  if (expired.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", expired);
  }

  if (sent > 0) {
    const liveIds = subscriptions
      .filter((s) => !expired.includes(s.id) && !degraded.some((d) => d.id === s.id))
      .map((s) => s.id);
    if (liveIds.length > 0) {
      await supabase
        .from("push_subscriptions")
        .update({ last_notified_at: new Date().toISOString(), failure_count: 0 })
        .in("id", liveIds);
    }
  }

  await Promise.all(
    degraded.map((sub) =>
      supabase
        .from("push_subscriptions")
        .update({ failure_count: sub.failure_count + 1 })
        .eq("id", sub.id)
    )
  );

  return { sent, pruned: expired.length, failed: degraded.length };
}

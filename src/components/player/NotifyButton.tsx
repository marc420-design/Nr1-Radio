"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";

/**
 * Opt in to a notification when a live show starts.
 *
 * Renders nothing where push cannot work - no Push API, no VAPID key configured,
 * or permission already refused - rather than offering a control that would do
 * nothing when tapped.
 */
export function NotifyButton({ className = "" }: { className?: string }) {
  const { state, subscribe, unsubscribe } = usePushNotifications();

  if (state === "unsupported" || state === "unconfigured" || state === "denied") {
    return null;
  }

  const isSubscribed = state === "subscribed";
  const isWorking = state === "working";

  return (
    <button
      type="button"
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isWorking}
      aria-busy={isWorking}
      aria-label={
        isSubscribed
          ? "Turn off live show notifications"
          : "Notify me when a live show starts"
      }
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-colors disabled:opacity-50 ${
        isSubscribed
          ? "bg-nr1-cyan/20 text-nr1-cyan border-nr1-cyan/30 hover:bg-nr1-cyan/30"
          : "bg-nr1-muted/10 text-nr1-muted border-nr1-muted/20 hover:text-nr1-cyan hover:border-nr1-cyan/30"
      } ${className}`}
    >
      <span aria-hidden="true">{isSubscribed ? "🔔" : "🔕"}</span>
      {isWorking ? "…" : isSubscribed ? "Alerts on" : "Notify me"}
    </button>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

export type PushState =
  | "unsupported" // no service worker or Push API, e.g. iOS Safari outside a home-screen app
  | "unconfigured" // no VAPID public key in this deployment
  | "denied" // the browser-level permission was refused
  | "idle" // supported and available, not subscribed
  | "subscribed"
  | "working";

/**
 * Opt in to live-show push notifications.
 *
 * Subscriptions are stored server-side by /api/push/subscribe; this hook only
 * talks to the browser's push service and reports that endpoint onwards. The
 * authoritative state is the browser's own subscription, so the hook reads it
 * back on mount rather than trusting anything cached locally.
 */
export function usePushNotifications() {
  const [state, setState] = useState<PushState>("working");

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

  useEffect(() => {
    let cancelled = false;

    async function read() {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        if (!cancelled) setState("unsupported");
        return;
      }
      if (!vapidKey) {
        if (!cancelled) setState("unconfigured");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setState("denied");
        return;
      }

      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (!cancelled) setState(existing ? "subscribed" : "idle");
      } catch {
        if (!cancelled) setState("unsupported");
      }
    }

    read();
    return () => {
      cancelled = true;
    };
  }, [vapidKey]);

  const subscribe = useCallback(async () => {
    if (!vapidKey) return;
    setState("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "idle");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        // Required by Chrome: a push that shows no notification is not allowed.
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      if (!res.ok) {
        // Do not leave a browser subscription we failed to record: it would
        // receive nothing and the UI would claim otherwise.
        await sub.unsubscribe().catch(() => {});
        setState("idle");
        return;
      }

      setState("subscribed");
    } catch {
      setState("idle");
    }
  }, [vapidKey]);

  const unsubscribe = useCallback(async () => {
    setState("working");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe();
      }
      setState("idle");
    } catch {
      setState("subscribed");
    }
  }, []);

  return { state, subscribe, unsubscribe };
}

/**
 * VAPID keys are base64url; applicationServerKey needs raw bytes.
 */
function urlBase64ToUint8Array(base64UrlKey: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64UrlKey.length % 4)) % 4);
  const base64 = (base64UrlKey + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  // Explicitly ArrayBuffer-backed: applicationServerKey will not accept a view
  // that might sit on a SharedArrayBuffer.
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

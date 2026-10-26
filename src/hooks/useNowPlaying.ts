"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NowPlayingData, HistoryEntry } from "@/lib/azuracast";
import { cleanTitle } from "@/lib/azuracast";

interface NowPlayingState {
  track: string;
  artist: string;
  artwork: string;
  isLive: boolean;
  streamerName: string;
  listenerCount: number;
  uniqueListeners: number;
  history: HistoryEntry[];
  isOnline: boolean;
  hasLoaded: boolean;
  /** Polling has stopped answering, so the fields above are no longer current. */
  isStale: boolean;
}

// Three consecutive missed polls. Long enough to ride out a single blip, short
// enough that a Live badge cannot outlive the broadcast by more than a minute.
const POLL_INTERVAL_MS = 15_000;
const STALE_AFTER_MS = POLL_INTERVAL_MS * 3;

const DEFAULT_STATE: NowPlayingState = {
  track: "",
  artist: "",
  artwork: "",
  isLive: false,
  streamerName: "",
  listenerCount: 0,
  uniqueListeners: 0,
  history: [],
  isOnline: false,
  hasLoaded: false,
  isStale: false,
};

function parseNowPlaying(data: NowPlayingData): NowPlayingState {
  return {
    track: cleanTitle(data.now_playing?.song.title ?? ""),
    artist: data.now_playing?.song.artist ?? "",
    artwork: data.now_playing?.song.art ?? "",
    // Defensive: a truncated or reshaped upstream payload must not throw inside
    // setState, which would leave the previous state frozen and look fresh.
    isLive: data.live?.is_live ?? false,
    streamerName: data.live?.streamer_name ?? "",
    listenerCount: data.listeners?.current ?? 0,
    uniqueListeners: data.listeners?.unique ?? 0,
    history: data.song_history ?? [],
    isOnline: data.is_online ?? false,
    hasLoaded: true,
    isStale: false,
  };
}

export function useNowPlaying(isPlaying = false): NowPlayingState {
  const [state, setState] = useState<NowPlayingState>(DEFAULT_STATE);
  const lastSuccessRef = useRef(0);

  const poll = useCallback(async () => {
    // Keep lock-screen metadata fresh during background playback, but avoid
    // invoking the API for an idle tab nobody is looking at.
    if (document.visibilityState === "hidden" && !isPlaying) return;
    try {
      // Use the server-side proxy to avoid mixed-content blocking
      const res = await fetch("/api/nowplaying");
      if (!res.ok) throw new Error(`nowplaying ${res.status}`);
      const data = (await res.json()) as NowPlayingData | { error: string };
      // The proxy reports upstream trouble as an { error } body; that is a failed
      // poll, not a station that fell silent.
      if (!data || typeof data !== "object" || "error" in data) {
        throw new Error("nowplaying payload unusable");
      }
      lastSuccessRef.current = Date.now();
      setState(parseNowPlaying(data));
    } catch {
      // Keep the last known track, but stop claiming the live state once we have
      // gone long enough without confirmation. Previously this returned silently,
      // so an unreachable API froze a Live badge on screen indefinitely.
      setState((prev) => {
        if (!prev.hasLoaded) return prev;
        if (Date.now() - lastSuccessRef.current <= STALE_AFTER_MS) return prev;
        return prev.isStale ? prev : { ...prev, isStale: true };
      });
    }
  }, [isPlaying]);

  // Poll from mount. This replaced an SSE feed (/api/sse) that only ever carried
  // Centrifugo keepalives, never track data: the upstream subscription parameter
  // was malformed, and the interval was started from that feed's error handler,
  // so now-playing stayed frozen until the connection dropped at 300s.
  useEffect(() => {
    // Schedule the first poll rather than setting state from the effect body.
    const initialPoll = setTimeout(poll, 0);
    const id = setInterval(poll, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(initialPoll);
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [poll]);

  return state;
}

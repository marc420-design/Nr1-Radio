"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NowPlayingData, HistoryEntry } from "@/lib/azuracast";

interface NowPlayingState {
  track: string;
  artist: string;
  artwork: string;
  isLive: boolean;
  streamerName: string;
  listenerCount: number;
  history: HistoryEntry[];
  isOnline: boolean;
}

const DEFAULT_STATE: NowPlayingState = {
  track: "",
  artist: "",
  artwork: "",
  isLive: false,
  streamerName: "",
  listenerCount: 0,
  history: [],
  isOnline: false,
};

function parseNowPlaying(data: NowPlayingData): NowPlayingState {
  return {
    track: data.now_playing?.song.title ?? "",
    artist: data.now_playing?.song.artist ?? "",
    artwork: data.now_playing?.song.art ?? "",
    isLive: data.live.is_live,
    streamerName: data.live.streamer_name,
    listenerCount: data.listeners.current,
    history: data.song_history ?? [],
    isOnline: data.is_online,
  };
}

export function useNowPlaying(): NowPlayingState {
  const [state, setState] = useState<NowPlayingState>(DEFAULT_STATE);
  const sseRef = useRef<EventSource | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sseFailedRef = useRef(false);

  const poll = useCallback(async () => {
    try {
      // Use the server-side proxy to avoid mixed-content blocking
      const res = await fetch("/api/nowplaying", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as NowPlayingData;
      setState(parseNowPlaying(data));
    } catch {
      // Silently fail — keep last known state
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    poll(); // immediate
    pollIntervalRef.current = setInterval(poll, 15_000);
  }, [poll]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Try SSE via proxy (avoids mixed-content blocking)
    const sse = new EventSource("/api/sse");
    sseRef.current = sse;

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as NowPlayingData;
        setState(parseNowPlaying(data));
        // SSE working — stop polling if it was running
        stopPolling();
      } catch {
        // Malformed SSE message
      }
    };

    sse.onerror = () => {
      if (!sseFailedRef.current) {
        sseFailedRef.current = true;
        // SSE failed — fall back to polling
        startPolling();
      }
    };

    // Do an immediate poll so we have data before SSE kicks in
    poll();

    return () => {
      sse.close();
      sseRef.current = null;
      stopPolling();
    };
  }, [poll, startPolling, stopPolling]);

  return state;
}

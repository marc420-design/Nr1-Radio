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
}

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
};

function parseNowPlaying(data: NowPlayingData): NowPlayingState {
  return {
    track: cleanTitle(data.now_playing?.song.title ?? ""),
    artist: data.now_playing?.song.artist ?? "",
    artwork: data.now_playing?.song.art ?? "",
    isLive: data.live.is_live,
    streamerName: data.live.streamer_name,
    listenerCount: data.listeners.current,
    uniqueListeners: data.listeners.unique,
    history: data.song_history ?? [],
    isOnline: data.is_online,
    hasLoaded: true,
  };
}

export function useNowPlaying(): NowPlayingState {
  const [state, setState] = useState<NowPlayingState>(DEFAULT_STATE);

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

  // Poll from mount. This replaced an SSE feed (/api/sse) that only ever carried
  // Centrifugo keepalives, never track data: the upstream subscription parameter
  // was malformed, and the interval was started from that feed's error handler,
  // so now-playing stayed frozen until the connection dropped at 300s.
  useEffect(() => {
    poll();
    const id = setInterval(poll, 15_000);
    return () => {
      clearInterval(id);
    };
  }, [poll]);

  return state;
}

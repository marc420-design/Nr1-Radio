"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAudioStream, type StreamStatus } from "@/hooks/useAudioStream";
import { useNowPlaying } from "@/hooks/useNowPlaying";
import { useMediaSession } from "@/hooks/useMediaSession";
import type { HistoryEntry } from "@/lib/azuracast";

interface PlayerContextValue {
  play: () => void;
  pause: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  status: StreamStatus;
  track: string;
  artist: string;
  artwork: string;
  isLive: boolean;
  streamerName: string;
  listenerCount: number;
  uniqueListeners: number;
  history: HistoryEntry[];
  isOnline: boolean;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

function PlayerProviderInner({ children }: { children: ReactNode }) {
  const audio = useAudioStream();
  const nowPlaying = useNowPlaying();

  // Media Session lives here so it persists across navigation
  useMediaSession({
    track: nowPlaying.track,
    artist: nowPlaying.artist,
    artwork: nowPlaying.artwork,
    isPlaying: audio.isPlaying,
    onPlay: audio.play,
    onPause: audio.pause,
  });

  const value = useMemo(
    () => ({ ...audio, ...nowPlaying }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      audio.isPlaying, audio.isMuted, audio.volume, audio.status,
      nowPlaying.track, nowPlaying.artist, nowPlaying.artwork,
      nowPlaying.isLive, nowPlaying.streamerName,
      nowPlaying.listenerCount, nowPlaying.uniqueListeners,
      nowPlaying.isOnline, nowPlaying.history,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  return <PlayerProviderInner>{children}</PlayerProviderInner>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

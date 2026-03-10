"use client";

import type { StreamStatus } from "@/hooks/useAudioStream";

interface PlayPauseButtonProps {
  isPlaying: boolean;
  status: StreamStatus;
  onPlay: () => void;
  onPause: () => void;
}

export function PlayPauseButton({ isPlaying, status, onPlay, onPause }: PlayPauseButtonProps) {
  const isLoading = status === "loading" || status === "reconnecting";

  return (
    <button
      onClick={isPlaying ? onPause : onPlay}
      disabled={isLoading}
      aria-label={isPlaying ? "Pause stream" : "Play stream"}
      className="relative flex items-center justify-center w-20 h-20 rounded-full bg-nr1-cyan text-nr1-black font-bold transition-all duration-200 glow-cyan hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : isPlaying ? (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg className="w-8 h-8 ml-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}

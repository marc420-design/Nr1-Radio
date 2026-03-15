"use client";

import Image from "next/image";
import { usePlayer } from "@/contexts/PlayerContext";
import { EqualizerBars } from "./EqualizerBars";
import { LiveBadge } from "./LiveBadge";
import { VolumeControl } from "./VolumeControl";

export function StickyPlayer() {
  const {
    play, pause, setVolume, toggleMute,
    isPlaying, isMuted, volume, status,
    track, artist, artwork, isLive, isOnline, listenerCount,
  } = usePlayer();

  const isLoading = status === "loading" || status === "reconnecting";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-nr1-grey/95 backdrop-blur-md border-t border-nr1-cyan/20 mobile-bar-glow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">

        {/* Artwork */}
        <div className="relative w-10 h-10 shrink-0 rounded overflow-hidden bg-nr1-black border border-nr1-cyan/20">
          {artwork ? (
            <Image src={artwork} alt="" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-nr1-cyan font-heading text-xs">NR1</span>
            </div>
          )}
        </div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-nr1-cyan truncate leading-none mb-0.5">
            {artist || "NR1 DNB Radio"}
          </p>
          <p className="text-sm font-body text-white truncate leading-none">
            {track || (isPlaying ? "Live Stream" : "Press play to listen")}
          </p>
        </div>

        {/* Status badge + eq — desktop only */}
        <div className="hidden sm:flex items-center gap-3">
          <LiveBadge isLive={isLive} isOnline={isOnline} status={status} />
          <EqualizerBars isPlaying={isPlaying} />
          {listenerCount > 0 && (
            <span className="text-xs font-mono text-nr1-muted whitespace-nowrap">
              {listenerCount} listening
            </span>
          )}
        </div>

        {/* Play/pause */}
        <button
          onClick={isPlaying ? pause : play}
          disabled={isLoading}
          aria-label={isPlaying ? "Pause stream" : "Play stream"}
          className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-nr1-cyan text-nr1-black transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed glow-cyan"
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : isPlaying ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Volume — desktop only */}
        <div className="hidden lg:block">
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
          />
        </div>

      </div>
    </div>
  );
}

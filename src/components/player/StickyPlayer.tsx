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

        {/* Live badge — always visible */}
        <div className="shrink-0">
          <LiveBadge isLive={isLive} isOnline={isOnline} status={status} />
        </div>

        {/* Equalizer + listener count — sm+ only */}
        <div className="hidden sm:flex items-center gap-3">
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
          className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-nr1-cyan text-nr1-black transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed glow-cyan"
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

        {/* Mute toggle — mobile only */}
        <button
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
          className="sm:hidden shrink-0 flex items-center justify-center w-9 h-9 rounded text-nr1-muted hover:text-nr1-cyan transition-colors"
        >
          {isMuted ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0017.73 18l2 2 1.27-1.27-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
          )}
        </button>

        {/* Volume slider — desktop only */}
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

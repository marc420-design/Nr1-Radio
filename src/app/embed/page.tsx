"use client";

import { usePlayer } from "@/contexts/PlayerContext";
import { PlayPauseButton } from "@/components/player/PlayPauseButton";

export default function EmbedPage() {
  const { play, pause, isPlaying, status, track, artist } = usePlayer();

  return (
    <>
      <meta name="robots" content="noindex" />
      <div className="flex items-center justify-center min-h-screen bg-nr1-black">
        <div className="player-card flex flex-col items-center gap-4 py-8 px-10 w-full max-w-xs">
          <p className="font-heading text-xl text-nr1-cyan tracking-widest">NR1 DNB RADIO</p>
          <PlayPauseButton isPlaying={isPlaying} status={status} onPlay={play} onPause={pause} />
          {track ? (
            <div className="text-center space-y-0.5">
              <p className="font-mono text-sm text-white truncate max-w-[200px]">{track}</p>
              <p className="font-mono text-xs text-nr1-muted truncate max-w-[200px]">{artist}</p>
            </div>
          ) : (
            <p className="font-mono text-xs text-nr1-muted">Live 24/7</p>
          )}
          <a
            href="https://listen-nr1dnb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-nr1-muted hover:text-nr1-cyan transition-colors"
          >
            listen-nr1dnb.com
          </a>
        </div>
      </div>
    </>
  );
}

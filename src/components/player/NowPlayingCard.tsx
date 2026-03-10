"use client";

import Image from "next/image";

interface NowPlayingCardProps {
  track: string;
  artist: string;
  artwork: string;
}

export function NowPlayingCard({ track, artist, artwork }: NowPlayingCardProps) {
  const hasTrack = track || artist;

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-nr1-grey border border-white/10">
        {artwork ? (
          <Image
            src={artwork}
            alt={`${artist} - ${track}`}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-nr1-cyan font-heading text-lg">NR1</span>
          </div>
        )}
      </div>

      <div className="min-w-0">
        {hasTrack ? (
          <>
            <p className="text-sm font-mono text-nr1-cyan truncate">{artist}</p>
            <p className="text-base font-body text-white truncate">{track}</p>
          </>
        ) : (
          <>
            <p className="text-sm font-mono text-nr1-muted">NR1 DNB Radio</p>
            <p className="text-base font-body text-white/50">Press play to listen</p>
          </>
        )}
      </div>
    </div>
  );
}

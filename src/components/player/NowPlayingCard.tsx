"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface NowPlayingCardProps {
  track: string;
  artist: string;
  artwork: string;
}

export function NowPlayingCard({ track, artist, artwork }: NowPlayingCardProps) {
  const hasTrack = track || artist;
  const [artError, setArtError] = useState(false);
  useEffect(() => { setArtError(false); }, [artwork]);

  return (
    <div
      className="flex items-center gap-3 min-w-0"
      role="region"
      aria-label="Now playing"
    >
      <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-nr1-grey border border-nr1-cyan/20">
        {artwork && !artError ? (
          <Image
            src={artwork}
            alt={`Album art for ${track} by ${artist}`}
            fill
            className="object-cover"
            onError={() => setArtError(true)}
          />
        ) : (
          <Image
            src="/icons/icon-192.png"
            alt="NR1 DNB Radio"
            fill
            className="object-cover"
          />
        )}
      </div>

      <div className="min-w-0">
        {hasTrack ? (
          <>
            <p className="text-sm font-mono text-nr1-cyan truncate" aria-label="Artist name">{artist}</p>
            <p className="text-base font-body text-white truncate" aria-label="Track title">{track}</p>
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

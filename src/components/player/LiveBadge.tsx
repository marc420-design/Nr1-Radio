"use client";

import type { StreamStatus } from "@/hooks/useAudioStream";

interface LiveBadgeProps {
  isLive: boolean;
  isOnline: boolean;
  status: StreamStatus;
}

export function LiveBadge({ isLive, isOnline, status }: LiveBadgeProps) {
  if (status === "reconnecting") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
        <span className="w-2 h-2 rounded-full bg-amber-400 live-pulse" />
        Reconnecting
      </span>
    );
  }

  if (status === "offline" || !isOnline) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-nr1-muted/20 text-nr1-muted border border-nr1-muted/30">
        <span className="w-2 h-2 rounded-full bg-nr1-muted" />
        Offline
      </span>
    );
  }

  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-nr1-crimson/20 text-nr1-crimson border border-nr1-crimson/30">
        <span className="w-2 h-2 rounded-full bg-nr1-crimson live-pulse" />
        Live
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-nr1-cyan/10 text-nr1-cyan border border-nr1-cyan/20">
      <span className="w-2 h-2 rounded-full bg-nr1-cyan" />
      AutoDJ
    </span>
  );
}

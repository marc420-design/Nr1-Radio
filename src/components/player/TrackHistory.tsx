"use client";

import type { HistoryEntry } from "@/lib/azuracast";

interface TrackHistoryProps {
  history: HistoryEntry[];
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function TrackHistory({ history }: TrackHistoryProps) {
  if (!history.length) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs font-mono text-nr1-muted uppercase tracking-widest mb-2">Recently Played</p>
      {history.slice(0, 8).map((entry, i) => (
        <div
          key={`${entry.song.id}-${i}`}
          className="flex items-center gap-3 py-1.5 opacity-60 hover:opacity-90 transition-opacity"
        >
          <span className="text-xs font-mono text-nr1-muted w-12 shrink-0">
            {formatTime(entry.played_at)}
          </span>
          <div className="min-w-0">
            <span className="text-xs text-nr1-cyan font-mono truncate block">{entry.song.artist}</span>
            <span className="text-xs text-white truncate block">{entry.song.title}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

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
    <div className="rounded-2xl border border-white/8 bg-nr1-grey/40 backdrop-blur-sm px-5 py-4">
      <p className="text-xs font-mono text-nr1-cyan/60 uppercase tracking-widest mb-3 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-nr1-cyan/40" />
        Recently Played
      </p>
      <div className="space-y-0">
        {history.slice(0, 8).map((entry, i) => (
          <div
            key={`${entry.song.id}-${i}`}
            className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0 opacity-60 hover:opacity-90 transition-opacity"
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
    </div>
  );
}

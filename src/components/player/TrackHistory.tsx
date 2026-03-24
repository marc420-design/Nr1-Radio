"use client";

import { useState } from "react";
import type { HistoryEntry } from "@/lib/azuracast";
import { cleanTitle } from "@/lib/azuracast";
import { TRACK_HISTORY_LIMIT } from "@/lib/constants";

interface TrackHistoryProps {
  history: HistoryEntry[];
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function TrackShareButton({ artist, title }: { artist: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = `Just heard ${artist} - ${title} on NR1 DNB Radio 🎵 listen-nr1dnb.com`;
    if (navigator.share) {
      try { await navigator.share({ title: "NR1 DNB Radio", text, url: "https://listen-nr1dnb.com" }); } catch { /* dismissed */ }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { /* clipboard unavailable */ }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-nr1-muted hover:text-nr1-cyan"
      aria-label="Share track"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-nr1-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      )}
    </button>
  );
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
        {history.slice(0, TRACK_HISTORY_LIMIT).map((entry, i) => (
          <div
            key={`${entry.song.id}-${i}`}
            className="group flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0 opacity-60 hover:opacity-90 transition-opacity"
          >
            <span className="text-xs font-mono text-nr1-muted w-12 shrink-0">
              {formatTime(entry.played_at)}
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-nr1-cyan font-mono truncate block">{entry.song.artist}</span>
              <span className="text-xs text-white truncate block">{cleanTitle(entry.song.title)}</span>
            </div>
            {entry.song.artist && entry.song.title && (
              <TrackShareButton artist={entry.song.artist} title={cleanTitle(entry.song.title)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

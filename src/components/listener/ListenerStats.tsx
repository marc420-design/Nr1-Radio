"use client";

import { useListenerStats } from "@/hooks/useListenerStats";
import { usePlayer } from "@/contexts/PlayerContext";

function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  const offset = 0x1f1e6 - "A".charCodeAt(0);
  return String.fromCodePoint(
    code.toUpperCase().charCodeAt(0) + offset,
    code.toUpperCase().charCodeAt(1) + offset
  );
}

export function ListenerStats() {
  const { total, byCountry, byCity } = useListenerStats();
  const { listenerCount } = usePlayer();

  // Use the nowplaying listener count as a fallback when the admin API key
  // isn't configured (listener-stats returns 0 without AZURACAST_API_KEY).
  const displayTotal = total > 0 ? total : listenerCount;

  if (!displayTotal) {
    return (
      <div className="border border-white/5 rounded-lg bg-nr1-grey/20 p-5">
        <p className="font-mono text-xs text-nr1-muted uppercase tracking-widest">
          Listening around the world
        </p>
        <p className="font-mono text-xs text-white/40 mt-1">
          Tune in and you&apos;ll be one of the first listeners tracked here.
        </p>
      </div>
    );
  }

  const topCountries = byCountry.slice(0, 8);
  const topCities = byCity.slice(0, 6);
  const maxCount = topCountries[0]?.count ?? 1;

  return (
    <div className="border border-white/10 rounded-lg bg-nr1-grey/30 p-5 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-nr1-muted uppercase tracking-widest">
          Listening around the world
        </p>
        <div className="text-right">
          <p className="font-heading text-3xl text-nr1-cyan leading-none">{displayTotal}</p>
          <p className="font-mono text-[10px] text-nr1-muted">
            listener{displayTotal === 1 ? "" : "s"} now
          </p>
        </div>
      </div>

      {/* Countries with flag + bar */}
      <div className="space-y-2.5">
        {topCountries.map((c) => (
          <div key={c.country} className="flex items-center gap-3">
            <span className="text-2xl w-8 shrink-0 leading-none" aria-hidden="true">
              {countryFlag(c.code)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-white truncate">{c.country}</span>
                <span className="font-mono text-xs text-nr1-cyan shrink-0 ml-2 tabular-nums">
                  {c.count}
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-1 rounded-full bg-nr1-cyan transition-all duration-700"
                  style={{ width: `${Math.max(4, (c.count / maxCount) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cities grid */}
      {topCities.length > 0 && (
        <div>
          <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest mb-2">
            Top cities
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {topCities.map((c) => (
              <div
                key={`${c.city}-${c.country}`}
                className="flex items-center justify-between rounded border border-white/10 bg-nr1-grey/40 px-2.5 py-1.5 gap-1"
              >
                <span className="font-mono text-xs text-white truncate">{c.city}</span>
                <span className="font-mono text-xs text-nr1-cyan shrink-0 tabular-nums">
                  {c.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

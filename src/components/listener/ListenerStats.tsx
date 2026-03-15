"use client";

import { useListenerStats } from "@/hooks/useListenerStats";

export function ListenerStats() {
  const { total, byCountry, byCity } = useListenerStats();

  if (!total || byCountry.length === 0) {
    return (
      <div className="border border-white/5 rounded-lg bg-nr1-grey/20 p-4">
        <p className="font-mono text-xs text-nr1-muted uppercase tracking-widest">
          Listening around the world
        </p>
        <p className="font-mono text-xs text-white/40 mt-1">
          Tune in and you&apos;ll be one of the first listeners tracked here.
        </p>
      </div>
    );
  }

  const top = byCountry.slice(0, 5);
  const topCities = byCity.slice(0, 5);

  return (
    <div className="border border-white/10 rounded-lg bg-nr1-grey/30 p-4 space-y-2">
      <p className="font-mono text-xs text-nr1-muted uppercase tracking-widest">
        Listening around the world
      </p>
      <p className="font-mono text-xs text-white/60">
        {total} listener{total === 1 ? "" : "s"} connected
      </p>
      <div className="flex flex-wrap gap-2 pt-1">
        {top.map((c) => (
          <span
            key={c.country}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-nr1-cyan/30 bg-nr1-cyan/10 text-[11px] font-mono text-nr1-cyan"
          >
            <span aria-hidden="true">●</span>
            <span>{c.country}</span>
            <span className="text-nr1-muted">
              {c.count} listener{c.count === 1 ? "" : "s"}
            </span>
          </span>
        ))}
      </div>

      {topCities.length > 0 && (
        <div className="pt-2">
          <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest">
            Top cities
          </p>
          <div className="mt-2 grid sm:grid-cols-2 gap-2">
            {topCities.map((c) => (
              <div
                key={`${c.city}-${c.country}`}
                className="flex items-center justify-between rounded-md border border-white/10 bg-nr1-grey/30 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs text-white truncate">{c.city}</p>
                  <p className="font-mono text-[11px] text-white/40 truncate">{c.country}</p>
                </div>
                <p className="font-mono text-xs text-nr1-cyan shrink-0">
                  {c.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


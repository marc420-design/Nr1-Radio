"use client";

import { useEffect, useState } from "react";

interface CountryStat {
  country: string;
  count: number;
}

interface CityStat {
  city: string;
  country: string;
  count: number;
}

interface ListenerStats {
  total: number;
  byCountry: CountryStat[];
  byCity: CityStat[];
}

const DEFAULT_STATS: ListenerStats = {
  total: 0,
  byCountry: [],
  byCity: [],
};

export function useListenerStats(refreshMs: number = 60000): ListenerStats {
  const [stats, setStats] = useState<ListenerStats>(DEFAULT_STATS);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/listener-stats", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as ListenerStats;
        if (!cancelled) setStats(data);
      } catch {
        // ignore – keep old stats
      }
    }

    load();
    const id = setInterval(load, refreshMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [refreshMs]);

  return stats;
}


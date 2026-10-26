"use client";

import { useEffect, useState } from "react";

interface CountryStat {
  country: string;
  count: number;
  code: string;
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
      if (document.visibilityState === "hidden") return;
      try {
        const res = await fetch("/api/listener-stats");
        if (!res.ok) return;
        const data = (await res.json()) as ListenerStats;
        if (!cancelled) setStats(data);
      } catch {
        // ignore – keep old stats
      }
    }

    load();
    const id = setInterval(load, refreshMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refreshMs]);

  return stats;
}


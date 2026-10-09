"use client";

import { useMemo, useState } from "react";
import type { ShowRow } from "@/lib/supabase";
import { featuredScore, formatArchiveMonth, getArchiveMonth, isJ2BShow } from "@/lib/archive";
import { ShowCard } from "./ShowCard";

export function ArchiveBrowser({ shows }: { shows: ShowRow[] }) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [visible, setVisible] = useState(32);
  const years = [...new Set(shows.map(s => getArchiveMonth(s).slice(0, 4)))].filter(y => y !== "unda").sort().reverse();
  const months = [...new Set(shows.map(getArchiveMonth))].filter(m => m !== "undated" && (year === "all" || m.startsWith(year))).sort().reverse();
  const filtered = useMemo(() => shows.filter(show => {
    const key = getArchiveMonth(show);
    return (year === "all" || key.startsWith(year)) && (month === "all" || key === month)
      && (!query || `${show.title} ${show.lineup ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  }), [shows, query, year, month]);
  const featured = [...filtered].filter(s => featuredScore(s) > 0).sort((a, b) => featuredScore(b) - featuredScore(a)).slice(0, 8);
  const featuredIds = new Set(featured.map(s => s.id));
  const j2b = filtered.filter(s => isJ2BShow(s) && !featuredIds.has(s.id))
    .sort((a, b) => (b.duration_min ?? 0) - (a.duration_min ?? 0));
  const pinnedIds = new Set([...featuredIds, ...j2b.map(s => s.id)]);
  const remaining = filtered.filter(s => !pinnedIds.has(s.id));
  const displayed = remaining.slice(0, visible);
  const groups = [...new Set(displayed.map(getArchiveMonth))];
  const inputClass = "rounded-lg border border-white/20 bg-nr1-black px-3 py-3 font-mono text-sm text-white focus:border-nr1-cyan focus:outline-none";
  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-2 text-xs font-mono text-nr1-muted">Find a show or artist
          <input className={inputClass} type="search" value={query} placeholder="Search names and show titles" onChange={e => { setQuery(e.target.value); setVisible(32); }} />
        </label>
        <label className="grid gap-2 text-xs font-mono text-nr1-muted">Year
          <select className={inputClass} value={year} onChange={e => { setYear(e.target.value); setMonth("all"); setVisible(32); }}><option value="all">All years</option>{years.map(y => <option key={y}>{y}</option>)}</select>
        </label>
        <label className="grid gap-2 text-xs font-mono text-nr1-muted">Month
          <select className={inputClass} value={month} onChange={e => { setMonth(e.target.value); if (e.target.value === "undated") setYear("all"); setVisible(32); }}><option value="all">All months</option>{months.map(m => <option key={m} value={m}>{formatArchiveMonth(m)}</option>)}<option value="undated">Date unverified</option></select>
        </label>
      </div>
      <p className="font-mono text-xs text-nr1-muted" role="status">{filtered.length} recordings · newest first</p>
      {featured.length > 0 && <section className="space-y-4" aria-label="Featured archive sets"><h2 className="font-heading text-2xl text-nr1-cyan">Rinze · DNA · So-Low</h2><p className="font-mono text-xs text-nr1-muted">Featured archive sets · full lineups shown on each recording</p><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{featured.map(show => <ShowCard key={show.id} show={show} />)}</div></section>}
      {j2b.length > 0 && <section className="space-y-4" aria-label="J2B archive shows">
        <h2 className="font-heading text-2xl text-nr1-cyan">J2B shows</h2>
        <p className="font-mono text-xs text-nr1-muted">Longest recordings first</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{j2b.map(show => <ShowCard key={show.id} show={show} />)}</div>
      </section>}
      {groups.map(group => <section key={group} aria-label={formatArchiveMonth(group)} className="space-y-4">
        <h2 className="font-heading text-2xl text-white">{formatArchiveMonth(group)}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{displayed.filter(s => getArchiveMonth(s) === group).map(show => <ShowCard key={show.id} show={show} />)}</div>
      </section>)}
      {!filtered.length && <p className="font-mono text-nr1-muted py-12">No recordings match these filters.</p>}
      {visible < remaining.length && <button className="rounded-lg border border-nr1-cyan/40 px-6 py-3 font-mono text-sm text-nr1-cyan hover:bg-nr1-cyan/10" onClick={() => setVisible(n => n + 32)}>Show more recordings</button>}
    </div>
  );
}

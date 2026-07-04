"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReportControls({ initialFrom, initialTo }: { initialFrom: string; initialTo: string }) {
  const router = useRouter();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<string | null>(null);

  function applyRange(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/admin/reports?from=${from}&to=${to}`);
  }

  function downloadCsv() {
    window.location.href = `/api/admin/reports/csv?from=${from}&to=${to}`;
  }

  async function runBackfill() {
    if (!confirm(`Backfill from ${from} to ${to}? This may take a while for large ranges.`)) return;
    setBackfilling(true);
    setBackfillResult(null);
    try {
      const res = await fetch("/api/admin/backfill-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: from, end: to }),
      });
      const data = await res.json();
      if (!res.ok) {
        setBackfillResult(`Error: ${data.error ?? res.statusText}`);
      } else {
        setBackfillResult(`Fetched ${data.fetched} tracks, inserted ${data.inserted} new rows across ${data.days?.length ?? 0} day(s).`);
        router.refresh();
      }
    } catch (err) {
      setBackfillResult(`Error: ${(err as Error).message}`);
    } finally {
      setBackfilling(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded border border-nr1-cyan/20 bg-nr1-grey/40 p-4 space-y-4">
        <h2 className="font-heading text-lg text-white tracking-widest">DATE RANGE</h2>
        <form onSubmit={applyRange} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-nr1-muted font-mono">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-nr1-black border border-nr1-cyan/30 rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-nr1-cyan"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-widest text-nr1-muted font-mono">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-nr1-black border border-nr1-cyan/30 rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-nr1-cyan"
            />
          </label>
          <button
            type="submit"
            className="bg-nr1-cyan text-nr1-black font-heading tracking-widest px-5 py-2 rounded hover:bg-nr1-cyan/90"
          >
            APPLY
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            className="border border-nr1-cyan text-nr1-cyan font-heading tracking-widest px-5 py-2 rounded hover:bg-nr1-cyan/10"
          >
            DOWNLOAD CSV
          </button>
        </form>
      </div>

      <div className="rounded border border-amber-400/30 bg-nr1-grey/40 p-4 space-y-3">
        <div>
          <h2 className="font-heading text-lg text-amber-400 tracking-widest">BACKFILL FROM AZURACAST</h2>
          <p className="text-xs text-nr1-muted font-mono mt-1">
            Pulls play history from AzuraCast for the date range above and upserts into <code>play_history</code>.
            Safe to re-run — duplicates are ignored.
          </p>
        </div>
        <button
          type="button"
          onClick={runBackfill}
          disabled={backfilling}
          className="bg-amber-400 text-nr1-black font-heading tracking-widest px-5 py-2 rounded hover:bg-amber-300 disabled:opacity-40"
        >
          {backfilling ? "BACKFILLING…" : "RUN BACKFILL"}
        </button>
        {backfillResult && (
          <p className="text-xs font-mono text-white bg-nr1-black/60 rounded px-3 py-2">{backfillResult}</p>
        )}
      </div>
    </section>
  );
}

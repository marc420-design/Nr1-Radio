import { getSupabaseAdminClient } from "@/lib/supabase";
import { ReportControls } from "./ReportControls";

export const dynamic = "force-dynamic";

interface PlayRow {
  played_at: string;
  song_artist: string | null;
  song_title: string | null;
  song_isrc: string | null;
  duration_sec: number | null;
  playlist: string | null;
  streamer: string | null;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function getRows(from: string, to: string): Promise<{ rows: PlayRow[]; total: number }> {
  const supabase = getSupabaseAdminClient();
  const fromIso = new Date(`${from}T00:00:00Z`).toISOString();
  const toIso = new Date(`${to}T23:59:59Z`).toISOString();
  const { data, count } = await supabase
    .from("play_history")
    .select("played_at,song_artist,song_title,song_isrc,duration_sec,playlist,streamer", { count: "exact" })
    .gte("played_at", fromIso)
    .lte("played_at", toIso)
    .order("played_at", { ascending: false })
    .limit(500);
  return { rows: (data ?? []) as PlayRow[], total: count ?? 0 };
}

async function getTableStats() {
  const supabase = getSupabaseAdminClient();
  const { count } = await supabase.from("play_history").select("id", { count: "exact", head: true });
  const { data: latest } = await supabase
    .from("play_history")
    .select("played_at")
    .order("played_at", { ascending: false })
    .limit(1);
  const { data: earliest } = await supabase
    .from("play_history")
    .select("played_at")
    .order("played_at", { ascending: true })
    .limit(1);
  return {
    total: count ?? 0,
    earliest: (earliest?.[0]?.played_at as string | undefined) ?? null,
    latest: (latest?.[0]?.played_at as string | undefined) ?? null,
  };
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const from = params.from ?? daysAgoIso(7);
  const to = params.to ?? todayIso();

  const [{ rows, total }, stats] = await Promise.all([getRows(from, to), getTableStats()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-nr1-cyan tracking-widest">REPORTS</h1>
        <p className="text-sm text-nr1-muted mt-1">Broadcast play history — PRS/PPL cue sheets.</p>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Total rows in play_history" value={stats.total.toLocaleString()} />
        <StatCard label="Earliest logged" value={stats.earliest ? stats.earliest.slice(0, 10) : "—"} />
        <StatCard label="Latest logged" value={stats.latest ? stats.latest.slice(0, 10) : "—"} />
      </section>

      <ReportControls initialFrom={from} initialTo={to} />

      <section className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-lg text-white tracking-widest">RESULTS</h2>
          <p className="text-xs font-mono text-nr1-muted">
            {total.toLocaleString()} track{total === 1 ? "" : "s"} between {from} and {to}
            {total > 500 && <span className="text-amber-400"> — showing latest 500 (CSV has all)</span>}
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-nr1-muted font-mono py-8 text-center">
            No plays logged in this range. If it should have data, run a backfill above.
          </p>
        ) : (
          <div className="overflow-x-auto border border-nr1-cyan/20 rounded">
            <table className="w-full text-xs font-mono">
              <thead className="bg-nr1-grey/50 text-nr1-muted text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="text-left px-3 py-2">Played (UTC)</th>
                  <th className="text-left px-3 py-2">Artist</th>
                  <th className="text-left px-3 py-2">Title</th>
                  <th className="text-left px-3 py-2">Duration</th>
                  <th className="text-left px-3 py-2">ISRC</th>
                  <th className="text-left px-3 py-2">Playlist</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.played_at}-${i}`} className="border-t border-nr1-cyan/10 hover:bg-nr1-grey/30">
                    <td className="px-3 py-2 whitespace-nowrap">{r.played_at.slice(0, 19).replace("T", " ")}</td>
                    <td className="px-3 py-2">{r.song_artist ?? "—"}</td>
                    <td className="px-3 py-2">{r.song_title ?? "—"}</td>
                    <td className="px-3 py-2">{fmtDuration(r.duration_sec)}</td>
                    <td className="px-3 py-2 text-nr1-muted">{r.song_isrc ?? ""}</td>
                    <td className="px-3 py-2 text-nr1-muted">{r.playlist ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function fmtDuration(sec: number | null): string {
  if (!sec || sec < 0) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-nr1-cyan/20 bg-nr1-grey/40 px-4 py-3">
      <p className="text-[10px] uppercase tracking-widest text-nr1-muted">{label}</p>
      <p className="font-heading text-2xl text-white">{value}</p>
    </div>
  );
}

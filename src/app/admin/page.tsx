import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getStats() {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("shows").select("tracklist_status");
  const rows = data ?? [];
  const missing = rows.filter(r => r.tracklist_status === "missing").length;
  const partial = rows.filter(r => r.tracklist_status === "partial").length;
  const complete = rows.filter(r => r.tracklist_status === "complete").length;
  return { total: rows.length, missing, partial, complete };
}

export default async function AdminHomePage() {
  const stats = await getStats();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-nr1-cyan tracking-widest">DASHBOARD</h1>
        <p className="text-sm text-nr1-muted mt-1">Radio administration.</p>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Shows total" value={stats.total} />
        <StatCard label="Missing tracklist" value={stats.missing} accent="crimson" />
        <StatCard label="Partial" value={stats.partial} accent="amber" />
        <StatCard label="Complete" value={stats.complete} accent="cyan" />
      </section>

      <section className="space-y-2">
        <h2 className="font-heading text-lg text-white tracking-widest">SHORTCUTS</h2>
        <ul className="text-sm space-y-1">
          <li><Link href="/admin/tracklists" className="text-nr1-cyan hover:underline">→ Tracklists</Link> — catalog show tracklists for PRS/PPL cue sheets</li>
        </ul>
      </section>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: "cyan" | "crimson" | "amber" }) {
  const colour =
    accent === "crimson" ? "text-nr1-crimson"
      : accent === "amber" ? "text-amber-400"
      : accent === "cyan" ? "text-nr1-cyan"
      : "text-white";
  return (
    <div className="rounded border border-nr1-cyan/20 bg-nr1-grey/40 px-4 py-3">
      <p className="text-[10px] uppercase tracking-widest text-nr1-muted">{label}</p>
      <p className={`font-heading text-3xl ${colour}`}>{value}</p>
    </div>
  );
}

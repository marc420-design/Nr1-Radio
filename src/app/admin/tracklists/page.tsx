import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase";
import type { ShowRow } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getShows(): Promise<ShowRow[]> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("shows")
    .select("*")
    .order("uploaded_at", { ascending: false });
  return (data as unknown as ShowRow[]) ?? [];
}

export default async function TracklistsPage() {
  const shows = await getShows();
  const missing = shows.filter(s => (s.tracklist_status ?? "missing") === "missing").length;
  const partial = shows.filter(s => s.tracklist_status === "partial").length;
  const complete = shows.filter(s => s.tracklist_status === "complete").length;

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="font-heading text-3xl text-nr1-cyan tracking-widest">TRACKLISTS</h1>
        <p className="text-xs font-mono text-nr1-muted">
          {shows.length} shows · <span className="text-nr1-crimson">{missing} missing</span> · <span className="text-amber-400">{partial} partial</span> · <span className="text-nr1-cyan">{complete} complete</span>
        </p>
      </div>

      {shows.length === 0 && (
        <div className="rounded border border-nr1-cyan/20 bg-nr1-grey/40 p-6 text-sm text-nr1-muted">
          No shows in the database yet. Run <code className="text-nr1-cyan">node scripts/seed-shows-from-azuracast.js</code> to seed from AzuraCast.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-nr1-muted border-b border-nr1-cyan/20">
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Title</th>
              <th className="py-2 pr-3">Lineup</th>
              <th className="py-2 pr-3">Duration</th>
              <th className="py-2 pr-3">Uploaded</th>
              <th className="py-2 pr-3">Tracks</th>
              <th className="py-2 pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {shows.map(show => {
              const status = show.tracklist_status ?? "missing";
              const trackCount = show.tracklist?.length ?? 0;
              return (
                <tr key={show.id} className="border-b border-nr1-cyan/5 hover:bg-nr1-grey/30">
                  <td className="py-2 pr-3"><StatusPill status={status} /></td>
                  <td className="py-2 pr-3 text-white">{show.title}</td>
                  <td className="py-2 pr-3 text-nr1-muted">{show.lineup ?? "—"}</td>
                  <td className="py-2 pr-3 font-mono text-nr1-muted">
                    {show.duration_min != null ? `${show.duration_min}m` : "—"}
                  </td>
                  <td className="py-2 pr-3 font-mono text-nr1-muted">
                    {show.uploaded_at ? show.uploaded_at.slice(0, 10) : "—"}
                  </td>
                  <td className="py-2 pr-3 font-mono text-nr1-muted">{trackCount}</td>
                  <td className="py-2 pr-3">
                    <Link href={`/admin/tracklists/${show.id}`} className="text-nr1-cyan hover:underline">
                      edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    missing: "bg-nr1-crimson/20 text-nr1-crimson border-nr1-crimson/30",
    partial: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    complete: "bg-nr1-cyan/20 text-nr1-cyan border-nr1-cyan/30",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border ${styles[status] ?? styles.missing}`}>
      {status}
    </span>
  );
}

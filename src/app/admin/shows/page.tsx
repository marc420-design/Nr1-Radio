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

function sourceLabel(show: ShowRow): { label: string; className: string } {
  if (show.bunny_video_id) return { label: "bunny", className: "text-nr1-cyan" };
  if (show.youtube_id) return { label: "youtube (legacy)", className: "text-amber-400" };
  return { label: "—", className: "text-nr1-muted" };
}

export default async function AdminShowsPage() {
  const shows = await getShows();

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="font-heading text-3xl text-nr1-cyan tracking-widest">SHOWS</h1>
        <div className="flex items-center gap-4">
          <p className="text-xs font-mono text-nr1-muted">{shows.length} shows</p>
          <Link
            href="/admin/shows/new"
            className="bg-nr1-cyan text-nr1-black font-heading tracking-widest text-xs px-4 py-2 rounded hover:bg-nr1-cyan/90"
          >
            + NEW SHOW
          </Link>
        </div>
      </div>

      {shows.length === 0 && (
        <div className="rounded border border-nr1-cyan/20 bg-nr1-grey/40 p-6 text-sm text-nr1-muted">
          No shows yet. Upload a set to Bunny.net Stream, copy the video GUID, then click <strong>NEW SHOW</strong>.
        </div>
      )}

      {shows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-nr1-muted border-b border-nr1-cyan/20">
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Lineup</th>
                <th className="py-2 pr-3">Duration</th>
                <th className="py-2 pr-3">Uploaded</th>
                <th className="py-2 pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => {
                const src = sourceLabel(show);
                return (
                  <tr key={show.id} className="border-b border-nr1-cyan/5 hover:bg-nr1-grey/30">
                    <td className={`py-2 pr-3 font-mono text-[10px] uppercase tracking-widest ${src.className}`}>
                      {src.label}
                    </td>
                    <td className="py-2 pr-3 text-white">{show.title}</td>
                    <td className="py-2 pr-3 text-nr1-muted">{show.lineup ?? "—"}</td>
                    <td className="py-2 pr-3 font-mono text-nr1-muted">
                      {show.duration_min != null ? `${show.duration_min}m` : "—"}
                    </td>
                    <td className="py-2 pr-3 font-mono text-nr1-muted">
                      {show.uploaded_at ? show.uploaded_at.slice(0, 10) : "—"}
                    </td>
                    <td className="py-2 pr-3 space-x-3">
                      <Link href={`/shows/${show.id}`} className="text-nr1-cyan hover:underline text-xs">
                        view
                      </Link>
                      <Link href={`/admin/tracklists/${show.id}`} className="text-nr1-cyan hover:underline text-xs">
                        tracklist
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

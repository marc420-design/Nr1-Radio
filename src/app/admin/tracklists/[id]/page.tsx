import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase";
import type { ShowRow } from "@/lib/supabase";
import { stringifyTracklist } from "@/lib/tracklist-parser";
import { saveTracklistAction } from "./actions";

export const dynamic = "force-dynamic";

async function getShow(id: string): Promise<ShowRow | null> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from("shows").select("*").eq("id", id).maybeSingle();
  return (data as unknown as ShowRow) ?? null;
}

export default async function EditTracklistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const show = await getShow(id);
  if (!show) notFound();

  const currentText = show.tracklist ? stringifyTracklist(show.tracklist) : "";
  const status = show.tracklist_status ?? "missing";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/tracklists" className="text-xs font-mono text-nr1-muted hover:text-nr1-cyan">
          ← all tracklists
        </Link>
        <h1 className="font-heading text-3xl text-nr1-cyan tracking-widest mt-2">{show.title}</h1>
        <p className="text-sm text-nr1-muted mt-1">
          {show.lineup ?? "—"} · {show.duration_min ? `${show.duration_min}m` : "unknown duration"} · uploaded {show.uploaded_at?.slice(0, 10) ?? "—"}
        </p>
      </div>

      <form action={saveTracklistAction} className="space-y-4">
        <input type="hidden" name="id" value={show.id} />

        <div>
          <label htmlFor="tracklist" className="block text-xs uppercase tracking-widest text-nr1-muted mb-2">
            Tracklist
          </label>
          <textarea
            id="tracklist"
            name="tracklist"
            rows={20}
            defaultValue={currentText}
            spellCheck={false}
            className="w-full bg-nr1-black border border-nr1-cyan/20 rounded p-3 font-mono text-sm text-white focus:border-nr1-cyan focus:outline-none"
            placeholder={`One per line. Formats accepted:
Artist - Title
00:00 Artist - Title
1. Artist - Title
Artist - Title [ISRC:GBXXX2400001]

Or paste a JSON array: [{"artist":"...","title":"..."}]`}
          />
          <p className="text-[10px] font-mono text-nr1-muted mt-1">
            One track per line. Timestamps and ISRCs optional. Lines starting with # are ignored.
          </p>
        </div>

        <div>
          <label htmlFor="status" className="block text-xs uppercase tracking-widest text-nr1-muted mb-2">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="bg-nr1-black border border-nr1-cyan/20 rounded px-3 py-2 font-mono text-sm text-white focus:border-nr1-cyan focus:outline-none"
          >
            <option value="missing">Missing</option>
            <option value="partial">Partial</option>
            <option value="complete">Complete</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-nr1-cyan text-nr1-black font-heading tracking-widest px-6 py-2 rounded hover:bg-nr1-cyan/90"
          >
            SAVE
          </button>
          <Link
            href="/admin/tracklists"
            className="border border-nr1-cyan/30 text-nr1-cyan font-heading tracking-widest px-6 py-2 rounded hover:bg-nr1-cyan/10"
          >
            CANCEL
          </Link>
        </div>
      </form>
    </div>
  );
}

import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function isAuthed(req: NextRequest) {
  return req.cookies.get("admin_token")?.value === process.env.ADMIN_PASSWORD;
}

function csvEscape(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function fmtDuration(sec: number | null): string {
  if (!sec || sec < 0) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  if (!fromStr || !toStr) {
    return NextResponse.json({ error: "from and to (YYYY-MM-DD) required" }, { status: 400 });
  }

  const fromIso = new Date(`${fromStr}T00:00:00Z`).toISOString();
  const toIso = new Date(`${toStr}T23:59:59Z`).toISOString();

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("play_history")
    .select("played_at,song_artist,song_title,song_isrc,duration_sec,playlist,streamer")
    .gte("played_at", fromIso)
    .lte("played_at", toIso)
    .order("played_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const header = ["Broadcast Date", "Broadcast Time (UTC)", "Duration", "Track Title", "Artist", "ISRC", "Playlist", "Streamer"];
  const lines = [header.join(",")];

  for (const r of data ?? []) {
    const dt = new Date(r.played_at as string);
    const date = dt.toISOString().slice(0, 10);
    const time = dt.toISOString().slice(11, 19);
    lines.push([
      csvEscape(date),
      csvEscape(time),
      csvEscape(fmtDuration(r.duration_sec as number | null)),
      csvEscape(r.song_title as string | null),
      csvEscape(r.song_artist as string | null),
      csvEscape(r.song_isrc as string | null),
      csvEscape(r.playlist as string | null),
      csvEscape(r.streamer as string | null),
    ].join(","));
  }

  const filename = `nr1-dnb-cue-sheet_${fromStr}_${toStr}.csv`;
  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

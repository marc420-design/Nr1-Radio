import { NextResponse, type NextRequest } from "next/server";
import { AZURACAST_BASE_URL as BASE_URL, STATION_ID } from "@/lib/constants";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { ShowRow, TracklistEntry } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface AzuraHistoryEntry {
  played_at: number;
  duration: number;
  song?: { title?: string; artist?: string; isrc?: string };
  streamer?: string;
  playlist?: string;
  media?: { custom_fields?: Record<string, string> };
}

interface CueSheetRow {
  played_at_iso: string;
  played_at_epoch: number;
  show_title: string;
  show_lineup: string;
  track_artist: string;
  track_title: string;
  track_isrc: string;
  track_duration_sec: number | "";
  source: "azuracast_playback" | "show_tracklist";
}

function csvEscape(v: string | number | undefined | null): string {
  if (v === undefined || v === null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: CueSheetRow[]): string {
  const headers: (keyof CueSheetRow)[] = [
    "played_at_iso",
    "played_at_epoch",
    "show_title",
    "show_lineup",
    "track_artist",
    "track_title",
    "track_isrc",
    "track_duration_sec",
    "source",
  ];
  const head = headers.join(",");
  const body = rows.map(r => headers.map(h => csvEscape(r[h])).join(",")).join("\n");
  return head + "\n" + body + "\n";
}

async function fetchAzuraHistory(from: number, to: number): Promise<AzuraHistoryEntry[]> {
  const key = process.env.AZURACAST_API_KEY;
  if (!key) return [];
  const url = `${BASE_URL}/api/station/${STATION_ID}/history?start=${from}&end=${to}`;
  const res = await fetch(url, {
    headers: { "X-API-Key": key },
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function fetchShowsInWindow(fromIso: string, toIso: string): Promise<ShowRow[]> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("shows")
    .select("*")
    .gte("uploaded_at", fromIso)
    .lte("uploaded_at", toIso);
  return (data as unknown as ShowRow[]) ?? [];
}

function expandShowTracklist(show: ShowRow): CueSheetRow[] {
  if (!show.tracklist || show.tracklist.length === 0) return [];
  const baseEpoch = show.uploaded_at ? Math.floor(new Date(show.uploaded_at).getTime() / 1000) : 0;
  return show.tracklist.map((t: TracklistEntry) => {
    const epoch = baseEpoch + (t.start_time_sec ?? 0);
    return {
      played_at_iso: new Date(epoch * 1000).toISOString(),
      played_at_epoch: epoch,
      show_title: show.title,
      show_lineup: show.lineup ?? "",
      track_artist: t.artist,
      track_title: t.title,
      track_isrc: t.isrc ?? "",
      track_duration_sec: t.duration_sec ?? "",
      source: "show_tracklist",
    };
  });
}

function toAzuraRow(h: AzuraHistoryEntry): CueSheetRow {
  return {
    played_at_iso: new Date(h.played_at * 1000).toISOString(),
    played_at_epoch: h.played_at,
    show_title: "",
    show_lineup: h.streamer ?? "",
    track_artist: h.song?.artist ?? "",
    track_title: h.song?.title ?? "",
    track_isrc: h.song?.isrc ?? "",
    track_duration_sec: h.duration ?? "",
    source: "azuracast_playback",
  };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  const format = url.searchParams.get("format") ?? "csv";

  if (!fromParam || !toParam) {
    return NextResponse.json(
      { error: "from and to query params required (YYYY-MM-DD)" },
      { status: 400 },
    );
  }
  const fromDate = new Date(`${fromParam}T00:00:00Z`);
  const toDate = new Date(`${toParam}T23:59:59Z`);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return NextResponse.json({ error: "invalid date" }, { status: 400 });
  }
  const fromEpoch = Math.floor(fromDate.getTime() / 1000);
  const toEpoch = Math.floor(toDate.getTime() / 1000);

  const secret = req.headers.get("x-report-key");
  if (!secret || secret !== process.env.REPORT_API_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [azuraHistory, shows] = await Promise.all([
    fetchAzuraHistory(fromEpoch, toEpoch),
    fetchShowsInWindow(fromDate.toISOString(), toDate.toISOString()),
  ]);

  const rows: CueSheetRow[] = [
    ...azuraHistory.map(toAzuraRow),
    ...shows.flatMap(expandShowTracklist),
  ].sort((a, b) => a.played_at_epoch - b.played_at_epoch);

  if (format === "json") {
    return NextResponse.json({
      from: fromParam,
      to: toParam,
      station: STATION_ID,
      count: rows.length,
      rows,
    });
  }

  const csv = toCsv(rows);
  const filename = `nr1-cue-sheet-${fromParam}-to-${toParam}.csv`;
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

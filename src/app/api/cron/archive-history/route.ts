import { NextResponse, type NextRequest } from "next/server";
import { AZURACAST_BASE_URL as BASE_URL, STATION_ID } from "@/lib/constants";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface AzuraHistoryEntry {
  played_at: number;
  duration: number;
  song?: { title?: string; artist?: string; isrc?: string };
  streamer?: string;
  playlist?: string;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.AZURACAST_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AZURACAST_API_KEY not set" }, { status: 500 });
  }

  // Archive yesterday's full 24-hour window
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setUTCHours(23, 59, 59, 999);

  const fromEpoch = Math.floor(yesterday.getTime() / 1000);
  const toEpoch = Math.floor(endOfYesterday.getTime() / 1000);

  const url = `${BASE_URL}/api/station/${STATION_ID}/history?start=${fromEpoch}&end=${toEpoch}`;
  const res = await fetch(url, {
    headers: { "X-API-Key": apiKey },
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: `AzuraCast returned ${res.status}` }, { status: 502 });
  }

  const history: AzuraHistoryEntry[] = await res.json();

  if (!Array.isArray(history) || history.length === 0) {
    return NextResponse.json({ inserted: 0, date: yesterday.toISOString().slice(0, 10) });
  }

  const rows = history.map((h) => ({
    played_at: new Date(h.played_at * 1000).toISOString(),
    played_at_epoch: h.played_at,
    song_artist: h.song?.artist ?? null,
    song_title: h.song?.title ?? null,
    song_isrc: h.song?.isrc ?? null,
    duration_sec: h.duration ?? null,
    playlist: h.playlist ?? null,
    streamer: h.streamer ?? null,
    source: "azuracast",
  }));

  const supabase = getSupabaseAdminClient();
  const { error, count } = await supabase
    .from("play_history")
    .upsert(rows, { onConflict: "played_at_epoch,song_title,song_artist", ignoreDuplicates: true })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    inserted: count ?? rows.length,
    date: yesterday.toISOString().slice(0, 10),
    total_fetched: history.length,
  });
}

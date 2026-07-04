import { AZURACAST_BASE_URL, STATION_ID } from "@/lib/constants";
import { getSupabaseAdminClient } from "@/lib/supabase";

interface AzuraHistoryEntry {
  played_at: number;
  duration: number;
  song?: { title?: string; artist?: string; isrc?: string };
  streamer?: string;
  playlist?: string;
}

export async function fetchAndUpsertHistory(startIso: string, endIso: string) {
  const apiKey = process.env.AZURACAST_API_KEY;
  if (!apiKey) throw new Error("AZURACAST_API_KEY not set");

  const url = `${AZURACAST_BASE_URL}/api/station/${STATION_ID}/history?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`;
  const res = await fetch(url, {
    headers: { "X-API-Key": apiKey },
    signal: AbortSignal.timeout(25000),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`AzuraCast returned ${res.status}: ${await res.text().catch(() => "")}`);
  }

  const history: AzuraHistoryEntry[] = await res.json();
  if (!Array.isArray(history) || history.length === 0) {
    return { fetched: 0, inserted: 0 };
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
    .upsert(rows, { onConflict: "played_at_epoch,song_title,song_artist", ignoreDuplicates: true, count: "exact" });

  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);

  return { fetched: history.length, inserted: count ?? 0 };
}

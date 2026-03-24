import { NextResponse } from "next/server";
import { AZURACAST_BASE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

const STATION_NUM_ID = 1; // numeric station ID (not shortcode)
const API_KEY = process.env.AZURACAST_API_KEY ?? "";

/**
 * Vercel Cron: runs every minute.
 * If a scheduled playlist is active (is_now) but the currently
 * playing song belongs to a different playlist, skip the current
 * song so AzuraCast picks up the scheduled show immediately.
 */
export async function GET(request: Request) {
  // Verify this was called by Vercel Cron (or an internal call)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: "No API key" }, { status: 500 });
  }

  const base = `${AZURACAST_BASE_URL}/api/station/${STATION_NUM_ID}`;
  const headers = { "X-API-Key": API_KEY };

  // 1. Get upcoming schedule — find any item with is_now = true
  const schedRes = await fetch(`${base}/schedule?rows=10`, { headers });
  if (!schedRes.ok) return NextResponse.json({ error: "schedule fetch failed" }, { status: 502 });
  const schedule: Array<{ id: number; type: string; name: string; is_now: boolean }> = await schedRes.json();

  const activeShow = schedule.find((s) => s.type === "playlist" && s.is_now);
  if (!activeShow) {
    return NextResponse.json({ status: "no_show_active" });
  }

  // 2. Get now playing — check which playlist is currently on air
  const npRes = await fetch(`${AZURACAST_BASE_URL}/api/nowplaying/${STATION_NUM_ID}`, { headers });
  if (!npRes.ok) return NextResponse.json({ error: "nowplaying fetch failed" }, { status: 502 });
  const np = await npRes.json();

  const currentPlaylist: string = np.now_playing?.playlist ?? "";
  const elapsed: number = np.now_playing?.elapsed ?? 0;

  // Already playing the right show — nothing to do
  if (currentPlaylist === activeShow.name) {
    return NextResponse.json({ status: "correct_show_playing", playlist: currentPlaylist });
  }

  // Only skip if the current track has been playing for at least 30 seconds
  // (avoids a rapid-fire double-skip on startup)
  if (elapsed < 30) {
    return NextResponse.json({ status: "waiting_for_track_to_settle", elapsed });
  }

  // 3. Skip the current song — AzuraCast will then pick from the active scheduled playlist
  const skipRes = await fetch(`${base}/backend/skip`, { method: "POST", headers });
  const skipData = await skipRes.json();

  return NextResponse.json({
    status: "skipped",
    reason: `Scheduled show "${activeShow.name}" was active but "${currentPlaylist}" was playing`,
    skip: skipData,
  });
}

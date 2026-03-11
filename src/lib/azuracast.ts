const BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL ?? "http://radio.listen-nr1dnb.com";
const STATION_ID = process.env.NEXT_PUBLIC_STATION_ID ?? "nr1dnb";
const STATION_SHORTCODE = process.env.NEXT_PUBLIC_STATION_SHORTCODE ?? "nr1dnb";

export interface NowPlayingData {
  station: {
    name: string;
    shortcode: string;
    listen_url: string;
    mounts: Mount[];
  };
  now_playing: {
    song: Song;
    elapsed: number;
    duration: number;
    played_at: number;
  } | null;
  playing_next: {
    song: Song;
  } | null;
  live: {
    is_live: boolean;
    streamer_name: string;
  };
  listeners: {
    current: number;
    unique: number;
  };
  song_history: HistoryEntry[];
  is_online: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  art: string;
  custom_fields: Record<string, string>;
}

export interface HistoryEntry {
  song: Song;
  played_at: number;
}

export interface Mount {
  url: string;
  is_default: boolean;
  name: string;
  format: string;
  bitrate: number;
}

export interface ScheduleEntry {
  id: number;
  type: string;
  name: string;
  title: string;
  description: string;
  start_timestamp: number;
  end_timestamp: number;
  is_now: boolean;
}

// Placeholder/mock data for when AzuraCast isn't configured
const MOCK_NOW_PLAYING: NowPlayingData = {
  station: {
    name: "NR1 DNB Radio",
    shortcode: STATION_SHORTCODE,
    listen_url: `${BASE_URL}/listen/${STATION_SHORTCODE}/radio.mp3`,
    mounts: [
      {
        url: `${BASE_URL}/listen/${STATION_SHORTCODE}/radio.mp3`,
        is_default: true,
        name: "/radio.mp3",
        format: "mp3",
        bitrate: 192,
      },
    ],
  },
  now_playing: null,
  playing_next: null,
  live: { is_live: false, streamer_name: "" },
  listeners: { current: 0, unique: 0 },
  song_history: [],
  is_online: false,
};

async function apiFetch<T>(path: string): Promise<T> {
  const url = `${BASE_URL}/api${path}`;
  const res = await fetch(url, {
    next: { revalidate: 15 },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`AzuraCast API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getNowPlaying(): Promise<NowPlayingData> {
  try {
    return await apiFetch<NowPlayingData>(`/nowplaying/${STATION_ID}`);
  } catch {
    return MOCK_NOW_PLAYING;
  }
}

export async function getTrackHistory(): Promise<HistoryEntry[]> {
  try {
    return await apiFetch<HistoryEntry[]>(`/station/${STATION_ID}/history?rows=10`);
  } catch {
    return [];
  }
}

export async function getSchedule(): Promise<ScheduleEntry[]> {
  try {
    return await apiFetch<ScheduleEntry[]>(`/station/${STATION_ID}/schedule?rows=168`);
  } catch {
    return [];
  }
}

export function getStreamUrl(): string {
  // Use the Edge proxy to avoid mixed-content blocking on HTTPS
  if (typeof window !== "undefined") return "/api/stream";
  return `${BASE_URL}/listen/${STATION_SHORTCODE}/radio.mp3`;
}

export function createSSEConnection(shortcode: string): EventSource | null {
  if (typeof window === "undefined") return null;
  try {
    return new EventSource(`${BASE_URL}/api/live/nowplaying/${shortcode}`);
  } catch {
    return null;
  }
}

export const STATION_SHORTCODE_VALUE = STATION_SHORTCODE;

// Strip AzuraCast internal IDs and station tags from song titles
// e.g. "kaiden 5 hour special [sx0iguhcpa4] nr1" → "kaiden 5 hour special"
export function cleanTitle(title: string): string {
  return title
    .replace(/\s*\[[^\]]+\]/g, "")   // remove [anything]
    .replace(/\s+nr1\s*$/i, "")       // remove trailing "nr1"
    .trim();
}

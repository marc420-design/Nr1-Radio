import type { TracklistEntry } from "@/lib/supabase";

/**
 * Parse a pasted tracklist into an array of TracklistEntry objects.
 * Accepts:
 *   - Raw JSON array — used verbatim (validated)
 *   - Plain text, one track per line, in any of these formats:
 *       "Artist - Title"
 *       "00:00 Artist - Title"
 *       "1. Artist - Title"
 *       "Artist - Title [ISRC:GBXXX2400001]"
 *
 * Empty lines and lines starting with # are ignored.
 */
export function parseTracklist(input: string): TracklistEntry[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  // JSON path
  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed)) throw new Error("Tracklist JSON must be an array");
    return parsed.map((raw, i) => {
      const t = raw as Partial<TracklistEntry>;
      if (typeof t.artist !== "string" || typeof t.title !== "string") {
        throw new Error(`Item ${i}: artist and title are required`);
      }
      return {
        artist: t.artist.trim(),
        title: t.title.trim(),
        ...(t.isrc ? { isrc: String(t.isrc).trim().toUpperCase() } : {}),
        ...(t.start_time_sec != null ? { start_time_sec: Number(t.start_time_sec) } : {}),
        ...(t.duration_sec != null ? { duration_sec: Number(t.duration_sec) } : {}),
      };
    });
  }

  // Plain text path
  const out: TracklistEntry[] = [];
  for (const rawLine of trimmed.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    // Strip leading numbering: "1.", "01)", "1 -"
    line = line.replace(/^\s*\d+\s*[.)-]\s*/, "");

    // Extract optional leading timestamp: "00:00" / "0:00:00"
    let startSec: number | undefined;
    const tsMatch = line.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s+(.*)$/);
    if (tsMatch) {
      const [, a, b, c, rest] = tsMatch;
      if (c) startSec = Number(a) * 3600 + Number(b) * 60 + Number(c);
      else startSec = Number(a) * 60 + Number(b);
      line = rest;
    }

    // Extract optional trailing [ISRC:xxx]
    let isrc: string | undefined;
    const isrcMatch = line.match(/\[ISRC:\s*([A-Z0-9-]+)\s*\]\s*$/i);
    if (isrcMatch) {
      isrc = isrcMatch[1].toUpperCase().replace(/-/g, "");
      line = line.slice(0, isrcMatch.index).trim();
    }

    // Split on " - " (with spaces) to avoid breaking "Artist-Name"
    const sepIdx = line.indexOf(" - ");
    if (sepIdx === -1) {
      // No separator — treat whole line as title with unknown artist
      out.push({
        artist: "Unknown",
        title: line,
        ...(isrc ? { isrc } : {}),
        ...(startSec != null ? { start_time_sec: startSec } : {}),
      });
      continue;
    }
    const artist = line.slice(0, sepIdx).trim();
    const title = line.slice(sepIdx + 3).trim();
    out.push({
      artist,
      title,
      ...(isrc ? { isrc } : {}),
      ...(startSec != null ? { start_time_sec: startSec } : {}),
    });
  }
  return out;
}

/** Serialize a tracklist back to the plain-text format the parser accepts. */
export function stringifyTracklist(entries: TracklistEntry[]): string {
  return entries.map(e => {
    const ts = e.start_time_sec != null ? formatTimestamp(e.start_time_sec) + " " : "";
    const isrc = e.isrc ? ` [ISRC:${e.isrc}]` : "";
    return `${ts}${e.artist} - ${e.title}${isrc}`;
  }).join("\n");
}

function formatTimestamp(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

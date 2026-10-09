import catalogData from "@/data/archive-catalog.json";
import type { ShowRow } from "@/lib/supabase";

interface ArchiveSource {
  mediaId: number;
  recordedDate: string | null;
  publishedAt: string | null;
  youtubeId: string | null;
  title: string;
  lineup: string | null;
  dateKind: string;
  audioUrl?: string;
}
const catalog: Record<string, ArchiveSource> = catalogData;

export function getArchiveSource(show: ShowRow): ArchiveSource | undefined {
  return catalog[show.azuracast_path?.toLowerCase() ?? ""];
}

export function featuredScore(show: Pick<ShowRow, "title" | "lineup">): number {
  const names = `${show.title} ${show.lineup ?? ""}`;
  return [/\brinze\b/i, /\bdna\b/i, /\bso[ -]?low\b/i].filter(pattern => pattern.test(names)).length;
}

export function getArchiveDate(show: ShowRow): { value: string; label: string } | null {
  const source = getArchiveSource(show);
  if (source?.recordedDate) return { value: source.recordedDate, label: "Recorded" };
  if (source?.publishedAt) return { value: source.publishedAt.slice(0, 10), label: "Published" };
  // Audited entries with no source date must not use their import timestamp.
  if (source) return null;
  if (show.uploaded_at && !Number.isNaN(Date.parse(show.uploaded_at))) {
    return { value: show.uploaded_at.slice(0, 10), label: "Published" };
  }
  return null;
}

export function formatArchiveDate(value: string, long = false): string {
  return new Date(value.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-GB", {
    timeZone: "Europe/London", day: "numeric", month: long ? "long" : "short", year: "numeric",
  });
}

export function prepareArchive(shows: ShowRow[]): ShowRow[] {
  const byRecording = new Map<string, ShowRow>();
  function score(show: ShowRow) {
    const source = getArchiveSource(show);
    return (show.bunny_video_id ? 100 : 0) + (show.tracklist?.length ? 20 : 0)
      + (show.azuracast_id === source?.mediaId ? 10 : 0) + (show.youtube_id ? 1 : 0);
  }
  for (const show of shows) {
    const key = show.azuracast_path?.toLowerCase() || show.bunny_video_id || show.youtube_id || show.id;
    const previous = byRecording.get(key);
    if (!previous || score(show) > score(previous)) byRecording.set(key, show);
  }
  return [...byRecording.values()].map(show => {
    const source = getArchiveSource(show);
    return source ? { ...show, title: source.title, lineup: source.lineup } : show;
  }).sort((a, b) => (getArchiveDate(b)?.value ?? "").localeCompare(getArchiveDate(a)?.value ?? "")
    || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
}

export function getArchiveMonth(show: ShowRow): string {
  return getArchiveDate(show)?.value.slice(0, 7) ?? "undated";
}

export function formatArchiveMonth(month: string): string {
  return month === "undated" ? "Date unverified" : new Date(month + "-01T12:00:00Z")
    .toLocaleDateString("en-GB", { timeZone: "Europe/London", month: "long", year: "numeric" });
}

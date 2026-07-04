import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { ShowRow } from "@/lib/supabase";
import { BunnyVideoPlayer } from "@/components/shows/BunnyVideoPlayer";
import { bunnyThumbnailUrl, isBunnyConfigured } from "@/lib/bunny";

export const revalidate = 3600;

async function getShow(id: string): Promise<ShowRow | null> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("shows").select("*").eq("id", id).maybeSingle();
  return (data as unknown as ShowRow) ?? null;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime()) || d.getFullYear() < 2000) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "";
  const rounded = Math.round(minutes);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
}

function formatTrackTime(sec: number | undefined): string {
  if (sec == null) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const show = await getShow(id);
  if (!show) return { title: "Show not found — NR1 DNB Radio" };

  const title = `${show.title} — NR1 DNB Radio`;
  const description =
    show.description ??
    `${show.title}${show.lineup ? ` · ${show.lineup}` : ""} — a drum & bass set from NR1 DNB Radio, Norwich.`;
  const ogImage =
    show.bunny_video_id && isBunnyConfigured()
      ? bunnyThumbnailUrl(show.bunny_video_id)
      : show.youtube_id
        ? `https://img.youtube.com/vi/${show.youtube_id}/maxresdefault.jpg`
        : undefined;

  return {
    title,
    description,
    alternates: { canonical: `https://listen-nr1dnb.com/shows/${id}` },
    openGraph: {
      title,
      description,
      type: "video.other",
      url: `https://listen-nr1dnb.com/shows/${id}`,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ShowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const show = await getShow(id);
  if (!show) notFound();

  const hasBunny = !!show.bunny_video_id && isBunnyConfigured();
  const hasYouTube = !!show.youtube_id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/shows"
        className="inline-flex items-center gap-1 text-xs font-mono text-nr1-muted hover:text-nr1-cyan"
      >
        ← all shows
      </Link>

      <header className="mt-4 mb-8">
        <h1 className="font-heading text-4xl sm:text-5xl text-white tracking-wide">
          {show.title}
        </h1>
        {show.lineup && (
          <p className="font-mono text-sm text-nr1-cyan mt-2">{show.lineup}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-nr1-muted mt-3">
          {show.uploaded_at && <span>{formatDate(show.uploaded_at)}</span>}
          {show.duration_min && (
            <>
              <span>·</span>
              <span>{formatDuration(show.duration_min)}</span>
            </>
          )}
        </div>
      </header>

      {hasBunny ? (
        <BunnyVideoPlayer videoId={show.bunny_video_id!} title={show.title} />
      ) : hasYouTube ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-nr1-black">
          <iframe
            src={`https://www.youtube.com/embed/${show.youtube_id}`}
            title={show.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-nr1-black aspect-video flex items-center justify-center">
          <span className="font-mono text-sm text-nr1-muted">Video not available</span>
        </div>
      )}

      {show.description && (
        <div className="mt-8 max-w-3xl">
          <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
            {show.description}
          </p>
        </div>
      )}

      {show.tracklist && show.tracklist.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-2xl text-white tracking-widest mb-4">TRACKLIST</h2>
          <ol className="divide-y divide-white/10 rounded-xl border border-white/10 bg-nr1-grey/30 overflow-hidden">
            {show.tracklist.map((t, i) => (
              <li key={i} className="flex items-baseline gap-4 px-4 py-3 text-sm">
                <span className="font-mono text-xs text-nr1-muted w-12 shrink-0">
                  {formatTrackTime(t.start_time_sec) || String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-white flex-1 truncate">
                  <span className="text-nr1-cyan">{t.artist}</span>
                  <span className="text-nr1-muted"> — </span>
                  {t.title}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

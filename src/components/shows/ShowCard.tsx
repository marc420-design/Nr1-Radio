import type { ShowRow } from "@/lib/supabase";

interface ShowCardProps {
  show: ShowRow;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
}

export function ShowCard({ show }: ShowCardProps) {
  const youtubeUrl = show.youtube_id
    ? `https://www.youtube.com/watch?v=${show.youtube_id}`
    : null;

  const thumbnailUrl = show.youtube_id
    ? `https://img.youtube.com/vi/${show.youtube_id}/mqdefault.jpg`
    : null;

  return (
    <div className="rounded-xl border border-white/10 bg-nr1-grey/40 overflow-hidden hover:border-nr1-cyan/30 transition-colors group">
      {/* Thumbnail */}
      {thumbnailUrl ? (
        <a
          href={youtubeUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-video bg-nr1-black overflow-hidden"
          aria-label={`Watch ${show.title} on YouTube`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={show.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-nr1-cyan/90 flex items-center justify-center">
              <svg className="w-5 h-5 text-nr1-black ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </a>
      ) : (
        <div className="aspect-video bg-nr1-black flex items-center justify-center">
          <span className="font-heading text-4xl text-nr1-cyan/20 tracking-widest">NR1</span>
        </div>
      )}

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-heading text-lg text-white tracking-wide leading-tight line-clamp-2">
          {show.title}
        </h3>

        {show.lineup && (
          <p className="font-mono text-xs text-nr1-cyan truncate">{show.lineup}</p>
        )}

        <div className="flex items-center gap-3 text-xs font-mono text-nr1-muted">
          <span>{formatDate(show.uploaded_at)}</span>
          {show.duration_min && (
            <>
              <span>·</span>
              <span>{formatDuration(show.duration_min)}</span>
            </>
          )}
        </div>

        {youtubeUrl && (
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-nr1-muted hover:text-nr1-cyan transition-colors mt-1"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
            Watch on YouTube
          </a>
        )}
      </div>
    </div>
  );
}

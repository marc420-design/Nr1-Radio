"use client";

import Image from "next/image";
import Link from "next/link";
import type { ShowRow } from "@/lib/supabase";
import { bunnyThumbnailUrl, isBunnyConfigured } from "@/lib/bunny";

interface ShowCardProps {
  show: ShowRow;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime()) || d.getFullYear() < 2000) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "";
  const rounded = Math.round(minutes);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
}

function resolveThumbnail(show: ShowRow): string | null {
  if (show.bunny_video_id && isBunnyConfigured()) return bunnyThumbnailUrl(show.bunny_video_id);
  if (show.youtube_id) return `https://img.youtube.com/vi/${show.youtube_id}/mqdefault.jpg`;
  return null;
}

export function ShowCard({ show }: ShowCardProps) {
  const href = `/shows/${show.id}`;
  const thumbnailUrl = resolveThumbnail(show);

  return (
    <div className="rounded-xl border border-white/10 bg-nr1-grey/40 overflow-hidden hover:border-nr1-cyan/30 transition-colors group">
      {thumbnailUrl ? (
        <Link
          href={href}
          className="block relative aspect-video bg-nr1-black overflow-hidden"
          aria-label={`Watch ${show.title}`}
        >
          <span className="absolute inset-0 flex items-center justify-center font-heading text-4xl text-nr1-cyan/20 tracking-widest pointer-events-none">
            NR1
          </span>
          <Image
            src={thumbnailUrl}
            alt={show.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = "0";
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-nr1-cyan/90 flex items-center justify-center">
              <svg className="w-5 h-5 text-nr1-black ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </Link>
      ) : (
        <Link href={href} className="block aspect-video bg-nr1-black flex items-center justify-center">
          <span className="font-heading text-4xl text-nr1-cyan/20 tracking-widest">NR1</span>
        </Link>
      )}

      <div className="p-4 space-y-2">
        <Link href={href} className="block">
          <h3 className="font-heading text-lg text-white tracking-wide leading-tight line-clamp-2 group-hover:text-nr1-cyan transition-colors">
            {show.title}
          </h3>
        </Link>

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
      </div>
    </div>
  );
}

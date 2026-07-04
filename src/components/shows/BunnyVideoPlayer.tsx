"use client";

import { bunnyEmbedUrl } from "@/lib/bunny";

interface BunnyVideoPlayerProps {
  videoId: string;
  title: string;
}

export function BunnyVideoPlayer({ videoId, title }: BunnyVideoPlayerProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-nr1-black">
      <iframe
        src={bunnyEmbedUrl(videoId)}
        title={title}
        loading="lazy"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}

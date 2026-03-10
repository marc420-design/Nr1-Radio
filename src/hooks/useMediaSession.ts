"use client";

import { useEffect } from "react";

interface MediaSessionProps {
  track: string;
  artist: string;
  artwork: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export function useMediaSession({ track, artist, artwork, isPlaying, onPlay, onPause }: MediaSessionProps) {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track || "NR1 DNB Radio",
      artist: artist || "Live Stream",
      album: "NR1 DNB Radio",
      artwork: artwork
        ? [{ src: artwork, sizes: "512x512", type: "image/jpeg" }]
        : [{ src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }],
    });
  }, [track, artist, artwork]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    navigator.mediaSession.setActionHandler("play", onPlay);
    navigator.mediaSession.setActionHandler("pause", onPause);
    navigator.mediaSession.setActionHandler("stop", onPause);

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("stop", null);
    };
  }, [isPlaying, onPlay, onPause]);
}

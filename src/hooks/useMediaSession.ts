"use client";

import { useEffect } from "react";

interface UseMediaSessionProps {
  track: string;
  artist: string;
  artwork: string;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

/**
 * Hook to integrate with the Media Session API for lock screen controls.
 * Updates metadata when track changes and handles play/pause actions from
 * system media controls (lock screen, notification center, headphone buttons).
 */
export function useMediaSession({
  track,
  artist,
  artwork,
  isPlaying,
  onPlay,
  onPause,
}: UseMediaSessionProps) {
  useEffect(() => {
    // Media Session API is only available in browsers
    if (typeof window === "undefined" || !("mediaSession" in navigator)) {
      return;
    }

    // Update metadata whenever track info changes
    if (track || artist) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track || "NR1 DNB Radio",
        artist: artist || "Live Stream",
        album: "NR1 Drum & Bass Radio",
        artwork: [
          {
            src: artwork || "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: artwork || "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
    }

    // Set up action handlers for media controls
    navigator.mediaSession.setActionHandler("play", () => {
      onPlay();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      onPause();
    });

    // Update playback state
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

    // Cleanup: reset handlers when component unmounts
    return () => {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      }
    };
  }, [track, artist, artwork, isPlaying, onPlay, onPause]);
}

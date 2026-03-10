"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getStreamUrl } from "@/lib/azuracast";

export type StreamStatus = "idle" | "loading" | "playing" | "reconnecting" | "offline";

interface UseAudioStreamReturn {
  play: () => void;
  pause: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  status: StreamStatus;
}

const BACKOFF_DELAYS = [3000, 6000, 12000, 30000]; // ms

export function useAudioStream(): UseAudioStreamReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIntentionalPauseRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [status, setStatus] = useState<StreamStatus>("idle");

  // Initialise Audio element once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = 0.8;
    audioRef.current = audio;

    const onPlaying = () => {
      retryCountRef.current = 0;
      setStatus("playing");
      setIsPlaying(true);
    };
    const onWaiting = () => {
      if (!isIntentionalPauseRef.current) setStatus("loading");
    };
    const onError = () => {
      if (isIntentionalPauseRef.current) return;
      scheduleRetry();
    };
    const onPause = () => {
      if (isIntentionalPauseRef.current) {
        setStatus("idle");
        setIsPlaying(false);
      }
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("pause", onPause);
      audio.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scheduleRetry() {
    const delay = BACKOFF_DELAYS[Math.min(retryCountRef.current, BACKOFF_DELAYS.length - 1)];
    retryCountRef.current++;
    setStatus(retryCountRef.current >= 2 ? "offline" : "reconnecting");

    retryTimerRef.current = setTimeout(() => {
      if (isIntentionalPauseRef.current) return;
      setStatus("reconnecting");
      const audio = audioRef.current;
      if (!audio) return;
      // Force reload by appending cache-bust
      audio.src = `${getStreamUrl()}?_t=${Date.now()}`;
      audio.load();
      audio.play().catch(() => scheduleRetry());
    }, delay);
  }

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isIntentionalPauseRef.current = false;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryCountRef.current = 0;
    setStatus("loading");
    audio.src = `${getStreamUrl()}?_t=${Date.now()}`;
    audio.load();
    audio.play().catch(() => scheduleRetry());
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isIntentionalPauseRef.current = true;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    audio.pause();
    audio.src = "";
    setIsPlaying(false);
    setStatus("idle");
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      audioRef.current.muted = clamped === 0;
      setIsMuted(clamped === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !audio.muted;
    audio.muted = next;
    setIsMuted(next);
  }, []);

  return { play, pause, setVolume, toggleMute, isPlaying, isMuted, volume, status };
}

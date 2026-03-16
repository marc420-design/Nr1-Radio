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

const BACKOFF_DELAYS = [2000, 4000, 8000, 15000, 30000]; // ms
const WATCHDOG_MS = 15000;     // reconnect if stuck in "waiting" for 15s
const BUFFER_CHECK_MS = 10000; // check buffer every 10s
const MAX_BUFFER_AHEAD = 30;   // reconnect if buffered > 30s ahead of current time

export function useAudioStream(): UseAudioStreamReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bufferCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isIntentionalPauseRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [status, setStatus] = useState<StreamStatus>("idle");

  // ── helpers ────────────────────────────────────────────────────────────────

  function clearWatchdog() {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }

  function clearBufferCheck() {
    if (bufferCheckRef.current) {
      clearInterval(bufferCheckRef.current);
      bufferCheckRef.current = null;
    }
  }

  function hardReconnect() {
    if (isIntentionalPauseRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;
    const vol = audio.volume;
    const muted = audio.muted;
    audio.src = `${getStreamUrl()}?_t=${Date.now()}`;
    audio.volume = vol;
    audio.muted = muted;
    audio.load();
    audio.play().catch(() => scheduleRetry());
  }

  function scheduleRetry() {
    if (isIntentionalPauseRef.current) return;
    clearBufferCheck();
    const delay = BACKOFF_DELAYS[Math.min(retryCountRef.current, BACKOFF_DELAYS.length - 1)];
    retryCountRef.current++;
    setStatus(retryCountRef.current >= 4 ? "offline" : "reconnecting");

    retryTimerRef.current = setTimeout(() => {
      if (isIntentionalPauseRef.current) return;
      setStatus("reconnecting");
      hardReconnect();
    }, delay);
  }

  function startBufferCheck() {
    clearBufferCheck();
    bufferCheckRef.current = setInterval(() => {
      const audio = audioRef.current;
      if (!audio || isIntentionalPauseRef.current || audio.paused) return;

      // Flush buffer if it's grown too far ahead — this is the main 6-min fix
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const bufferedAhead = bufferedEnd - audio.currentTime;
        if (bufferedAhead > MAX_BUFFER_AHEAD) {
          hardReconnect();
        }
      }
    }, BUFFER_CHECK_MS);
  }

  // ── audio element setup ────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = 0.8;
    audioRef.current = audio;

    const armWatchdog = () => {
      clearWatchdog();
      watchdogRef.current = setTimeout(() => {
        if (!isIntentionalPauseRef.current && audioRef.current) {
          scheduleRetry();
        }
      }, WATCHDOG_MS);
    };

    const onPlaying = () => {
      clearWatchdog();
      retryCountRef.current = 0;
      setStatus("playing");
      setIsPlaying(true);
      startBufferCheck();
    };
    const onWaiting = () => {
      if (!isIntentionalPauseRef.current) {
        setStatus("loading");
        armWatchdog();
      }
    };
    const onError = () => {
      if (isIntentionalPauseRef.current) return;
      scheduleRetry();
    };
    const onPause = () => {
      if (isIntentionalPauseRef.current) {
        setStatus("idle");
        setIsPlaying(false);
      } else {
        scheduleRetry();
      }
    };
    const onStalled = () => {
      if (!isIntentionalPauseRef.current) scheduleRetry();
    };
    const onEnded = () => {
      if (!isIntentionalPauseRef.current) scheduleRetry();
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("stalled", onStalled);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("stalled", onStalled);
      audio.removeEventListener("ended", onEnded);
      clearWatchdog();
      clearBufferCheck();
      audio.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── public API ─────────────────────────────────────────────────────────────

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isIntentionalPauseRef.current = true;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    clearWatchdog();
    clearBufferCheck();
    audio.pause();
    audio.src = "";
    setIsPlaying(false);
    setStatus("idle");
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!next && audio.volume === 0) {
      audio.volume = 0.8;
      setVolumeState(0.8);
    }
    setIsMuted(next);
  }, []);

  return { play, pause, setVolume, toggleMute, isPlaying, isMuted, volume, status };
}

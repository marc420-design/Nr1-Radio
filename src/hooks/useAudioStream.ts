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
const MAX_BUFFER_AHEAD = 30;   // reconnect if buffered > 30s ahead of playback

export function useAudioStream(): UseAudioStreamReturn {
  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchdogRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bufferCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isIntentionalPauseRef = useRef(false);

  // Store reconnect/retry fn in a ref so intervals/timeouts always call
  // the latest version and never hold a stale closure.
  const scheduleRetryRef = useRef<() => void>(() => {});

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted,   setIsMuted]   = useState(false);
  const [volume,    setVolumeState] = useState(0.8);
  const [status,    setStatus]    = useState<StreamStatus>("idle");

  // Keep a stable ref to status setter so effect closures can call it
  const setStatusRef = useRef(setStatus);
  setStatusRef.current = setStatus;
  const setIsPlayingRef = useRef(setIsPlaying);
  setIsPlayingRef.current = setIsPlaying;

  // ── Build scheduleRetry (refreshed each render so it never goes stale) ────
  useEffect(() => {
    function clearWatchdog() {
      if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
    }
    function clearBufferCheck() {
      if (bufferCheckRef.current) { clearInterval(bufferCheckRef.current); bufferCheckRef.current = null; }
    }

    function hardReconnect() {
      if (isIntentionalPauseRef.current) return;
      const audio = audioRef.current;
      if (!audio) return;
      const vol   = audio.volume;
      const muted = audio.muted;
      audio.src    = `${getStreamUrl()}?_t=${Date.now()}`;
      audio.volume = vol;
      audio.muted  = muted;
      audio.load();
      audio.play().catch(() => scheduleRetryRef.current());
    }

    function startBufferCheck() {
      clearBufferCheck();
      bufferCheckRef.current = setInterval(() => {
        const audio = audioRef.current;
        if (!audio || isIntentionalPauseRef.current || audio.paused) return;
        if (audio.buffered.length > 0) {
          const ahead = audio.buffered.end(audio.buffered.length - 1) - audio.currentTime;
          if (ahead > MAX_BUFFER_AHEAD) {
            hardReconnect();
          }
        }
      }, BUFFER_CHECK_MS);
    }

    function scheduleRetry() {
      if (isIntentionalPauseRef.current) return;
      clearBufferCheck();
      const delay = BACKOFF_DELAYS[Math.min(retryCountRef.current, BACKOFF_DELAYS.length - 1)];
      retryCountRef.current++;
      setStatusRef.current(retryCountRef.current >= 4 ? "offline" : "reconnecting");

      retryTimerRef.current = setTimeout(() => {
        if (isIntentionalPauseRef.current) return;
        setStatusRef.current("reconnecting");
        hardReconnect();
      }, delay);
    }

    // Always point the ref at the freshest version
    scheduleRetryRef.current = scheduleRetry;

    // ── Audio element is created once on first render ────────────────────
    if (audioRef.current) return; // already initialised

    const audio = new Audio();
    audio.preload = "none";
    audio.volume  = 0.8;
    audioRef.current = audio;

    const armWatchdog = () => {
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      watchdogRef.current = setTimeout(() => {
        if (!isIntentionalPauseRef.current) scheduleRetryRef.current();
      }, WATCHDOG_MS);
    };

    audio.addEventListener("playing", () => {
      clearWatchdog();
      retryCountRef.current = 0;
      setStatusRef.current("playing");
      setIsPlayingRef.current(true);
      startBufferCheck();
    });
    audio.addEventListener("waiting", () => {
      if (!isIntentionalPauseRef.current) {
        setStatusRef.current("loading");
        armWatchdog();
      }
    });
    audio.addEventListener("error", () => {
      if (!isIntentionalPauseRef.current) scheduleRetryRef.current();
    });
    audio.addEventListener("pause", () => {
      if (isIntentionalPauseRef.current) {
        setStatusRef.current("idle");
        setIsPlayingRef.current(false);
      } else {
        scheduleRetryRef.current();
      }
    });
    audio.addEventListener("stalled", () => {
      if (!isIntentionalPauseRef.current) scheduleRetryRef.current();
    });
    audio.addEventListener("ended", () => {
      if (!isIntentionalPauseRef.current) scheduleRetryRef.current();
    });

    return () => {
      clearWatchdog();
      clearBufferCheck();
      audio.pause();
      audioRef.current = null;
    };
  }); // no deps — runs every render to keep scheduleRetryRef fresh

  // ── Public API ─────────────────────────────────────────────────────────────

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isIntentionalPauseRef.current = false;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryCountRef.current = 0;
    setStatus("loading");
    audio.src = `${getStreamUrl()}?_t=${Date.now()}`;
    audio.load();
    audio.play().catch(() => scheduleRetryRef.current());
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isIntentionalPauseRef.current = true;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    if (watchdogRef.current)   clearTimeout(watchdogRef.current);
    if (bufferCheckRef.current) clearInterval(bufferCheckRef.current);
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
      audioRef.current.muted  = clamped === 0;
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

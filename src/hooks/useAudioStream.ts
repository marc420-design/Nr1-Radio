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
const WATCHDOG_MS    = 15000; // reconnect if stuck in waiting/stalled/paused for 15s
const BUFFER_CHECK_MS = 10000;
const MAX_BUFFER_AHEAD = 30;  // reconnect if buffered >30s ahead

export function useAudioStream(): UseAudioStreamReturn {
  const audioRef              = useRef<HTMLAudioElement | null>(null);
  const retryCountRef         = useRef(0);
  const retryTimerRef         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchdogRef           = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bufferCheckRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const isIntentionalPauseRef = useRef(false);
  // true while load()+play() is in flight — suppresses the pause event that
  // audio.load() fires internally so it doesn't stack extra retry timers.
  const isReconnectingRef     = useRef(false);

  // Stable fn-refs — event handlers and intervals always call through these
  // so they never hold stale closures.
  const hardReconnectRef  = useRef<() => void>(() => {});
  const scheduleRetryRef  = useRef<() => void>(() => {});

  const [isPlaying,   setIsPlaying]   = useState(false);
  const [isMuted,     setIsMuted]     = useState(false);
  const [volume,      setVolumeState] = useState(0.8);
  const [status,      setStatus]      = useState<StreamStatus>("idle");

  const setStatusRef    = useRef(setStatus);
  const setIsPlayingRef = useRef(setIsPlaying);
  setStatusRef.current    = setStatus;
  setIsPlayingRef.current = setIsPlaying;

  // ── Effect 1: refresh fn-refs every render ────────────────────────────────
  // No cleanup → never tears down audio. All state is in refs so functions
  // are correct even though they're defined each render.
  useEffect(() => {
    function clearWatchdog() {
      if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
    }
    function clearBufferCheck() {
      if (bufferCheckRef.current) { clearInterval(bufferCheckRef.current); bufferCheckRef.current = null; }
    }
    function clearRetryTimer() {
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
    }

    function hardReconnect() {
      if (isIntentionalPauseRef.current) return;
      const audio = audioRef.current;
      if (!audio) return;
      clearRetryTimer();
      const vol   = audio.volume;
      const muted = audio.muted;
      // Flag stays true until "playing" fires (or play() rejects)
      // — suppresses the pause event that audio.load() fires internally.
      isReconnectingRef.current = true;
      audio.src    = `${getStreamUrl()}?_t=${Date.now()}`;
      audio.volume = vol;
      audio.muted  = muted;
      audio.load();
      audio.play().catch(() => {
        isReconnectingRef.current = false;
        scheduleRetryRef.current();
      });
    }

    function scheduleRetry() {
      if (isIntentionalPauseRef.current) return;
      clearBufferCheck();
      clearRetryTimer();
      const delay = BACKOFF_DELAYS[Math.min(retryCountRef.current, BACKOFF_DELAYS.length - 1)];
      retryCountRef.current++;
      setStatusRef.current(retryCountRef.current >= 4 ? "offline" : "reconnecting");
      retryTimerRef.current = setTimeout(() => {
        if (isIntentionalPauseRef.current) return;
        setStatusRef.current("reconnecting");
        hardReconnectRef.current();
      }, delay);
    }

    hardReconnectRef.current = hardReconnect;
    scheduleRetryRef.current = scheduleRetry;
  }); // no deps — cheap ref update, no audio teardown

  // ── Effect 2: create Audio element once, destroy only on unmount ──────────
  useEffect(() => {
    function clearWatchdog() {
      if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null; }
    }
    function clearBufferCheck() {
      if (bufferCheckRef.current) { clearInterval(bufferCheckRef.current); bufferCheckRef.current = null; }
    }
    function clearRetryTimer() {
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null; }
    }

    const armWatchdog = () => {
      clearWatchdog();
      watchdogRef.current = setTimeout(() => {
        if (!isIntentionalPauseRef.current) scheduleRetryRef.current();
      }, WATCHDOG_MS);
    };

    const startBufferCheck = () => {
      clearBufferCheck();
      bufferCheckRef.current = setInterval(() => {
        const audio = audioRef.current;
        if (!audio || isIntentionalPauseRef.current || audio.paused) return;
        if (audio.buffered.length > 0) {
          const ahead = audio.buffered.end(audio.buffered.length - 1) - audio.currentTime;
          if (ahead > MAX_BUFFER_AHEAD) hardReconnectRef.current();
        }
      }, BUFFER_CHECK_MS);
    };

    const audio = new Audio();
    audio.preload = "none";
    audio.volume  = 0.8;
    audioRef.current = audio;

    audio.addEventListener("playing", () => {
      isReconnectingRef.current = false; // load()+play() completed
      clearWatchdog();
      clearRetryTimer(); // cancel any pending retry — we're live
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

    audio.addEventListener("stalled", () => {
      // stalled fires often during normal buffering — use watchdog delay,
      // not an immediate reconnect, so we don't thrash during brief hiccups.
      if (!isIntentionalPauseRef.current) armWatchdog();
    });

    audio.addEventListener("error", () => {
      isReconnectingRef.current = false;
      if (!isIntentionalPauseRef.current) scheduleRetryRef.current();
    });

    audio.addEventListener("ended", () => {
      isReconnectingRef.current = false;
      if (!isIntentionalPauseRef.current) scheduleRetryRef.current();
    });

    audio.addEventListener("pause", () => {
      // Ignore the pause event that audio.load() fires during a reconnect.
      if (isReconnectingRef.current) return;
      if (isIntentionalPauseRef.current) {
        setStatusRef.current("idle");
        setIsPlayingRef.current(false);
      } else {
        // Unexpected pause (OS interruption, tab suspended, network blip).
        // Arm watchdog rather than immediately reconnecting — the browser
        // often resumes on its own (e.g. iOS after a notification).
        setStatusRef.current("loading");
        armWatchdog();
      }
    });

    // Reconnect when network comes back after going offline
    const handleOnline = () => {
      if (!isIntentionalPauseRef.current && audioRef.current?.paused) {
        retryCountRef.current = 0; // reset backoff after a real outage
        scheduleRetryRef.current();
      }
    };
    window.addEventListener("online", handleOnline);

    // When the user switches back to this tab, verify the stream is alive
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (isIntentionalPauseRef.current) return;
      const a = audioRef.current;
      if (!a) return;
      if (a.paused || a.readyState < 2) {
        retryCountRef.current = 0; // fresh backoff after tab resume
        scheduleRetryRef.current();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      // Only runs on unmount — NOT on re-renders
      clearWatchdog();
      clearBufferCheck();
      clearRetryTimer();
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      audio.pause();
      audioRef.current = null;
    };
  }, []); // empty deps: runs once on mount

  // ── Public API ──────────────────────────────────────────────────────────────

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isIntentionalPauseRef.current = false;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryCountRef.current = 0;
    setStatus("loading");
    isReconnectingRef.current = true;
    audio.src = `${getStreamUrl()}?_t=${Date.now()}`;
    audio.load();
    audio.play().catch(() => {
      isReconnectingRef.current = false;
      scheduleRetryRef.current();
    });
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    isIntentionalPauseRef.current = true;
    isReconnectingRef.current     = false;
    if (retryTimerRef.current)  clearTimeout(retryTimerRef.current);
    if (watchdogRef.current)    clearTimeout(watchdogRef.current);
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

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useAudioStream } from "../useAudioStream";

// Mock Audio API
let audio: MockAudio;
class MockAudio extends EventTarget {
  src = "";
  volume = 0.8;
  muted = false;
  paused = true;
  preload = "none";
  currentTime = 0;
  buffered = { length: 0 };

  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  load = vi.fn();
}

describe("useAudioStream", () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Mock global Audio constructor
    vi.stubGlobal("Audio", vi.fn(function () {
      audio = new MockAudio();
      return audio;
    }));
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("should initialize with idle status", () => {
    const { result } = renderHook(() => useAudioStream());

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.status).toBe("idle");
    expect(result.current.volume).toBe(0.8);
    expect(result.current.isMuted).toBe(false);
  });

  it("should provide play and pause functions", () => {
    const { result } = renderHook(() => useAudioStream());

    expect(typeof result.current.play).toBe("function");
    expect(typeof result.current.pause).toBe("function");
  });

  it("should provide volume control functions", () => {
    const { result } = renderHook(() => useAudioStream());

    expect(typeof result.current.setVolume).toBe("function");
    expect(typeof result.current.toggleMute).toBe("function");
  });

  it("should update volume when setVolume is called", () => {
    const { result } = renderHook(() => useAudioStream());

    act(() => {
      result.current.setVolume(0.5);
    });

    expect(result.current.volume).toBe(0.5);
  });

  it("should toggle mute state", () => {
    const { result } = renderHook(() => useAudioStream());

    expect(result.current.isMuted).toBe(false);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(false);
  });

  it("falls back when the direct connection hangs without browser events", async () => {
    const { result } = renderHook(() => useAudioStream());
    act(() => result.current.play());
    expect(audio.src).not.toContain("/api/stream");
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(audio.src).toMatch(/^\/api\/stream\?_t=/);
    expect(audio.play).toHaveBeenCalledTimes(2);
    act(() => audio.dispatchEvent(new Event("playing")));
    expect(result.current.status).toBe("playing");
  });

  it("uses one retry when error and rejected play report the same failure", async () => {
    const { result } = renderHook(() => useAudioStream());
    audio.play.mockRejectedValueOnce(new DOMException("Network failed", "NotSupportedError"));
    await act(async () => {
      result.current.play();
      audio.dispatchEvent(new Event("error"));
    });
    await act(async () => { await vi.advanceTimersByTimeAsync(2_000); });
    expect(audio.src).toMatch(/^\/api\/stream\?_t=/);
    expect(audio.play).toHaveBeenCalledTimes(2);
  });

  it("reconnects through the proxy after a proxy stream ends", async () => {
    const { result } = renderHook(() => useAudioStream());
    act(() => {
      result.current.play();
      audio.dispatchEvent(new Event("error"));
    });
    await act(async () => { await vi.advanceTimersByTimeAsync(2_000); });
    act(() => {
      audio.dispatchEvent(new Event("playing"));
      audio.dispatchEvent(new Event("ended"));
    });
    await act(async () => { await vi.advanceTimersByTimeAsync(2_000); });
    expect(audio.src).toMatch(/^\/api\/stream\?_t=/);
    expect(audio.play).toHaveBeenCalledTimes(3);
  });

  it("does not reconnect after the listener pauses", async () => {
    const { result } = renderHook(() => useAudioStream());
    act(() => result.current.play());
    act(() => result.current.pause());
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(audio.play).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("idle");
  });

  it("does not autoplay when an idle tab becomes visible or online", async () => {
    renderHook(() => useAudioStream());
    act(() => {
      window.dispatchEvent(new Event("online"));
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(audio.play).not.toHaveBeenCalled();
  });

  it("returns to a tappable idle state when mobile autoplay is blocked", async () => {
    const { result } = renderHook(() => useAudioStream());
    audio.play.mockRejectedValueOnce(new DOMException("Tap required", "NotAllowedError"));
    await act(async () => result.current.play());
    expect(result.current.status).toBe("idle");
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(audio.play).toHaveBeenCalledTimes(1);
  });
});

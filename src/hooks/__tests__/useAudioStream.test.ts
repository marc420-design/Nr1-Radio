import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioStream } from "../useAudioStream";

// Mock Audio API
class MockAudio {
  src = "";
  volume = 0.8;
  muted = false;
  paused = true;
  preload = "none";
  
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  load = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}

describe("useAudioStream", () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock global Audio constructor
    global.Audio = MockAudio as any;
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
});

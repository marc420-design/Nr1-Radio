import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMediaSession } from "../useMediaSession";

describe("useMediaSession", () => {
  const mockMetadata = {
    track: "Test Track",
    artist: "Test Artist",
    artwork: "https://example.com/art.jpg",
    isPlaying: false,
    onPlay: vi.fn(),
    onPause: vi.fn(),
  };

  beforeEach(() => {
    // Mock MediaSession API
    global.navigator.mediaSession = {
      metadata: null,
      playbackState: "none",
      setActionHandler: vi.fn(),
    } as any;
  });

  it("should set metadata when track info is provided", () => {
    renderHook(() => useMediaSession(mockMetadata));
    
    expect(global.navigator.mediaSession.metadata).toBeTruthy();
  });

  it("should register play and pause action handlers", () => {
    renderHook(() => useMediaSession(mockMetadata));
    
    expect(global.navigator.mediaSession.setActionHandler).toHaveBeenCalledWith("play", expect.any(Function));
    expect(global.navigator.mediaSession.setActionHandler).toHaveBeenCalledWith("pause", expect.any(Function));
  });

  it("should update playback state based on isPlaying", () => {
    const { rerender } = renderHook(
      ({ isPlaying }) => useMediaSession({ ...mockMetadata, isPlaying }),
      { initialProps: { isPlaying: false } }
    );
    
    expect(global.navigator.mediaSession.playbackState).toBe("paused");
    
    rerender({ isPlaying: true });
    
    expect(global.navigator.mediaSession.playbackState).toBe("playing");
  });

  it("should handle missing MediaSession API gracefully", () => {
    // Remove MediaSession API
    const originalMediaSession = global.navigator.mediaSession;
    delete (global.navigator as any).mediaSession;
    
    // Should not throw
    expect(() => {
      renderHook(() => useMediaSession(mockMetadata));
    }).not.toThrow();
    
    // Restore
    global.navigator.mediaSession = originalMediaSession;
  });
});

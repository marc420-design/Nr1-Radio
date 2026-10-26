import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useNowPlaying } from "../useNowPlaying";
import { useListenerStats } from "../useListenerStats";

let visibility: DocumentVisibilityState;
const fetchMock = vi.fn();

function setVisibility(value: DocumentVisibilityState) {
  visibility = value;
  document.dispatchEvent(new Event("visibilitychange"));
}

beforeEach(() => {
  vi.useFakeTimers();
  visibility = "visible";
  vi.spyOn(document, "visibilityState", "get").mockImplementation(() => visibility);
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset().mockResolvedValue({
    ok: true,
    json: async () => ({ live: { is_live: true }, total: 1, byCountry: [], byCity: [] }),
  });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("now-playing polling", () => {
  it("pauses an idle hidden tab and refreshes immediately on return", async () => {
    renderHook(() => useNowPlaying());
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    act(() => setVisibility("hidden"));
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => setVisibility("visible"));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps background playback metadata updating and stops when paused", async () => {
    visibility = "hidden";
    const { rerender } = renderHook(({ playing }) => useNowPlaying(playing), {
      initialProps: { playing: true },
    });
    await act(async () => { await vi.advanceTimersByTimeAsync(15_000); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    rerender({ playing: false });
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("marks a failed live feed stale instead of keeping a fresh LIVE claim", async () => {
    const { result } = renderHook(() => useNowPlaying());
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(result.current.isStale).toBe(false);
    fetchMock.mockRejectedValue(new Error("offline"));
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(result.current.isStale).toBe(true);
  });

  it("removes polling and visibility listeners on unmount", async () => {
    const { unmount } = renderHook(() => useNowPlaying());
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    unmount();
    act(() => setVisibility("visible"));
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("listener totals polling", () => {
  it("skips hidden tabs, resumes immediately and cleans up on unmount", async () => {
    visibility = "hidden";
    const { unmount } = renderHook(() => useListenerStats());
    await act(async () => { await vi.advanceTimersByTimeAsync(120_000); });
    expect(fetchMock).not.toHaveBeenCalled();
    await act(async () => setVisibility("visible"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    unmount();
    act(() => setVisibility("visible"));
    await act(async () => { await vi.advanceTimersByTimeAsync(60_000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

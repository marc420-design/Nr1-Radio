// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

beforeEach(() => vi.stubEnv("AZURACAST_API_KEY", "test-only-key"));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("listener totals CDN cache", () => {
  it("caches only public aggregates rather than individual listener records", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify([
      { ip: "192.0.2.1", location: { country: "GB", city: "London" } },
    ]))));
    const response = await GET();
    expect(await response.json()).toEqual({
      total: 1,
      byCountry: [{ country: "United Kingdom", count: 1, code: "GB" }],
      byCity: [{ city: "London", country: "United Kingdom", count: 1 }],
    });
    expect(response.headers.get("Vercel-CDN-Cache-Control")).toBe("public, s-maxage=30");
  });

  it("does not cache upstream failures as zero listeners", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.has("Vercel-CDN-Cache-Control")).toBe(false);
  });

  it("does not cache a missing API key as a valid aggregate", async () => {
    vi.stubEnv("AZURACAST_API_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const response = await GET();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.headers.has("Vercel-CDN-Cache-Control")).toBe(false);
  });
});

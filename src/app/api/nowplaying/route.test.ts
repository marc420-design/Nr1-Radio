// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

afterEach(() => vi.unstubAllGlobals());

describe("now-playing CDN cache", () => {
  it("shares successful station snapshots briefly without storing them in browsers", async () => {
    const data = { live: { is_live: true } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(data))));
    const response = await GET();
    expect(await response.json()).toEqual(data);
    expect(response.headers.get("Vercel-CDN-Cache-Control")).toBe("public, s-maxage=5");
    expect(response.headers.get("Cache-Control")).toContain("max-age=0");
  });

  it.each(["upstream error", "unreachable"])("does not cache %s responses", async (failure) => {
    vi.stubGlobal("fetch", failure === "unreachable"
      ? vi.fn().mockRejectedValue(new Error("offline"))
      : vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.has("Vercel-CDN-Cache-Control")).toBe(false);
  });
});

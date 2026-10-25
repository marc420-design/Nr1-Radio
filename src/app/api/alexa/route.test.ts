// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

const verification = vi.hoisted(() => ({ signature: vi.fn(), timestamp: vi.fn() }));
vi.mock("ask-sdk-express-adapter", () => ({
  SkillRequestSignatureVerifier: class { verify = verification.signature; },
  TimestampVerifier: class { verify = verification.timestamp; },
}));

const publishedId = "amzn1.ask.skill.97e23285-61d2-4aad-87e0-b943035c5472";
const familyId = "amzn1.ask.skill.e0dcb259-d5eb-41af-8fb3-9518f00e1b67";

function launch(applicationId?: string, sessionOnly = false) {
  const application = applicationId ? { applicationId } : {};
  return new Request("https://listen-nr1dnb.com/api/alexa", {
    method: "POST",
    body: JSON.stringify({
      version: "1.0",
      session: { new: true, sessionId: "test-session", application, user: { userId: "test-user" }, attributes: {} },
      context: { System: { application: sessionOnly ? undefined : application, user: { userId: "test-user" }, device: { deviceId: "test-device", supportedInterfaces: { AudioPlayer: {} } } } },
      request: { type: "LaunchRequest", requestId: "test-request", timestamp: new Date().toISOString(), locale: "en-GB" },
    }),
  });
}

beforeEach(() => {
  vi.resetModules();
  verification.signature.mockReset().mockResolvedValue(undefined);
  verification.timestamp.mockReset().mockResolvedValue(undefined);
  vi.stubEnv("ALEXA_SKILL_ID", publishedId);
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("Alexa station endpoint authorization", () => {
  it.each([publishedId, familyId])("launches the station for authorized skill %s", async (id) => {
    const { POST } = await import("./route");
    const response = await POST(launch(id));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.response.directives).toContainEqual(expect.objectContaining({
      type: "AudioPlayer.Play",
      audioItem: expect.objectContaining({ stream: expect.objectContaining({ url: "https://radio.listen-nr1dnb.com/listen/nr1_dnb_radio/radio.mp3" }) }),
    }));
    expect(verification.signature).toHaveBeenCalledOnce();
    expect(verification.timestamp).toHaveBeenCalledOnce();
  });
  it.each(["amzn1.ask.skill.unrelated", undefined])("rejects unauthorized or missing skill ID %s", async (id) => {
    const { POST } = await import("./route");
    const response = await POST(launch(id));
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Unexpected application id");
  });
  it("accepts the legacy session application field", async () => {
    const { POST } = await import("./route");
    expect((await POST(launch(publishedId, true))).status).toBe(200);
  });
  it("retains the published skill when configuration is absent", async () => {
    vi.stubEnv("ALEXA_SKILL_ID", "");
    const { POST } = await import("./route");
    expect((await POST(launch(publishedId))).status).toBe(200);
    expect((await POST(launch("unrelated"))).status).toBe(400);
  });
  it("preserves a configured skill ID", async () => {
    vi.stubEnv("ALEXA_SKILL_ID", "configured-skill");
    const { POST } = await import("./route");
    expect((await POST(launch("configured-skill"))).status).toBe(200);
  });
  it("rejects invalid signatures even for NR1 Family", async () => {
    verification.signature.mockRejectedValueOnce(new Error("Invalid signature"));
    const { POST } = await import("./route");
    const response = await POST(launch(familyId));
    expect(response.status).toBe(400);
    expect(await response.text()).toBe("Invalid request signature");
    expect(verification.timestamp).not.toHaveBeenCalled();
  });
});

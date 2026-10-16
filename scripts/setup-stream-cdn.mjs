#!/usr/bin/env node
/**
 * Creates (or re-configures) the Bunny.net pull zone that fronts the AzuraCast
 * stream for listeners far from the Norwich origin.
 *
 * Usage:  BUNNY_API_KEY=xxxx node scripts/setup-stream-cdn.mjs [--name nr1-radio] [--apply]
 *
 * Without --apply it only prints what it would do (dry run).
 * The key is your Bunny *account* API key: bunny.net → Account Settings → API.
 */

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const API = "https://api.bunny.net";

/** The key is a secret: prefer .env.local (git-ignored) over shell history. */
function loadKey() {
  if (process.env.BUNNY_API_KEY) return process.env.BUNNY_API_KEY;
  const envFile = resolve(HERE, "..", ".env.local");
  if (!existsSync(envFile)) return null;
  const m = readFileSync(envFile, "utf8").match(/^\s*BUNNY_API_KEY\s*=\s*(.+?)\s*$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
}

const KEY = loadKey();
const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const NAME = (args[args.indexOf("--name") + 1] || "").startsWith("--") || args.indexOf("--name") === -1
  ? "nr1-radio"
  : args[args.indexOf("--name") + 1];

const ORIGIN = "https://radio.listen-nr1dnb.com";

if (!KEY) {
  console.error("Missing BUNNY_API_KEY. bunny.net → Account Settings → API → copy the API key.");
  console.error("Put it in nr1-radio/.env.local (git-ignored) as:  BUNNY_API_KEY=...");
  console.error("That keeps it out of shell history; an env var also works for one-off runs.");
  process.exit(1);
}

/**
 * The edge serves Bunny's landing page both when a zone is missing and when the
 * whole account is suspended, while the API keeps answering happily either way.
 * Probing the hostname is the only way to tell configuration from suspension.
 */
async function probeEdge(host) {
  try {
    const res = await fetch(`https://${host}/`, { signal: AbortSignal.timeout(10_000) });
    const body = await res.text();
    return { status: res.status, suspended: /suspended or not configured/i.test(body) };
  } catch (e) {
    return { status: e.name === "TimeoutError" ? "timeout" : e.cause?.code || e.name, suspended: false };
  }
}

/** Pull-zone settings tuned for live radio rather than static files. */
const ZONE_CONFIG = {
  Name: NAME,
  OriginUrl: ORIGIN,
  Type: 0,                      // 0 = standard (premium) tier — volume tier can't do live well
  EnableGeoZoneUS: true,        // the whole point: edges on every continent
  EnableGeoZoneEU: true,
  EnableGeoZoneASIA: true,
  EnableGeoZoneSA: true,
  EnableGeoZoneAF: true,
  EnableTLS1_1: false,
  AddHostHeader: false,         // origin is name-based; keep the pull-zone host out of it
  EnableCacheSlice: false,      // slicing an endless stream makes no sense
  IgnoreQueryStrings: false,    // the player appends ?_t= cache-buster
  CacheControlMaxAgeOverride: -1,   // -1 = respect origin; Icecast sends no-cache
  EnableSmartCache: false,
  DisableCookies: false,
  OriginConnectTimeout: 10,
  OriginResponseTimeout: 60,
};

async function bunny(path, method = "GET", body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { AccessKey: KEY, "Content-Type": "application/json", Accept: "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-json error body */ }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${text.slice(0, 300)}`);
  return json;
}

const zones = await bunny("/pullzone");
const existing = zones.find((z) => z.Name === NAME);
const host = `${NAME}.b-cdn.net`;

// Catch a suspended account before touching anything: if the zone already
// exists and the edge still serves the landing page, no setting here can help.
const pre = await probeEdge(host);
if (pre.suspended && existing) {
  console.error(`Pull zone "${NAME}" exists (id ${existing.Id}), but ${host} serves Bunny's`);
  console.error('"domain suspended or not configured" page. That is an account-level block,');
  console.error("not a zone setting — no API change here will clear it.");
  console.error("Sort billing/verification at https://dash.bunny.net, then re-run this script.");
  process.exit(2);
}

if (!APPLY) {
  console.log(existing
    ? `DRY RUN — would update existing pull zone "${NAME}" (id ${existing.Id})`
    : `DRY RUN — would create pull zone "${NAME}" → origin ${ORIGIN}`);
  console.log(JSON.stringify(ZONE_CONFIG, null, 2));
  console.log(`\nStream URL would be: https://${host}/listen/nr1_dnb_radio/radio.mp3`);
  console.log(`Edge probe right now: ${host} → ${pre.status}${pre.suspended ? " (account suspended)" : ""}`);
  console.log("Re-run with --apply to do it.");
  process.exit(0);
}

let zone;
if (existing) {
  const { Name, OriginUrl, Type, ...updatable } = ZONE_CONFIG;
  zone = await bunny(`/pullzone/${existing.Id}`, "POST", updatable);
  console.log(`Updated pull zone "${NAME}" (id ${existing.Id})`);
} else {
  zone = await bunny("/pullzone", "POST", ZONE_CONFIG);
  console.log(`Created pull zone "${NAME}" (id ${zone.Id})`);
}

console.log(`\nEdge hostname: https://${host}`);
console.log(`Stream URL:    https://${host}/listen/nr1_dnb_radio/radio.mp3`);

// A fresh zone takes a moment to reach the edges; a suspended account never will.
process.stdout.write("\nwaiting for the edge to answer");
let live = false;
for (let i = 0; i < 18; i++) {
  const p = await probeEdge(host);
  if (p.suspended) {
    console.error(`\n\n${host} is still serving Bunny's "suspended or not configured" page.`);
    console.error("The zone is configured now, so this is an account-level block: sort billing or");
    console.error("verification at https://dash.bunny.net and re-run.");
    console.error("Leave NEXT_PUBLIC_STREAM_CDN_URL unset meanwhile — listeners stay on the origin.");
    process.exit(2);
  }
  if (typeof p.status === "number" && p.status < 500) { live = true; break; }
  process.stdout.write(".");
  await new Promise((r) => setTimeout(r, 5000));
}
console.log(live ? " up" : " no answer yet");

// Never hand listeners an edge that has not held an endless response first.
console.log("\nVerifying the edge can carry the live stream (90s) …\n");
const check = spawnSync(process.execPath, [resolve(HERE, "verify-stream-cdn.mjs"), `https://${host}`, "90"], {
  stdio: "inherit",
});

if (check.status !== 0) {
  console.error("\nVerification failed. Leave NEXT_PUBLIC_STREAM_CDN_URL unset so listeners keep");
  console.error("using the origin directly, and fix the edge before switching them over.");
  process.exit(1);
}

console.log(`\nVerified: the edge held full-bitrate audio. Now set it in Vercel and redeploy:`);
console.log(`  npx vercel env add NEXT_PUBLIC_STREAM_CDN_URL production`);
console.log(`  (value: https://${host})`);
console.log(`\nListeners move to their nearest edge on the next deploy. Origin bandwidth is`);
console.log(`unchanged — a pull zone shortens each listener's path, it does not pool connections.`);

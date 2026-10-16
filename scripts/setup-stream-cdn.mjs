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

const API = "https://api.bunny.net";
const KEY = process.env.BUNNY_API_KEY;
const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const NAME = (args[args.indexOf("--name") + 1] || "").startsWith("--") || args.indexOf("--name") === -1
  ? "nr1-radio"
  : args[args.indexOf("--name") + 1];

const ORIGIN = "https://radio.listen-nr1dnb.com";

if (!KEY) {
  console.error("Missing BUNNY_API_KEY. bunny.net → Account Settings → API → copy the API key.");
  process.exit(1);
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

if (!APPLY) {
  console.log(existing
    ? `DRY RUN — would update existing pull zone "${NAME}" (id ${existing.Id})`
    : `DRY RUN — would create pull zone "${NAME}" → origin ${ORIGIN}`);
  console.log(JSON.stringify(ZONE_CONFIG, null, 2));
  console.log(`\nStream URL would be: https://${NAME}.b-cdn.net/listen/nr1_dnb_radio/radio.mp3`);
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

const host = `${NAME}.b-cdn.net`;
console.log(`\nEdge hostname: https://${host}`);
console.log(`Stream URL:    https://${host}/listen/nr1_dnb_radio/radio.mp3`);
console.log(`\nNext: add to Vercel env (Production + Preview) and redeploy:`);
console.log(`  NEXT_PUBLIC_STREAM_CDN_URL=https://${host}`);
console.log(`Then verify:  node scripts/verify-stream-cdn.mjs https://${host}`);

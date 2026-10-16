#!/usr/bin/env node
/**
 * Proves a CDN edge can carry the live stream before listeners rely on it.
 * A CDN that serves a static file fine can still stall on an endless response,
 * so this holds the connection open and watches the bytes actually arrive.
 *
 * Usage: node scripts/verify-stream-cdn.mjs https://nr1-radio.b-cdn.net [seconds]
 */

const base = (process.argv[2] || "").replace(/\/+$/, "");
const SECONDS = Number(process.argv[3] || 90);
if (!base) {
  console.error("Usage: node scripts/verify-stream-cdn.mjs https://<zone>.b-cdn.net [seconds]");
  process.exit(1);
}

const url = `${base}/listen/nr1_dnb_radio/radio.mp3`;
const EXPECTED_BPS = 320_000 / 8; // 40 KB/s at 320 kbps

console.log(`Pulling ${url} for ${SECONDS}s …\n`);

const ac = new AbortController();
const t0 = Date.now();
let bytes = 0;
let firstByteMs = null;
const marks = [];

const timer = setTimeout(() => ac.abort(), SECONDS * 1000);

try {
  const res = await fetch(url, { signal: ac.signal, headers: { "Icy-MetaData": "1" } });
  console.log(`HTTP ${res.status}`);
  for (const h of ["content-type", "icy-name", "icy-br", "cdn-cache", "cdn-requestcountrycode", "server", "cache-control"]) {
    const v = res.headers.get(h);
    if (v) console.log(`  ${h}: ${v}`);
  }
  if (!res.ok || !res.body) throw new Error("no stream body");

  let lastLog = Date.now();
  for await (const chunk of res.body) {
    if (firstByteMs === null) {
      firstByteMs = Date.now() - t0;
      console.log(`\nfirst audio byte after ${firstByteMs} ms`);
    }
    bytes += chunk.length;
    if (Date.now() - lastLog >= 15000) {
      const secs = (Date.now() - t0) / 1000;
      const bps = bytes / secs;
      marks.push(bps);
      console.log(`  ${secs.toFixed(0)}s  ${(bytes / 1024 / 1024).toFixed(2)} MB  ${(bps / 1024).toFixed(1)} KB/s`);
      lastLog = Date.now();
    }
  }
} catch (err) {
  if (err.name !== "AbortError") {
    clearTimeout(timer);
    console.error(`\nFAILED: ${err.message}`);
    console.error("The edge could not hold the stream — do not point listeners at it.");
    process.exit(1);
  }
}
clearTimeout(timer);

const secs = (Date.now() - t0) / 1000;
const bps = bytes / secs;
const ratio = bps / EXPECTED_BPS;
console.log(`\n── result ──`);
console.log(`held open      ${secs.toFixed(1)} s`);
console.log(`received       ${(bytes / 1024 / 1024).toFixed(2)} MB`);
console.log(`average rate   ${(bps / 1024).toFixed(1)} KB/s (expected ~${(EXPECTED_BPS / 1024).toFixed(1)} KB/s for 320 kbps)`);

const dropped = secs < SECONDS - 5;
const starved = ratio < 0.85;
if (dropped) console.log(`\nFAIL: the edge closed the connection early (${secs.toFixed(0)}s of ${SECONDS}s).`);
else if (starved) console.log(`\nFAIL: rate is ${(ratio * 100).toFixed(0)}% of the bitrate — listeners would buffer.`);
else console.log(`\nPASS: continuous audio at full bitrate for ${SECONDS}s. Safe to point listeners at this edge.`);
process.exit(dropped || starved ? 1 : 0);

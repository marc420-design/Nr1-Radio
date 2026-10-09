#!/usr/bin/env node
/**
 * Seed the `shows` table from AzuraCast media library.
 *
 * Pulls every file from AzuraCast station 1, upserts one row per file into
 * Supabase `shows` (matched by azuracast_id). Sets tracklist_status='missing'
 * on new rows. Never overwrites an existing tracklist.
 *
 * Pre-requisites (both in .env.local):
 *   - AZURACAST_API_KEY
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - NEXT_PUBLIC_AZURACAST_BASE_URL (defaults to https://radio.listen-nr1dnb.com)
 *   - NEXT_PUBLIC_SUPABASE_URL
 *
 * Also requires the tracklist migration to have been run first
 * (supabase-migration-tracklists.sql).
 *
 * Usage:  node scripts/seed-shows-from-azuracast.js [--dry-run]
 */

const fs = require("fs");
const path = require("path");

const DRY_RUN = process.argv.includes("--dry-run");
const archiveCatalog = require("../src/data/archive-catalog.json");

function readEnv(name) {
  for (const file of [".env.local", ".env.vercel"]) {
    const p = path.join(__dirname, "..", file);
    if (!fs.existsSync(p)) continue;
    const raw = fs.readFileSync(p, "utf8");
    const m = raw.match(new RegExp("^" + name + "=\"?([^\r\n\"]+)\"?", "m"));
    if (m) return m[1].trim();
  }
  return process.env[name];
}

const AZURA_KEY = readEnv("AZURACAST_API_KEY");
const AZURA_BASE = readEnv("NEXT_PUBLIC_AZURACAST_BASE_URL") || "https://radio.listen-nr1dnb.com";
const AZURA_STATION_ID = readEnv("NEXT_PUBLIC_STATION_ID") || "nr1_dnb_radio";
const SUPABASE_URL = readEnv("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_SERVICE_KEY = readEnv("SUPABASE_SERVICE_ROLE_KEY");

function fatal(msg) {
  console.error("✗", msg);
  process.exit(1);
}

if (!AZURA_KEY) fatal("AZURACAST_API_KEY missing from .env.local");
if (!SUPABASE_URL) fatal("NEXT_PUBLIC_SUPABASE_URL missing from .env.local");
if (!SUPABASE_SERVICE_KEY) fatal("SUPABASE_SERVICE_ROLE_KEY missing from .env.local — get it from Supabase Dashboard → Settings → API");

async function fetchAzuraFiles() {
  const url = `${AZURA_BASE}/api/station/${AZURA_STATION_ID}/files/list`;
  const res = await fetch(url, { headers: { "X-API-Key": AZURA_KEY } });
  if (!res.ok) fatal(`AzuraCast files/list HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(row => row.media || row).filter(row => row.id && row.path) : [];
}

async function fetchExistingShows() {
  const url = `${SUPABASE_URL}/rest/v1/shows?select=*`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  });
  if (!res.ok) fatal(`Supabase select HTTP ${res.status}: ${await res.text()}`);
  return await res.json();
}

async function upsertShow(row) {
  const url = `${SUPABASE_URL}/rest/v1/shows?on_conflict=id`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`upsert HTTP ${res.status}: ${body}`);
  }
}

function slugFromPath(azuracastPath) {
  // e.g. "shows/nr1-live-show-2026-04-24.mp3" → "nr1-live-show-2026-04-24"
  const base = azuracastPath.split("/").pop() || azuracastPath;
  return base.replace(/\.[^.]+$/, "");
}

function toShowRow(file, existingByPath) {
  const existing = existingByPath.get(file.path.toLowerCase());
  const source = archiveCatalog[file.path.toLowerCase()];
  return {
    ...(existing ? { id: existing.id } : {}),
    azuracast_id: file.id,
    azuracast_path: file.path,
    ...(existing ? {} : { youtube_id: null }),
    title: source?.title || file.title || slugFromPath(file.path),
    lineup: source ? source.lineup : (file.artist || null),
    duration_min: file.length ? Math.round((file.length / 60) * 10) / 10 : null,
    // File imports are not recording/publication dates. Keep unknown dates unknown.
    uploaded_at: source ? source.publishedAt : (existing?.uploaded_at ?? null),
    // Only set tracklist_status on new rows; never overwrite an existing status
    ...(existing ? {} : { tracklist_status: "missing" }),
  };
}

async function main() {
  console.log(`Fetching AzuraCast files from ${AZURA_BASE}/api/station/${AZURA_STATION_ID}/files/list ...`);
  const files = await fetchAzuraFiles();
  console.log(`  ${files.length} files`);

  console.log(`Fetching existing Supabase 'shows' rows ...`);
  const existing = await fetchExistingShows();
  const byPath = new Map();
  for (const row of existing) {
    if (!row.azuracast_path) continue;
    const key = row.azuracast_path.toLowerCase();
    const previous = byPath.get(key);
    if (!previous || row.tracklist?.length || row.bunny_video_id) byPath.set(key, row);
  }
  console.log(`  ${existing.length} existing rows (${byPath.size} recording paths)`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    if (!file.id || !file.path) { skipped++; continue; }
    const row = toShowRow(file, byPath);
    if (DRY_RUN) {
      const kind = byPath.has(file.path.toLowerCase()) ? "UPDATE" : "INSERT";
      console.log(`  [dry-run] ${kind} ${file.path} (azuracast_id=${file.id})`);
      byPath.has(file.path.toLowerCase()) ? updated++ : inserted++;
      continue;
    }
    try {
      await upsertShow(row);
      byPath.has(file.path.toLowerCase()) ? updated++ : inserted++;
    } catch (e) {
      failed++;
      console.error(`  ✗ ${file.path}:`, e.message);
    }
  }

  console.log("");
  console.log(`Done. inserted=${inserted} updated=${updated} skipped=${skipped} failed=${failed}`);
  if (DRY_RUN) console.log("(dry-run — no changes written)");
}

main().catch(e => { console.error(e); process.exit(1); });

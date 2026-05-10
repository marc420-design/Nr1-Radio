#!/usr/bin/env node
/**
 * DJ Photo Upload Script
 * Uploads DJ photos from C:\Users\marc\Desktop\NR1 RADIO\artists
 * to Supabase Storage and updates djs.photo_url.
 *
 * Pre-requisite: add SUPABASE_SERVICE_ROLE_KEY to .env.local
 *   Get it from: Supabase Dashboard → Project Settings → API → service_role
 */

const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://nsszwoccbmzjfqenkpgb.supabase.co";
const IMAGES_DIR = "C:/Users/marc/Desktop/NR1 RADIO/artists";

// Read service_role key — checks .env.local then .env.vercel
function getServiceKey() {
  for (const name of [".env.local", ".env.vercel"]) {
    const envFile = path.join(__dirname, "..", name);
    if (!fs.existsSync(envFile)) continue;
    const raw = fs.readFileSync(envFile, "utf8");
    const match = raw.match(/SUPABASE_SERVICE_ROLE_KEY="?([^\r\n"]+)"?/);
    if (match) return match[1].trim();
  }
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY not found in .env.local or .env.vercel"
  );
}

// Map: actual filename in artists folder → DJ name(s) as stored in Supabase djs table
// Duplicates resolved: prefer newest / most complete filename
const DJ_MAP = [
  { file: "AWAKENING.jpeg",       names: ["AWAKENING"] },
  { file: "champion.jpg",         names: ["CHAMPION"] },
  { file: "contagious.jpg",       names: ["CONTAGIOUS"] },
  { file: "RINZE.jpg",            names: ["RINZE", "DJ RINZE"] },
  { file: "FLAT T.jpg",           names: ["FLAT T"] },
  { file: "FURY.jpg",             names: ["FURY"] },
  { file: "J2B.jpg",              names: ["J2B"] },
  { file: "johnyslipz.jpg",       names: ["JOHNYSLIPZ", "Johnyslipz"] },
  { file: "jonezee.jpg",          names: ["JONEZEE"] },
  { file: "mattman.jpg",          names: ["MATTMAN"] },
  { file: "MEL SD.jpg",           names: ["MEL-SD", "MEL SD"] },
  { file: "mike check.jpg",       names: ["Mike Chek", "MIKE CHEK"] },
  { file: "MISS V.jpg",           names: ["MISS V"] },
  { file: "MR-G.jpg",             names: ["MR-G", "MR G"] },
  { file: "odah.jpg",             names: ["ODAH"] },
  { file: "OZZY B.jpg",           names: ["OZZY-B", "OZZY B"] },
  { file: "PULSE.jpg",            names: ["PULSE"] },
  { file: "RELENTLESS.jpg",       names: ["RELENTLESS"] },
  { file: "SO-LOW.jpg",           names: ["SO-LOW", "SO LOW"] },
  { file: "sol.jpg",              names: ["SOL"] },
  { file: "STOPHER.jpg",          names: ["STOPHER"] },
  { file: "TUFF KUTS (2).jpg",    names: ["TUFF KUTS"] },
  // FB_IMG_1773590582366.jpg — unknown DJ, skipped
];

// MIME type by extension
function mimeType(file) {
  if (file.endsWith(".jpeg")) return "image/jpeg";
  if (file.endsWith(".png"))  return "image/png";
  return "image/jpeg";
}

async function uploadPhoto(serviceKey, fileName) {
  const filePath = path.join(IMAGES_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP (file not found): ${fileName}`);
    return null;
  }
  const fileData = fs.readFileSync(filePath);
  // Storage key: lowercase, spaces → hyphens, strip parens
  const storageName = fileName
    .replace(/\s*\(\d+\)/g, "")   // remove " (2)" etc
    .replace(/\s+/g, "-")
    .toLowerCase();

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/dj-photos/${storageName}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": mimeType(fileName),
        "x-upsert": "true",
      },
      body: fileData,
    }
  );
  if (res.ok) {
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/dj-photos/${storageName}`;
    console.log(`  ✓ Uploaded → ${storageName}`);
    return publicUrl;
  } else {
    const data = await res.json().catch(() => ({}));
    console.log(`  ✗ Upload failed: ${fileName} — ${JSON.stringify(data)}`);
    return null;
  }
}

async function updateDJ(serviceKey, djName, photoUrl) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/djs?name=eq.${encodeURIComponent(djName)}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ photo_url: photoUrl }),
    }
  );
  const data = await res.json().catch(() => []);
  if (Array.isArray(data) && data.length > 0) {
    console.log(`  ✓ DB updated: ${djName}`);
    return true;
  } else if (Array.isArray(data) && data.length === 0) {
    console.log(`  ! Not found in DB: "${djName}"`);
    return false;
  } else {
    console.log(`  ✗ DB error for ${djName}: ${JSON.stringify(data)}`);
    return false;
  }
}

async function run() {
  let serviceKey;
  try {
    serviceKey = getServiceKey();
  } catch (e) {
    console.error(`\nERROR: ${e.message}\n`);
    process.exit(1);
  }

  console.log("\n=== NR1 DJ Photo Upload ===\n");
  console.log(`Images dir: ${IMAGES_DIR}`);
  console.log(`Processing ${DJ_MAP.length} entries...\n`);

  let uploaded = 0, dbMatched = 0, dbMissed = 0;

  for (const { file, names } of DJ_MAP) {
    console.log(`[${file}]`);
    const photoUrl = await uploadPhoto(serviceKey, file);
    if (photoUrl) {
      uploaded++;
      for (const name of names) {
        const ok = await updateDJ(serviceKey, name, photoUrl);
        if (ok) dbMatched++;
        else dbMissed++;
      }
    }
    console.log();
  }

  console.log("=== Summary ===");
  console.log(`  Images uploaded:  ${uploaded}/${DJ_MAP.length}`);
  console.log(`  DB rows updated:  ${dbMatched}`);
  console.log(`  DB name misses:   ${dbMissed}`);
  console.log("\nNote: FB_IMG_1773590582366.jpg was skipped (unknown DJ).");
  console.log("If any DJ shows as 'Not found in DB', check the exact name in Supabase\nTable Editor → djs → name column, then add it to DJ_MAP manually.\n");
}

run().catch(console.error);

/**
 * Generates placeholder app icons for NR1 DNB Radio PWA.
 * Run with: node scripts/generate-icons.js
 *
 * Requires: npm install --save-dev canvas  (or use sharp / jimp)
 * Or replace with your actual brand icon files.
 */

const fs = require("fs");
const path = require("path");

// Minimal valid 1x1 PNG (transparent) — replace with actual icons
// This is a base64-encoded 1x1 pixel PNG
const PLACEHOLDER_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const iconsDir = path.join(__dirname, "../public/icons");
fs.mkdirSync(iconsDir, { recursive: true });

const buf = Buffer.from(PLACEHOLDER_PNG_B64, "base64");
fs.writeFileSync(path.join(iconsDir, "icon-192.png"), buf);
fs.writeFileSync(path.join(iconsDir, "icon-512.png"), buf);

console.log("✓ Placeholder icons written to public/icons/");
console.log("  Replace with proper 192x192 and 512x512 PNG files.");

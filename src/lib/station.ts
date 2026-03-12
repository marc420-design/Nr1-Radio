/**
 * Canonical public identity for NR1 DNB Radio.
 *
 * This is the single source of truth for station metadata used by:
 *   - /api/station-info  (public directory endpoint)
 *   - JSON-LD structured data  (layout.tsx)
 *   - Open Graph / Twitter meta tags  (layout.tsx)
 *
 * Do not duplicate these values elsewhere.
 * For AzuraCast technical config (base URL, shortcode, env vars) see constants.ts.
 */

import { DIRECT_STREAM_URL, SOCIAL_LINKS } from "./constants";

export const STATION_META = {
  // ─── Identity ──────────────────────────────────────────────────────────────
  name:         "NR1 Drum and Bass Radio",
  shortName:    "NR1 DNB",
  description:  "Norwich's underground drum & bass radio station. Live Friday sessions, 24/7 stream, 30+ DJs. Est. 2018.",

  // ─── URLs ──────────────────────────────────────────────────────────────────
  siteUrl:      "https://listen.nr1dnb.com",
  streamUrl:    DIRECT_STREAM_URL,
  logoUrl:      "https://listen.nr1dnb.com/icons/icon-512.png",

  // ─── Classification ────────────────────────────────────────────────────────
  genre:        "Drum and Bass",
  tags:         ["drum and bass", "dnb", "jungle", "uk bass", "electronic", "underground"],
  codec:        "MP3",
  bitrate:      320,

  // ─── Location & language ───────────────────────────────────────────────────
  country:      "United Kingdom",
  countryCode:  "GB",
  language:     "english",
  languageCode: "en",
  city:         "Norwich",
  region:       "England",

  // ─── History ───────────────────────────────────────────────────────────────
  founded:      "2018",

  // ─── Social ────────────────────────────────────────────────────────────────
  social:       SOCIAL_LINKS,
};

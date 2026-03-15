// ─── AzuraCast ────────────────────────────────────────────────────────────────
export const AZURACAST_BASE_URL =
  process.env.NEXT_PUBLIC_AZURACAST_BASE_URL ?? "https://radio.listen-nr1dnb.com";

/** Station ID (shortcode) used by /api/nowplaying and /api/station endpoints */
export const STATION_ID =
  process.env.NEXT_PUBLIC_STATION_ID ?? "nr1_dnb_radio";

/** Shortcode used by the SSE and stream mount endpoints */
export const STATION_SHORTCODE =
  process.env.NEXT_PUBLIC_STATION_SHORTCODE ?? "nr1_dnb_radio";

/** Direct MP3 stream URL (used on the Listen page as a copyable link) */
export const DIRECT_STREAM_URL = `${AZURACAST_BASE_URL}/listen/${STATION_SHORTCODE}/radio.mp3`;

// ─── Social / contact ─────────────────────────────────────────────────────────
export const SOCIAL_LINKS = {
  facebook:   "https://www.facebook.com/nr1dnb",
  youtube:    "https://youtube.com/@nr1family420",
  mixcloud:   "https://www.mixcloud.com/Nr1family/",
  soundcloud: "https://soundcloud.com/nr1-family",
  email:      "Nr1family420@gmail.com",
} as const;

// ─── Player settings ──────────────────────────────────────────────────────────
export const TRACK_HISTORY_LIMIT = 8;

// ─── Home page stat badges ────────────────────────────────────────────────────
export const STAT_BADGES = ["30+ DJs", "Est. 2018", "Norwich, UK"] as const;

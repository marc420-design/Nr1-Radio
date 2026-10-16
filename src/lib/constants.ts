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

// ─── Stream CDN ───────────────────────────────────────────────────────────────
/**
 * Optional CDN edge in front of the AzuraCast origin (Bunny pull zone), e.g.
 * "https://nr1-radio.b-cdn.net". Listeners far from the Norwich origin connect
 * to their nearest edge instead of crossing an ocean on one TCP pipe.
 *
 * Unset → the player uses the origin directly, exactly as before. The pull zone
 * mirrors AzuraCast's URL layout, so only the hostname differs.
 */
export const STREAM_CDN_BASE_URL =
  process.env.NEXT_PUBLIC_STREAM_CDN_URL?.replace(/\/+$/, "") ?? "";

/** MP3 stream served via the CDN edge when configured, else the origin. */
export const STREAM_URL = STREAM_CDN_BASE_URL
  ? `${STREAM_CDN_BASE_URL}/listen/${STATION_SHORTCODE}/radio.mp3`
  : DIRECT_STREAM_URL;

// ─── Social / contact ─────────────────────────────────────────────────────────
export const SOCIAL_LINKS = {
  facebook:   "https://www.facebook.com/nr1dnb/",
  instagram:  "https://www.instagram.com/nr1dnb/",
  youtube:    "https://www.youtube.com/@nr1family420",
  mixcloud:   "https://www.mixcloud.com/Nr1family/",
  tiktok:     "https://www.tiktok.com/@nr1dnb",
  twitch:     "https://www.twitch.tv/nr1family",
  kick:       "https://kick.com/nr1dnb",
  twitter:    "https://twitter.com/Nr1Family",
  soundcloud: "https://soundcloud.com/nr1-family",
  email:      "Nr1family420@gmail.com",
} as const;

// ─── Player settings ──────────────────────────────────────────────────────────
export const TRACK_HISTORY_LIMIT = 8;

// ─── Home page stat badges ────────────────────────────────────────────────────
export const STAT_BADGES = ["20+ DJs & MCs", "Est. 2018", "Norwich, UK"] as const;

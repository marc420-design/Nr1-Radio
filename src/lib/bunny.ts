const LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID ?? "";
const CDN_HOSTNAME = process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME ?? "";

export const bunnyEmbedUrl = (videoId: string) =>
  `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}?autoplay=false&responsive=true`;

export const bunnyThumbnailUrl = (videoId: string) =>
  `https://${CDN_HOSTNAME}/${videoId}/thumbnail.jpg`;

export const bunnyPreviewUrl = (videoId: string) =>
  `https://${CDN_HOSTNAME}/${videoId}/preview.webp`;

export const bunnyHlsUrl = (videoId: string) =>
  `https://${CDN_HOSTNAME}/${videoId}/playlist.m3u8`;

export const isBunnyConfigured = () => LIBRARY_ID.length > 0 && CDN_HOSTNAME.length > 0;

// Accepts either a bare Bunny video GUID or any of the common Bunny URL forms
// (iframe.mediadelivery.net/embed/{lib}/{guid}, {cdn}/{guid}/playlist.m3u8, etc.)
// and returns the GUID, or null if nothing that looks like a GUID is present.
const GUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function parseBunnyVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(GUID_RE);
  return match ? match[0].toLowerCase() : null;
}

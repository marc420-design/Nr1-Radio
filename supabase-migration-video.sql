-- Migration: add Bunny.net Stream video support to shows table
-- YouTube has been taking down NR1's DnB sets for copyright, so shows move to
-- Bunny Stream (no automated copyright bot). YouTube column stays for legacy rows.
-- Run in Supabase SQL editor. Idempotent.

alter table shows
  alter column youtube_id drop not null,
  add column if not exists bunny_video_id text,
  add column if not exists description text;

-- Note: no DB-level check that a video source exists. AzuraCast-seeded rows
-- (audio-only, populated by scripts/seed-shows-from-azuracast.js for PRS/PPL
-- reporting) have neither youtube_id nor bunny_video_id and that's expected.
-- User-created show rows are validated in the admin server action
-- (src/app/admin/shows/new/actions.ts::createShowAction).
alter table shows drop constraint if exists shows_has_video;

create index if not exists shows_bunny_video_id_idx on shows (bunny_video_id);

comment on column shows.bunny_video_id is 'Bunny.net Stream video GUID. Preferred host for new sets.';
comment on column shows.youtube_id is 'Legacy YouTube video ID. Nullable — YouTube deprecated as primary host.';
comment on column shows.description is 'Long-form show description for detail page and OG metadata.';

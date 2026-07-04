-- Migration: add tracklist support to shows table for PRS/PPL cue-sheet reporting
-- Run in Supabase SQL editor. Idempotent.

alter table shows
  add column if not exists tracklist jsonb,
  add column if not exists tracklist_status text check (tracklist_status in ('missing','partial','complete')) default 'missing';

-- Tracklist shape (jsonb array of objects):
-- [
--   {
--     "artist": "Artist Name",
--     "title": "Track Title",
--     "isrc": "GBXXX2400001",   -- optional but strongly preferred for PPL
--     "start_time_sec": 0,       -- offset within the mix
--     "duration_sec": 240        -- optional
--   },
--   ...
-- ]

create index if not exists shows_tracklist_status_idx on shows (tracklist_status);

-- Convenience view: flatten tracklists into one row per track for CSV export
create or replace view shows_tracks_flat as
select
  s.id              as show_id,
  s.title           as show_title,
  s.lineup          as show_lineup,
  s.uploaded_at     as show_uploaded_at,
  s.azuracast_id    as azuracast_file_id,
  (t.ord)::int      as track_order,
  t.item ->> 'artist'                              as track_artist,
  t.item ->> 'title'                               as track_title,
  t.item ->> 'isrc'                                as track_isrc,
  (t.item ->> 'start_time_sec')::int               as track_start_sec,
  (t.item ->> 'duration_sec')::int                 as track_duration_sec
from shows s
cross join lateral jsonb_array_elements(coalesce(s.tracklist, '[]'::jsonb))
  with ordinality as t(item, ord)
where s.tracklist is not null;

comment on column shows.tracklist is 'JSONB array of tracks played within this show. Required for PRS/PPL cue-sheet reporting.';
comment on column shows.tracklist_status is 'missing | partial | complete — for admin dashboard.';

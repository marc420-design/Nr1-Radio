-- Web push for live-show alerts.
--
-- Two tables:
--   push_subscriptions - one row per browser that opted in
--   push_broadcasts    - one row per broadcast we have already announced, which
--                        makes the webhook idempotent
--
-- Neither table is reachable from the browser. RLS is enabled with no policies
-- at all, so the anon and authenticated roles can do nothing here; every read
-- and write goes through a server route using the service role key, which
-- bypasses RLS. The browser subscribes by POSTing to /api/push/subscribe rather
-- than inserting directly, so a leaked anon key cannot enumerate subscribers.

create table if not exists public.push_subscriptions (
  id bigint generated always as identity primary key,
  -- The push service URL. Unique per browser install, so it is the natural key
  -- for upserting a re-subscribe and for pruning after a 404/410.
  endpoint text not null unique,
  p256dh_key text not null,
  auth_key text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_notified_at timestamptz,
  -- Consecutive send failures. A subscription is pruned on a hard 404/410; this
  -- counter catches the softer failures that should not delete it immediately.
  failure_count smallint not null default 0
);

alter table public.push_subscriptions enable row level security;

create table if not exists public.push_broadcasts (
  -- AzuraCast's live.broadcast_start for the broadcast that was announced.
  -- Primary key, so a duplicate webhook delivery conflicts instead of sending a
  -- second round of notifications.
  broadcast_start timestamptz primary key,
  streamer_name text,
  notified_at timestamptz not null default now(),
  recipients integer not null default 0
);

alter table public.push_broadcasts enable row level security;

-- Pruning old announcement records by date.
create index if not exists push_broadcasts_notified_at_idx
  on public.push_broadcasts (notified_at desc);

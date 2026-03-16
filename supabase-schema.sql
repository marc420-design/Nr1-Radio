-- NR1 DNB Radio — Supabase Schema
-- Run this in the Supabase SQL editor once your project is created.

-- Schedule
create table if not exists schedule (
  id uuid primary key default gen_random_uuid(),
  show_name text not null,
  dj_name text,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0=Mon, 6=Sun
  start_time time not null,
  end_time time not null,
  show_type text default 'live' check (show_type in ('live', 'replay', 'guest', 'special')),
  created_at timestamptz default now()
);

-- Enable RLS with public read
alter table schedule enable row level security;
create policy "Public read schedule" on schedule for select using (true);

-- DJs
create table if not exists djs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  photo_url text,
  socials jsonb, -- { soundcloud, instagram, mixcloud }
  is_resident boolean default false,
  created_at timestamptz default now()
);

alter table djs enable row level security;
create policy "Public read djs" on djs for select using (true);

-- Events (shared with Norwich Events Hub — read-only from NR1 side)
-- NR1 queries: select * from events where 'nr1' = any(tags)
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  date date not null,
  venue text,
  flyer_url text,
  ticket_url text,
  tags text[] default '{}',
  created_at timestamptz default now()
);

alter table events enable row level security;
create policy "Public read events" on events for select using (true);

-- Live Chat
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  username text not null check (char_length(username) between 1 and 20),
  message text not null check (char_length(message) between 1 and 200),
  color text not null default '#00E5FF'
);

alter table chat_messages enable row level security;
create policy "Public read chat" on chat_messages for select using (true);
create policy "Public insert chat" on chat_messages for insert with check (
  char_length(username) between 1 and 20 and
  char_length(message) between 1 and 200
);

-- Enable Realtime for live chat
alter publication supabase_realtime add table chat_messages;

-- Auto-purge: keep only the latest 500 messages
create or replace function purge_old_chat_messages()
returns trigger language plpgsql as $$
begin
  delete from chat_messages
  where id in (
    select id from chat_messages
    order by created_at desc
    offset 500
  );
  return null;
end;
$$;

create trigger trg_purge_chat
after insert on chat_messages
execute function purge_old_chat_messages();

-- Sample data (optional — remove before production)
insert into schedule (show_name, dj_name, day_of_week, start_time, end_time, show_type) values
  ('Friday Night Sessions', 'DJ Example', 4, '20:00', '22:00', 'live'),
  ('Saturday Deep Cuts', 'Another DJ', 5, '21:00', '23:00', 'live'),
  ('Sunday Liquid Vibes', null, 6, '14:00', '16:00', 'replay');

# NR1 Radio — Session Handoff (2026-07-04)

## What shipped this session

Three commits pushed to `main`:

1. **`4287dc0`** — Fix pre-hydration "Offline" flash on `LiveBadge`
   Added `hasLoaded` flag to `useNowPlaying`; badge renders a neutral "—" placeholder until first SSE/poll response resolves.
   Files: `src/hooks/useNowPlaying.ts`, `src/contexts/PlayerContext.tsx`, `src/components/player/LiveBadge.tsx`, `src/components/player/PlayerBar.tsx`, `src/components/player/StickyPlayer.tsx`.

2. **`2f17745`** — Remove per-minute `show-handover` cron from `vercel.json`
   The `* * * * *` schedule required Vercel Pro. Every deploy since **May 31** (commit `13b61aa`) had been failing silently, freezing the live site on a stale build. Six weeks of accumulated fixes deployed with this push.
   File: `vercel.json`.

3. **`efe1fc6`** — Tracklist schema + PRS/PPL cue-sheet CSV export
   Files: `supabase-migration-tracklists.sql`, `src/lib/supabase.ts`, `src/app/api/reports/cue-sheet/route.ts`.

## Also done (out-of-band)

- **AzuraCast station config**: `station.url` set to `https://listen-nr1dnb.com` via API. Country field wouldn't accept any code (`GB`, `gb`, `UK`, `United Kingdom`, `GBR`) — likely a UI-dropdown-only field. Non-blocking.

---

## Action items for you

### 1. Run the Supabase migration
Open Supabase Dashboard → SQL Editor → New query → paste contents of `supabase-migration-tracklists.sql` → Run.

Adds to `shows` table:
- `tracklist jsonb` — array of `{artist, title, isrc, start_time_sec, duration_sec}` objects
- `tracklist_status text` — `missing | partial | complete`
- Index on `tracklist_status`
- View `shows_tracks_flat` — flattens tracklists to one row per track for CSV joins

Idempotent — safe to re-run.

### 1b. Add `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD`
Both go in `.env.local` **and** Vercel env vars:
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase Dashboard → Settings → API → `service_role` (⚠ full-access — server-side only, never expose)
- `ADMIN_PASSWORD` — any string. Used to log into `/admin` (HTTP Basic Auth; leave username blank).

### 1c. Seed the shows table
Once the migration is run and the two env vars are set:
```bash
node scripts/seed-shows-from-azuracast.js --dry-run   # preview
node scripts/seed-shows-from-azuracast.js             # actually write
```
Pulls all AzuraCast files, inserts one row per file into `shows` with `tracklist_status='missing'`. Idempotent, never overwrites an existing tracklist.

### 1d. Catalogue tracklists at `/admin/tracklists`
Log in with the `ADMIN_PASSWORD` (username blank). Click a show, paste the tracklist, save. Accepted formats:
```
Artist - Title
00:00 Artist - Title
1. Artist - Title
Artist - Title [ISRC:GBXXX2400001]
```
Or a JSON array. Save marks the show `partial` or `complete` per your dropdown choice.

### 2. Add `REPORT_API_KEY` to Vercel
Vercel Dashboard → Nr1-Radio → Settings → Environment Variables → Add:
- **Name:** `REPORT_API_KEY`
- **Value:** `QAv7SjUxemilZ5nMAxVUvWZRPN2QOiomj0xcJ2SSpZ8`
- **Environments:** Production (and Preview if you want)

Redeploy after adding (or it will use the value on the next natural deploy).

### 3. AzuraCast country code
When you're at the AzuraCast desktop, set the country to United Kingdom via the web UI (Settings → Profile). The API wouldn't accept it.

---

## How to pull a PRS/PPL cue sheet

Once the env var and migration are in place:

```bash
curl -H "x-report-key: QAv7SjUxemilZ5nMAxVUvWZRPN2QOiomj0xcJ2SSpZ8" \
  "https://listen-nr1dnb.com/api/reports/cue-sheet?from=2026-07-01&to=2026-07-31" \
  -o nr1-cue-sheet-july-2026.csv
```

Or `?format=json` for a JSON response.

**CSV columns:**
`played_at_iso, played_at_epoch, show_title, show_lineup, track_artist, track_title, track_isrc, track_duration_sec, source`

`source` is `azuracast_playback` (from AzuraCast history) or `show_tracklist` (from Supabase). Rows are sorted by `played_at_epoch`.

**Retention gotcha:** AzuraCast history via the public API only returns the last ~10 tracks. The admin `/api/station/*/history` endpoint (used by the cue-sheet route with `AZURACAST_API_KEY`) retains longer — but confirm the retention window before you rely on it monthly. Consider a scheduled export to Supabase/S3 if needed.

---

## Still open for PRS/PPL submission

- **Populate the `shows` table with tracklists.** Currently 0 rows. The 150 archive mixes need to be inserted with tracklists per show. This is the manual DJ-chase step and is the single biggest blocker to submission.
- **Legal entity on the site.** Currently no company name / sole-trader details on the footer, terms, or privacy pages. PRS/PPL registration will need this. User deferred this decision — pick sole trader vs Ltd when ready.
- **ISRC codes on the archive files.** Every one of the 150 files has `isrc=""` in AzuraCast. Non-fatal (PPL falls back to title/artist matching) but reduces royalty-attribution accuracy for the tracks *inside* the mixes, when you populate tracklists.

**Rough remaining scope:** ~1 week if you go sole-trader + sample reporting; ~2+ weeks if full monthly cue sheets across all 150 archive shows.

---

## Live state at handoff

- **Site:** listen-nr1dnb.com — live, running the newest bundle (commit `efe1fc6` deploying).
- **AzuraCast:** online, 3 listeners, playing `NR1 LIVE SHOW 2026-04-24`.
- **GitHub:** `main` @ `efe1fc6`, working tree clean.
- **Supabase:** unchanged — migration file staged locally, not yet run.
- **Vercel:** `REPORT_API_KEY` not yet added to env vars — cue-sheet endpoint will 401 until you add it.

# NR1 Radio — Session Handoff (2026-07-04, PM)

## What shipped this session

Commits pushed to `main` (in order):

1. **`8dca599`** — GitHub Actions workflow to trigger Vercel deploys on push (fallback for broken Vercel GitHub App webhook).
2. **`ff6e303`** — Remove per-minute `show-handover` cron (audit commit `1adf927` had re-added it, blocking every Vercel Hobby deploy).
3. **`bdf038c`** — **Delete duplicate root `middleware.ts`** — was overriding `src/middleware.ts`, causing every `/admin` request to serve the old HTTP Basic Auth response even after the new cookie-based middleware was written.
4. **`108ec7a`** — Simplify `/admin/login` page — drop Suspense wrapper so the password form renders in initial HTML (avoids "nothing to click" if JS is slow to hydrate).
5. **`607e394`** — Fix `archive-history` cron: AzuraCast expects ISO date strings, not epoch seconds. Cron had been erroring silently since deploy → `play_history` sat at 0 rows.
6. **`1cccb6e`** — **`/admin/reports` page + backfill endpoint + PRS/PPL CSV export.**
   - `src/lib/azuracast-history.ts` — shared `fetchAndUpsertHistory(startIso, endIso)` helper.
   - `POST /api/admin/backfill-history` — chunks a date range by day, upserts to `play_history`. Cookie-auth (`admin_token`).
   - `GET /api/admin/reports/csv` — cue-sheet CSV for a date range.
   - `src/app/admin/reports/page.tsx` + `ReportControls.tsx` — server page with stat cards, date-range picker, results table (latest 500), CSV button, backfill button.
7. **`6cbadee`** — Add "Notes" column to CSV auto-flagging DJ-set rows + `GET /api/admin/reports/cover-letter` for a PRS/PPL-ready plain-text cover letter.

Also done this session (out-of-band):

- **Vercel GitHub App permissions accepted** — `Actions (read)` + `Workflows (read & write)`. Vercel had been silently missing every push since a permissions bump. Reviewed & approved at `github.com/settings/installations/115471577`.
- **Vercel CLI logged in** locally (marc420-design). `.vercel/project.json` linked to `marc420-designs-orgs-projects/nr1-radio`.
- **60-day history backfill run** — 803 tracks inserted into `play_history` covering 2026-05-10 → 2026-07-04. Confirmed no AzuraCast history exists prior to 2026-05-10 (retention limit on the server).

---

## Live state at handoff

- **Site**: https://listen-nr1dnb.com — live, latest bundle from `6cbadee`.
- **Admin**: `/admin` behind cookie-auth (`ADMIN_PASSWORD=nr1admin2026`). Login form renders in initial HTML.
- **Archive cron**: fixed, runs `0 2 * * *` UTC daily.
- **`play_history`**: 803 rows, backfilled from AzuraCast.
- **Vercel deploys**: auto-deploy from `main` should work again now that the GitHub App has its new permissions. The `deploy.yml` GitHub Action is kept as a belt-and-braces fallback.
- **GitHub**: `main` @ `6cbadee`, working tree clean.

---

## Stack quick-reference

- Next.js 16.1.6 (App Router, Turbopack, React Compiler), Tailwind v4 (CSS `@theme` in `globals.css` — no `tailwind.config.ts`).
- Supabase: `chat_messages`, `djs`, `schedule`, `events`, `shows`, **`play_history`** (new-ish, admin-only via service role).
- AzuraCast at `radio.listen-nr1dnb.com`, station `nr1_dnb_radio`.
- Vercel Hobby — **all crons must be daily or slower** (`* * * * *` per-minute rejects at deploy time).

---

## Deploy notes (important — read before shipping)

- `vercel --prod --yes` from the project root works (CLI is logged in, `.vercel/` linked).
- Auto-deploy from GitHub `main` should also work now that Vercel's GitHub App has been re-approved. If it silently stops again, check `github.com/settings/installations/115471577` for a new "Permission updates requested" flag.
- **Never re-introduce a `middleware.ts` at the repo root.** Next.js resolves that first and it will silently override `src/middleware.ts`.
- **Never add a `* * * * *` cron to `vercel.json`.** Hobby rejects it, which fails the whole deploy.

---

## Environment variables (Vercel, production)

| Key | Set? | Notes |
|---|---|---|
| `ADMIN_PASSWORD` | ✓ | `nr1admin2026` — cookie value for `/admin` auth |
| `CRON_SECRET` | ✓ | Bearer token Vercel Cron sends to `/api/cron/*` |
| `AZURACAST_API_KEY` | ✓ | `1b9333008bfa7147:12de2bb80b0b575ef4e06ee5d5379d3a` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | Server-only; bypasses RLS |
| `NEXT_PUBLIC_AZURACAST_BASE_URL` | ✓ | `https://radio.listen-nr1dnb.com` |
| `NEXT_PUBLIC_STATION_ID` | ✓ | `nr1_dnb_radio` |
| `NEXT_PUBLIC_STATION_SHORTCODE` | ✓ | `nr1_dnb_radio` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | ✓ | |

---

## PRS/PPL prep

Owner has **not applied for a licence yet** — collecting data now so historical reporting is available when they do. Everything needed is in place:

- **`play_history` table** — every track AzuraCast plays, upserted nightly at 2 AM UTC.
- **`/admin/reports`** — date-range picker, results table, `DOWNLOAD CSV`, `COVER LETTER`, `RUN BACKFILL`.
- **CSV format** — Broadcast Date, Time UTC, Duration, Title, Artist, ISRC, Playlist, Streamer, **Notes**. DJ-set rows auto-flagged in Notes.
- **Cover letter** — plain-text template naming the station + reporting period, and explaining that DJ-set rows are continuous mixes, not individual tracks.

When they apply, likely licences:
- PPL Small Broadcaster Radio (~£220/yr).
- PRS Limited Online Music Licence (LOML) or Small Webcaster Tariff (listener-hours based).
- Reporting is typically quarterly and only for the licensed period.

---

## Audit feedback (user reviewed the live site)

**Resolved / verified:**
- Stream URL — verified `206 Partial Content` / `audio/mpeg`, 100 KB in <8s. Working.
- Footer "Contact" — already `mailto:nr1family420@gmail.com` in `SiteChrome.tsx:85`. Crawler false positive.
- Admin login — now works, form visible in initial HTML.

**Still open (need user input or a device):**
- Manual playback QA in VLC + Chrome + mobile data + Alexa.
- Schedule truth-check — Listen page says "Live Fridays" but `/schedule` shows many weekly slots. Owner needs to confirm current live times before advertising.
- DJ bios — some residents have full descriptions, others are name-only. Need content pass: role, real/artist name, style, socials, latest show link.
- Privacy/Terms detail pass — cover live chat, Umami analytics, embedded players, directory listings, third-party data flow.
- AzuraCast physical: disk 75% full, 135 files still to upload, nginx `413` blocking large uploads. Fix at the desktop when convenient (disk expand + `client_max_body_size` bump + `nr1upload` SFTP on port 2022 needs the router port-forward).

---

## Suggested upgrades (all zero-cost, user is between funding rounds)

**Reliability tier (protect what exists):**
1. UptimeRobot free tier pinging site + stream.
2. Sentry free tier (5k errors/mo).
3. Supabase nightly JSON backup → Vercel Blob.
4. `/api/health` endpoint (Supabase + AzuraCast reachable).

**Growth tier:**
5. Podcast RSS feed exposing the AzuraCast archive → submittable to Spotify / Apple Podcasts / Pocket Casts.
6. PWA Web Push notifications ("DJ X is live now").
7. "Recently played" homepage widget from `play_history`.
8. Now-playing → Discord webhook.

**Content tier:**
9. Populate the `shows` table (currently 0 rows) and build a proper `/shows` archive listing.
10. Per-DJ play-count / broadcast-hours stats on DJ profile pages.

User to pick which bundle to start with. Reliability trio is the highest-leverage.

---

## Files worth knowing about (added / changed this session)

```
src/middleware.ts                                 (cookie-auth for /admin)
src/app/admin/login/page.tsx                      (simplified, no Suspense)
src/app/admin/reports/page.tsx                    (new — server component)
src/app/admin/reports/ReportControls.tsx          (new — client controls)
src/app/api/admin/backfill-history/route.ts       (new — POST, cookie-auth)
src/app/api/admin/reports/csv/route.ts            (new — GET, cookie-auth)
src/app/api/admin/reports/cover-letter/route.ts   (new — GET, cookie-auth)
src/app/api/cron/archive-history/route.ts         (uses shared helper)
src/lib/azuracast-history.ts                      (new — shared helper)
vercel.json                                       (per-minute cron removed)
.github/workflows/deploy.yml                      (fallback deploy trigger)
```

Deleted: root `middleware.ts` (was the old HTTP Basic Auth version, was overriding `src/middleware.ts`).

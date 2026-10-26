# NR1 Radio — Session Handoff (2026-10-26)

> Supersedes the 2026-07-05 handoff. The old "discoverability rollout is PAUSED
> until PRS + PPL are in place" instruction **no longer reflects reality** — see
> *Licensing* below. Directory listings were claimed on 24–26 Oct.

## ⚠️ Act on this first — home address published

The **myTuner listing (id 518564) still publicly shows the owner's full home
address** in its Address field. This was first noted in the July handoff and is
**still live** as of 2026-10-26. (The address itself is deliberately not repeated
here — this file is in a GitHub repo.)

The site footer now links to that listing, so the site is driving traffic to it.

- Fix: email **help@mytuner.mobi** asking for the address to be removed from the
  public listing, or edit it through the broadcaster edit form.
- Consider pulling the myTuner link from `DIRECTORY_LINKS` in
  `src/components/ui/SiteChrome.tsx` until it is removed.
- Worth auditing the other four directories for the same field.

## What shipped this session

Commits on `main`:

1. **`0f16645`** — `scripts/listener-hours.mjs`. Computes PRS-licensable listener
   hours from AzuraCast, excluding the AzuraCast host's own IP, directory bots,
   and radio-app relay traffic. See *Licensing*.
2. **`858cc80`** — LIVE badge no longer outlives the broadcast. `useNowPlaying`
   used to swallow failed polls and keep the last state forever, so an
   unreachable API froze a "Live" badge on screen indefinitely. Now tracks the
   last successful poll, marks state stale after 3 missed intervals (45s), and
   `LiveBadge` renders a neutral unknown state rather than a false Live/Offline.
3. **`d1ab415`** — Web push for live-show alerts (see *Push notifications*).
4. **`64effa5`** — `NotifyButton` placed in `PlayerBar`, hidden while already live.
5. **`73583b6`** — Footer directory links corrected (see *Directories*).

Merged in parallel by another agent: **`8cbd5f6`** "Reduce radio polling compute
with short shared caching (#2)" — visibility-aware polling, server-side caching,
and the first real test coverage (suite now 14 tests / 3 files). It touched
`useNowPlaying.ts` and `PlayerContext.tsx` but **preserved the staleness fix**.

## Push notifications (new)

Live-show alerts, driven by AzuraCast's `live_connect` webhook — **not** a cron.
`show-handover`'s "runs every minute" comment was never true; `vercel.json` only
registers `reset-chat` and `archive-history`, both daily.

- `POST /api/webhooks/azuracast/live` — **does not trust the request**. AzuraCast's
  connector has no confirmed custom-header support, and the usual workaround puts
  a secret in a query string. So the route ignores the body entirely and re-reads
  live state from AzuraCast's API with `AZURACAST_API_KEY`. An unauthenticated
  call achieves nothing but one upstream fetch.
- Idempotency: `live.broadcast_start` is the primary key of `push_broadcasts`,
  claimed *before* sending. Duplicate deliveries conflict and send nothing.
- `push_subscriptions` + `push_broadcasts` have **RLS on with no policies** — the
  anon key cannot read or write them. The browser subscribes via
  `/api/push/subscribe`, which uses the service-role client.
- Env: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` in
  `.env.local` and Vercel Production. Optional `PUSH_WEBHOOK_SECRET`.

**Untested path:** no notification has ever been delivered to a device. The
`not_live` branch is proven (webhook TEST returns `{"status":"not_live"}`); the
`is_live` branch is not. First real test is a Friday DJ connection.

## AzuraCast (updated tonight)

- Updated from `#421e9d2` (2026-05-07) to **`#aafac69` (2026-10-26)** — 5½ months.
  ~2-minute outage, 19:05–19:07. Still on **Rolling Release**.
- **Backups were disabled with zero backups existing.** Now: nightly 04:00 UTC,
  media excluded, 14 copies, plus a verified off-box copy at
  `~/Downloads/manual_backup_20261026_1901.zip` (zip integrity OK, contains
  `db.sql` 1.96 MB).
- Analytics `no_ip` → `all` on 24 Oct fixed a stalled aggregation. Per-listener
  rows only exist **from 2026-10-24**; earlier dates are 0 and never backfilled.
- Webhook `NR1 live push alerts` configured, both triggers, request timeout 15s.

### Known AzuraCast bug (pre-update)
Saving a webhook threw `StationWebhook::$station_id must not be accessed before
initialization` — it saved anyway, the list just didn't refresh. Unverified
whether the new build fixes it.

## Licensing

- **PRS replied 26 Oct** (Daniel Priestley, Sales Advisor – Radio). It is an
  **Internet Radio Licence**, not the LOML. Likely the **minimum fee: £199 + VAT/yr**,
  covering up to **800 average monthly listener hours**.
- PRS only licenses the UK + managed territories (Crown Dependencies, BOTs,
  Cyprus, Bahamas, Malta). Submit **UK hours only** and tick "Inside the UK" only.
  Non-UK listeners need foreign societies or a geo-block — **unresolved decision**.
- **PPL** (Linear Webcast Licence) — enquiry 24 Oct, chaser 26 Oct, no reply and
  no auto-ack. Next step: their website form.
- Measured 25–26 Oct: **13.37 licensable hours over 2.04 days ≈ 199/month**, ~4×
  inside the allowance. Pull real 30-day figures ~24 Nov with
  `AZURACAST_API_KEY=... node scripts/listener-hours.mjs --days 30 --breakdown`.
- **Do not submit raw AzuraCast numbers.** The daily figure is unique-listeners-
  per-day, not concurrent, and is dominated by bots: of 199 connected hours over
  25–26 Oct, 186 were the host's own IP, directory probes, or app relays.
  Tonight's restart also distorts 26 Oct.

## Directories

Verified live and pulling the stream (crawlers seen in the listener log):
`radio.net`, `OnlineRadioBox` (`ORB HisBot`), `Streema` (`SimpleRadioFree`),
`myTuner` (`myTuner`).

Footer `DIRECTORY_LINKS` corrected — radio.net search URL was a **404**, TuneIn and
internet-radio pointed at listings that **don't exist**, Streema was missing.

- **TuneIn: not listed.** A TuneIn API search returns zero matches despite
  Broadcaster Portal OTP logins on 24 Oct. Highest-value gap (Alexa, Sonos, cars).
- **Radio Browser: duplicate entry.** Keep `934abfbf-3482-4460-aa6d-af95247bdb5a`;
  `52243a80-7713-4392-89c0-f3bde610993b` has a dead homepage and favicon on
  `listen.nr1dnb.com` (missing hyphen) and holds more votes (35 vs 30). There is
  **no edit/delete API** — only `/json/add` and `/json/vote`. Identical removal
  requests on their GitLab (#38, #39) have sat unanswered for two months, so
  voting the correct entry up is the only practical lever.

## What's left

1. **Visa-5019 is dead** — Google Play: Suno £9.49 **due 31 Oct**, Kimi £17.49
   overdue, plus £42.97 of YouTube/Google One renewals 19–22 Nov on the same card.
   Mixcloud was already fixed.
2. **myTuner home address** — see top.
3. **TuneIn listing.**
4. **Friday** — first real `live_connect` push test.
5. **PRS application ~24 Nov** + the territory decision.
6. **Branch protection on `main`** — two agents pushed to production today.

## Gotchas

- `npm run build` is **broken on Windows** — it points Node at the bash wrapper in
  `node_modules/.bin`. Use `node node_modules/next/dist/bin/next build`.
- `jsdom` is not installed, so the two `src/hooks/__tests__` files cannot run.
- `deploy.yml` fires a Vercel deploy hook *and* Vercel's Git integration also
  builds — **every push to `main` builds twice**. The workflow is redundant.
- Tailwind v4 config lives in `src/app/globals.css` under `@theme`.
- Supabase project ref: `nsszwoccbmzjfqenkpgb`.

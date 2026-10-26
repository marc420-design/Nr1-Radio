#!/usr/bin/env node
/**
 * NR1 Radio - licensable listener hours from AzuraCast.
 *
 * Turns AzuraCast's per-connection listener log into the figure PRS for Music
 * asks for on the Internet Radio Licence application: average monthly listener
 * hours received *inside the UK*.
 *
 * PRS only licenses broadcasts received in the UK and PRS managed territories,
 * so the application wants UK hours only - not the station's total. A listener
 * hour is 60 minutes of content to one user; 60 minutes to five users is five
 * listener hours. The minimum fee (PRS, Oct 2026: GBP 199 + VAT/year) covers up
 * to 800 average monthly listener hours.
 *
 * Four classes of connection are excluded, because none of them are a person
 * listening:
 *
 *   self        - the AzuraCast host's own IP. Alexa skill tests and browser
 *                 previews run from there and geolocate to Norwich, so leaving
 *                 them in inflates the UK figure more than anything else does.
 *   bot         - anything AzuraCast flags as a crawler, plus directory probes
 *                 (OnlineRadioBox HisBot, WorldRadioScanner, Radioguide, ...)
 *                 and bare HTTP clients (python-urllib, ffmpeg/Lavf, curl).
 *   aggregator  - radio-app relay infrastructure, chiefly SimpleRadioFree, which
 *                 arrives as hundreds of short connections from hosting ranges.
 *                 Whether those are relays or real users behind a proxy, the
 *                 location is the proxy's, so they cannot be counted as UK.
 *   non-UK      - real listeners outside the UK and managed territories.
 *
 * Needs an AzuraCast API key with "View station reports" on the station:
 * AzuraCast -> My Account -> API Keys. Export it as AZURACAST_API_KEY.
 *
 * Usage:
 *   AZURACAST_API_KEY=... node scripts/listener-hours.mjs --days 30
 *   AZURACAST_API_KEY=... node scripts/listener-hours.mjs --start 2026-10-25 --end 2026-11-24
 *   AZURACAST_API_KEY=... node scripts/listener-hours.mjs --days 30 --out hours.json
 *   AZURACAST_API_KEY=... node scripts/listener-hours.mjs --days 30 --breakdown
 *
 * Note: AzuraCast only began recording per-listener rows on 2026-10-24, when the
 * analytics setting moved from no_ip to all. Earlier dates return nothing and
 * are not backfilled.
 */

import { writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (n) => args.includes('--' + n);
const arg = (n, d) => {
  const i = args.indexOf('--' + n);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};

const ORIGIN = arg('origin', 'https://radio.listen-nr1dnb.com').replace(/\/+$/, '');
const STATION = arg('station', '1');
const OUT = arg('out', null);
const BREAKDOWN = flag('breakdown');
const API_KEY = process.env.AZURACAST_API_KEY;

// The host AzuraCast runs on. Its own connections are tests, not listeners.
const SELF_IPS = (arg('self-ip', '80.193.164.130') || '').split(',').filter(Boolean);

// UK plus the PRS managed territories that matter here. Crown Dependencies and
// British Overseas Territories carry their own ISO codes, hence the long list.
const LICENSABLE = new Set(
  (arg('territories', 'GB,JE,GG,IM,GI,FK,BM,KY,VG,TC,AI,MS,SH,PN,IO,GS,CY,BS,MT') || '')
    .split(',')
    .filter(Boolean)
);

const BOT_UA =
  /bot|crawl|spider|scanner|monitor|nowplaying|hisbot|python-urllib|lavf|ffmpeg|radio-id3|gomusixy|vivaonair|audit|curl|wget|okhttp|amplitude|uptime|check/i;
const AGGREGATOR_UA = /simpleradio|streema|tunein-?probe|radio-?browser/i;

const DAY_MS = 86400000;
const iso = (d) => d.toISOString().slice(0, 10);

const DAYS = parseFloat(arg('days', '30'));
const END = arg('end', iso(new Date()));
const START = arg('start', iso(new Date(Date.parse(END) - DAYS * DAY_MS)));

function classify(row) {
  if (SELF_IPS.includes(row.ip)) return 'self';
  if (row.device?.is_bot || BOT_UA.test(row.user_agent || '')) return 'bot';
  if (AGGREGATOR_UA.test(row.user_agent || '')) return 'aggregator';
  return LICENSABLE.has(row.location?.country) ? 'licensable' : 'non-UK';
}

async function main() {
  if (!API_KEY) {
    console.error(
      'AZURACAST_API_KEY is not set. Create a key in AzuraCast -> My Account -> API Keys\n' +
        'with "View station reports" permission, then re-run with it exported.'
    );
    process.exit(1);
  }

  const url = `${ORIGIN}/api/station/${STATION}/listeners?start=${START}&end=${END}`;
  const res = await fetch(url, { headers: { 'X-API-Key': API_KEY } });
  if (!res.ok) {
    console.error(`AzuraCast returned ${res.status} ${res.statusText} for ${url}`);
    process.exit(1);
  }
  const rows = await res.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    console.error(
      `No listener rows for ${START}..${END}. Per-listener logging only starts 2026-10-24.`
    );
    process.exit(1);
  }

  // Measure the window from the data, not the requested range: a part-finished
  // day would otherwise understate the per-day rate.
  const first = Math.min(...rows.map((r) => r.connected_on));
  const last = Math.max(...rows.map((r) => r.connected_on + r.connected_time));
  const windowDays = (last - first) / 86400;

  const classes = {};
  const cities = {};
  for (const row of rows) {
    const cls = classify(row);
    const bucket = (classes[cls] ??= { connections: 0, seconds: 0, ips: new Set() });
    bucket.connections += 1;
    bucket.seconds += row.connected_time;
    bucket.ips.add(row.ip);
    if (cls === 'licensable') {
      const city = row.location?.city || 'unknown';
      cities[city] = (cities[city] || 0) + row.connected_time / 3600;
    }
  }

  const licensable = classes.licensable ?? { connections: 0, seconds: 0, ips: new Set() };
  const hours = licensable.seconds / 3600;
  const perDay = hours / windowDays;
  const monthly = perDay * 30.4;

  const report = {
    window: { start: START, end: END, days: +windowDays.toFixed(2) },
    connections: rows.length,
    licensable: {
      connections: licensable.connections,
      unique_ips: licensable.ips.size,
      hours: +hours.toFixed(2),
      hours_per_day: +perDay.toFixed(2),
    },
    prs: {
      average_monthly_listener_hours: Math.round(monthly),
      minimum_fee_allowance: 800,
      within_minimum_fee: monthly <= 800,
      headroom_x: +(800 / monthly).toFixed(1),
    },
    excluded: Object.fromEntries(
      Object.entries(classes)
        .filter(([cls]) => cls !== 'licensable')
        .map(([cls, b]) => [cls, { connections: b.connections, hours: +(b.seconds / 3600).toFixed(2) }])
    ),
    top_cities: Object.entries(cities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([city, h]) => ({ city, hours: +h.toFixed(2) })),
  };

  console.log(`Window            ${START} .. ${END}  (${report.window.days} days of data)`);
  console.log(`Connections       ${rows.length}`);
  console.log(
    `Licensable        ${report.licensable.hours}h over ${report.licensable.connections} connections ` +
      `from ${report.licensable.unique_ips} unique IPs`
  );
  console.log(`Per day           ${report.licensable.hours_per_day}h`);
  console.log('');
  console.log(`PRS figure        ${report.prs.average_monthly_listener_hours} average monthly listener hours`);
  console.log(
    `Minimum fee       ${report.prs.within_minimum_fee ? 'yes' : 'NO - above the 800-hour allowance'}` +
      (report.prs.within_minimum_fee ? ` (${report.prs.headroom_x}x headroom)` : '')
  );
  console.log('');
  console.log('Excluded:');
  for (const [cls, b] of Object.entries(report.excluded)) {
    console.log(`  ${cls.padEnd(12)} ${String(b.hours).padStart(8)}h  ${b.connections} connections`);
  }

  if (BREAKDOWN) {
    console.log('');
    console.log('Licensable hours by city:');
    for (const { city, hours: h } of report.top_cities) {
      console.log(`  ${city.padEnd(24)} ${String(h).padStart(7)}h`);
    }
  }

  if (OUT) {
    writeFileSync(OUT, JSON.stringify(report, null, 2));
    console.log('');
    console.log(`Wrote ${OUT}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

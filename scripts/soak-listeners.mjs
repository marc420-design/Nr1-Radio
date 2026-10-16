#!/usr/bin/env node
/**
 * NR1 Radio - global listener soak test.
 *
 * Spawns N virtual listeners, each tagged with a region profile, and makes each
 * one behave like a real browser on the Listen page for the whole run:
 *
 *   - loads an HTML page (and navigates to another one every ~5 min)
 *   - holds an SSE connection to /api/sse, reconnecting when it drops
 *   - polls /api/nowplaying every 15s     (mirrors useNowPlaying)
 *   - polls /api/listener-stats every 60s (mirrors useListenerStats)
 *   - holds one continuous MP3 stream connection, reading bytes
 *
 * A watcher polls AzuraCast's own nowplaying endpoint so we can cross-check
 * whether the station actually registers the connections.
 *
 * All traffic leaves from one IP: the region profiles shape headers and timing,
 * not network paths. This measures concurrency, connection limits and sustained
 * bandwidth - not real per-country latency.
 *
 * Usage:
 *   node scripts/soak-listeners.mjs --minutes 20 --listeners 20 --out report.json
 *   node scripts/soak-listeners.mjs --minutes 0.5 --listeners 2    # smoke test
 */

import { writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (n) => args.includes('--' + n);
const arg = (n, d) => {
  const i = args.indexOf('--' + n);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};

const MINUTES = parseFloat(arg('minutes', '20'));
const N = parseInt(arg('listeners', '20'), 10);
const SITE = arg('site', 'https://listen-nr1dnb.com').replace(/\/+$/, '');
const ORIGIN = arg('origin', 'https://radio.listen-nr1dnb.com').replace(/\/+$/, '');
const CDN = arg('cdn', 'https://nr1-radio.b-cdn.net').replace(/\/+$/, '');
const SHORTCODE = arg('shortcode', 'nr1_dnb_radio');
const RAMP_S = parseFloat(arg('ramp', String(Math.min(60, MINUTES * 60 * 0.08))));
const OUT = arg('out', null);
const NO_AUDIO = flag('no-audio');
// The Bunny pull zone is not configured in production (the live player points at
// the AzuraCast origin), so every listener uses the origin unless asked otherwise.
const SPLIT_CDN = flag('split-cdn');

const DURATION_MS = MINUTES * 60000;
const START = Date.now();
const DEADLINE = START + DURATION_MS;

// --- region profiles --------------------------------------------------------
const UA = {
  winChrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  macSafari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15',
  iphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1',
  android:
    'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
  firefox: 'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
};

const REGIONS = [
  { city: 'London', cc: 'GB', tz: 'Europe/London', lang: 'en-GB,en;q=0.9', ua: 'winChrome' },
  { city: 'Manchester', cc: 'GB', tz: 'Europe/London', lang: 'en-GB,en;q=0.9', ua: 'iphone' },
  { city: 'Dublin', cc: 'IE', tz: 'Europe/Dublin', lang: 'en-IE,en;q=0.9', ua: 'android' },
  { city: 'Amsterdam', cc: 'NL', tz: 'Europe/Amsterdam', lang: 'nl-NL,nl;q=0.9,en;q=0.7', ua: 'winChrome' },
  { city: 'Berlin', cc: 'DE', tz: 'Europe/Berlin', lang: 'de-DE,de;q=0.9,en;q=0.7', ua: 'firefox' },
  { city: 'Paris', cc: 'FR', tz: 'Europe/Paris', lang: 'fr-FR,fr;q=0.9,en;q=0.7', ua: 'macSafari' },
  { city: 'Madrid', cc: 'ES', tz: 'Europe/Madrid', lang: 'es-ES,es;q=0.9,en;q=0.7', ua: 'android' },
  { city: 'Stockholm', cc: 'SE', tz: 'Europe/Stockholm', lang: 'sv-SE,sv;q=0.9,en;q=0.8', ua: 'winChrome' },
  { city: 'Warsaw', cc: 'PL', tz: 'Europe/Warsaw', lang: 'pl-PL,pl;q=0.9,en;q=0.7', ua: 'iphone' },
  { city: 'New York', cc: 'US', tz: 'America/New_York', lang: 'en-US,en;q=0.9', ua: 'macSafari' },
  { city: 'Chicago', cc: 'US', tz: 'America/Chicago', lang: 'en-US,en;q=0.9', ua: 'winChrome' },
  { city: 'Los Angeles', cc: 'US', tz: 'America/Los_Angeles', lang: 'en-US,en;q=0.9', ua: 'android' },
  { city: 'Toronto', cc: 'CA', tz: 'America/Toronto', lang: 'en-CA,en;q=0.9,fr;q=0.6', ua: 'winChrome' },
  { city: 'Mexico City', cc: 'MX', tz: 'America/Mexico_City', lang: 'es-MX,es;q=0.9,en;q=0.6', ua: 'android' },
  { city: 'Sao Paulo', cc: 'BR', tz: 'America/Sao_Paulo', lang: 'pt-BR,pt;q=0.9,en;q=0.6', ua: 'iphone' },
  { city: 'Johannesburg', cc: 'ZA', tz: 'Africa/Johannesburg', lang: 'en-ZA,en;q=0.9', ua: 'winChrome' },
  { city: 'Lagos', cc: 'NG', tz: 'Africa/Lagos', lang: 'en-NG,en;q=0.9', ua: 'android' },
  { city: 'Dubai', cc: 'AE', tz: 'Asia/Dubai', lang: 'ar-AE,ar;q=0.9,en;q=0.8', ua: 'iphone' },
  { city: 'Mumbai', cc: 'IN', tz: 'Asia/Kolkata', lang: 'en-IN,en;q=0.9,hi;q=0.7', ua: 'android' },
  { city: 'Singapore', cc: 'SG', tz: 'Asia/Singapore', lang: 'en-SG,en;q=0.9', ua: 'macSafari' },
  { city: 'Tokyo', cc: 'JP', tz: 'Asia/Tokyo', lang: 'ja-JP,ja;q=0.9,en;q=0.7', ua: 'winChrome' },
  { city: 'Sydney', cc: 'AU', tz: 'Australia/Sydney', lang: 'en-AU,en;q=0.9', ua: 'iphone' },
  { city: 'Auckland', cc: 'NZ', tz: 'Pacific/Auckland', lang: 'en-NZ,en;q=0.9', ua: 'android' },
];

const PAGES = ['/', '/listen', '/schedule', '/djs', '/shows', '/events', '/about'];

// --- stats ------------------------------------------------------------------
const http = new Map(); // label -> bucket
const vlisteners = []; // per-virtual-listener record
const station = []; // AzuraCast self-reported listener counts
const incidents = []; // notable events, timestamped

const minuteOf = (t) => Math.floor((t - START) / 60000);
const el = (t = Date.now()) => ((t - START) / 1000).toFixed(1);

function bucket(label) {
  let b = http.get(label);
  if (!b) {
    b = { label, n: 0, ok: 0, errors: 0, byStatus: {}, lat: [], perMin: new Map(), byRegion: new Map() };
    http.set(label, b);
  }
  return b;
}

function record(label, ms, status, region) {
  const b = bucket(label);
  b.n++;
  const key = String(status);
  b.byStatus[key] = (b.byStatus[key] || 0) + 1;
  const good = typeof status === 'number' && status >= 200 && status < 400;
  if (good) {
    b.ok++;
    b.lat.push(ms);
  } else {
    b.errors++;
  }
  const m = minuteOf(Date.now());
  const pm = b.perMin.get(m) || { n: 0, errors: 0, lat: [] };
  pm.n++;
  if (good) pm.lat.push(ms);
  else pm.errors++;
  b.perMin.set(m, pm);
  if (region) {
    const r = b.byRegion.get(region) || { n: 0, errors: 0, lat: [] };
    r.n++;
    if (good) r.lat.push(ms);
    else r.errors++;
    b.byRegion.set(region, r);
  }
}

function note(kind, msg) {
  incidents.push({ at: el(), kind, msg });
  if (incidents.length <= 500) console.log('[' + el() + 's] ' + kind + ': ' + msg);
}

const pct = (a, p) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  return Math.round(s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]);
};
const mean = (a) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null);
const maxOf = (a) => (a.length ? Math.round(a.reduce((x, y) => (y > x ? y : x), 0)) : null);
const jitter = (ms, f = 0.25) => ms * (1 - f + Math.random() * 2 * f);
const sleep = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms)));
const left = () => DEADLINE - Date.now();
const nap = (ms) => sleep(Math.min(ms, Math.max(0, left())));

function headersFor(p, extra = {}) {
  return {
    'User-Agent': UA[p.ua],
    'Accept-Language': p.lang,
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    ...extra,
  };
}

// --- one HTTP request -------------------------------------------------------
async function get(url, { label, profile, headers = {}, timeout = 15000, drain = true }) {
  const t0 = performance.now();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: headersFor(profile, headers),
      signal: ac.signal,
      redirect: 'follow',
    });
    if (drain) {
      try {
        await res.arrayBuffer();
      } catch {
        /* body cut short */
      }
    }
    const ms = performance.now() - t0;
    record(label, ms, res.status, profile.city);
    if (res.status >= 400) note('http-error', label + ' -> ' + res.status + ' (' + profile.city + ')');
    return { status: res.status, ms };
  } catch (e) {
    const ms = performance.now() - t0;
    const kind = e.name === 'AbortError' ? 'timeout' : e.cause?.code || e.code || e.name || 'network';
    record(label, ms, kind, profile.city);
    note('http-fail', label + ' -> ' + kind + ' after ' + Math.round(ms) + 'ms (' + profile.city + ')');
    return { status: kind, ms };
  } finally {
    clearTimeout(timer);
  }
}

// --- per-listener tasks -----------------------------------------------------
async function pageTask(p) {
  let i = 0;
  while (left() > 0) {
    const path = i === 0 ? '/listen' : PAGES[Math.floor(Math.random() * PAGES.length)];
    await get(SITE + path, {
      label: i === 0 ? 'page /listen (entry)' : 'page navigation',
      profile: p,
    });
    i++;
    await nap(jitter(5 * 60000)); // a navigation roughly every 5 min
  }
}

async function nowPlayingTask(p) {
  await nap(jitter(2000, 1)); // spread the herd
  while (left() > 0) {
    await get(SITE + '/api/nowplaying', { label: 'api /api/nowplaying', profile: p });
    await nap(jitter(15000, 0.15)); // useNowPlaying: 15s
  }
}

async function statsTask(p) {
  await nap(jitter(5000, 1));
  while (left() > 0) {
    await get(SITE + '/api/listener-stats', { label: 'api /api/listener-stats', profile: p });
    await nap(jitter(60000, 0.15)); // useListenerStats: 60s
  }
}

async function sseTask(p, L) {
  while (left() > 0) {
    const t0 = performance.now();
    const ac = new AbortController();
    const kill = setTimeout(() => ac.abort(), Math.max(1000, left()));
    let upAt = null;
    try {
      const res = await fetch(SITE + '/api/sse?shortcode=' + SHORTCODE, {
        headers: headersFor(p, { Accept: 'text/event-stream' }),
        signal: ac.signal,
      });
      record('sse connect', performance.now() - t0, res.status, p.city);
      if (!res.ok || !res.body) {
        L.sse.failures++;
        note('sse-error', 'connect -> ' + res.status + ' (' + p.city + ')');
        await nap(jitter(5000));
        continue;
      }
      L.sse.connects++;
      upAt = Date.now();
      const dec = new TextDecoder();
      let buf = '';
      for await (const chunk of res.body) {
        buf += dec.decode(chunk, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) if (line.startsWith('data:')) L.sse.messages++;
        if (left() <= 0) break;
      }
      const heldMs = Date.now() - upAt;
      L.sse.upMs += heldMs;
      upAt = null;
      if (left() > 0) {
        L.sse.drops++;
        note('sse-drop', 'stream ended after ' + (heldMs / 1000).toFixed(0) + 's (' + p.city + ')');
      }
    } catch (e) {
      if (e.name !== 'AbortError' || left() > 1500) {
        L.sse.failures++;
        note('sse-fail', (e.cause?.code || e.name) + ' (' + p.city + ')');
      }
    } finally {
      clearTimeout(kill);
      // the run deadline aborts mid-read, so bank the time held open
      if (upAt !== null) L.sse.upMs += Date.now() - upAt;
    }
    await nap(jitter(3000)); // browser EventSource retry
  }
}

async function streamTask(p, L) {
  if (NO_AUDIO) return;
  const base = L.streamVia === 'cdn' ? CDN : ORIGIN;
  const url = base + '/listen/' + SHORTCODE + '/radio.mp3';
  L.stream.url = url;

  while (left() > 0) {
    const ac = new AbortController();
    const kill = setTimeout(() => ac.abort(), Math.max(1000, left()));
    const t0 = performance.now();
    let openedAt = null;
    try {
      const res = await fetch(url, {
        headers: headersFor(p, { Accept: 'audio/mpeg, */*', 'Icy-MetaData': '1' }),
        signal: ac.signal,
      });
      const ttfb = performance.now() - t0;
      record('stream connect (' + L.streamVia + ')', ttfb, res.status, p.city);
      if (!res.ok || !res.body) {
        L.stream.failures++;
        note('stream-error', 'connect -> ' + res.status + ' (' + p.city + ' via ' + L.streamVia + ')');
        await nap(jitter(5000));
        continue;
      }
      L.stream.connects++;
      if (L.stream.ttfbMs === null) L.stream.ttfbMs = Math.round(ttfb);
      openedAt = Date.now();
      let last = Date.now();
      for await (const chunk of res.body) {
        const now = Date.now();
        const gap = now - last;
        if (gap > 2000) {
          L.stream.stalls++;
          L.stream.worstStallMs = Math.max(L.stream.worstStallMs, gap);
          note('stream-stall', (gap / 1000).toFixed(1) + 's gap (' + p.city + ' via ' + L.streamVia + ')');
        }
        last = now;
        L.stream.bytes += chunk.length;
        if (left() <= 0) break;
      }
      const heldMs = Date.now() - openedAt;
      L.stream.upMs += heldMs;
      openedAt = null;
      if (left() > 0) {
        L.stream.drops++;
        note('stream-drop', 'closed after ' + (heldMs / 1000).toFixed(0) + 's (' + p.city + ' via ' + L.streamVia + ')');
      }
    } catch (e) {
      if (e.name !== 'AbortError' || left() > 1500) {
        L.stream.failures++;
        note('stream-fail', (e.cause?.code || e.name) + ' (' + p.city + ' via ' + L.streamVia + ')');
      }
    } finally {
      clearTimeout(kill);
      // the run deadline aborts mid-read, so bank the time held open
      if (openedAt !== null) L.stream.upMs += Date.now() - openedAt;
    }
    await nap(jitter(2000));
  }
}

// --- station-side watcher ---------------------------------------------------
async function stationWatcher() {
  const p = REGIONS[0];
  while (left() > 0) {
    const t0 = performance.now();
    try {
      const res = await fetch(ORIGIN + '/api/nowplaying/' + SHORTCODE, {
        headers: headersFor(p),
        signal: AbortSignal.timeout(10000),
      });
      const ms = performance.now() - t0;
      record('azuracast /api/nowplaying (origin)', ms, res.status, null);
      if (res.ok) {
        const d = await res.json();
        station.push({
          at: el(),
          min: minuteOf(Date.now()),
          current: d?.listeners?.current ?? null,
          unique: d?.listeners?.unique ?? null,
          total: d?.listeners?.total ?? null,
          online: d?.is_online ?? null,
          song: d?.now_playing?.song?.text ?? null,
          bitrate: d?.station?.mounts?.[0]?.bitrate ?? null,
        });
      }
    } catch (e) {
      record(
        'azuracast /api/nowplaying (origin)',
        performance.now() - t0,
        e.name === 'TimeoutError' ? 'timeout' : e.cause?.code || e.name,
        null
      );
    }
    await nap(30000);
  }
}

// --- report -----------------------------------------------------------------
function buildReport() {
  const endpoints = [...http.values()]
    .map((b) => ({
      label: b.label,
      requests: b.n,
      ok: b.ok,
      errors: b.errors,
      errorRate: b.n ? +((100 * b.errors) / b.n).toFixed(2) : 0,
      byStatus: b.byStatus,
      latency: {
        mean: mean(b.lat),
        p50: pct(b.lat, 50),
        p90: pct(b.lat, 90),
        p99: pct(b.lat, 99),
        max: maxOf(b.lat),
      },
      perMinute: [...b.perMin.entries()]
        .sort((a, c) => a[0] - c[0])
        .map(([m, v]) => ({ min: m, n: v.n, errors: v.errors, p50: pct(v.lat, 50), p90: pct(v.lat, 90) })),
      byRegion: [...b.byRegion.entries()]
        .sort((a, c) => (pct(c[1].lat, 50) ?? 0) - (pct(a[1].lat, 50) ?? 0))
        .map(([city, v]) => ({ city, n: v.n, errors: v.errors, p50: pct(v.lat, 50), p90: pct(v.lat, 90) })),
    }))
    .sort((a, b) => b.requests - a.requests);

  const runMs = Math.min(Date.now(), DEADLINE) - START;
  const perListener = vlisteners.map((L) => {
    const activeMs = Math.max(1, runMs - L.joinedAt * 1000);
    return {
      city: L.profile.city,
      cc: L.profile.cc,
      device: L.profile.ua,
      via: L.streamVia,
      joinedAtS: L.joinedAt,
      stream: {
        mb: +(L.stream.bytes / 1048576).toFixed(1),
        kbps: L.stream.upMs ? +((L.stream.bytes * 8) / L.stream.upMs).toFixed(1) : 0,
        upPct: +((100 * L.stream.upMs) / activeMs).toFixed(1),
        ttfbMs: L.stream.ttfbMs,
        connects: L.stream.connects,
        drops: L.stream.drops,
        stalls: L.stream.stalls,
        worstStallMs: L.stream.worstStallMs || 0,
        failures: L.stream.failures,
      },
      sse: {
        messages: L.sse.messages,
        connects: L.sse.connects,
        drops: L.sse.drops,
        failures: L.sse.failures,
        upPct: +((100 * L.sse.upMs) / activeMs).toFixed(1),
      },
    };
  });

  const totals = {
    requests: endpoints.reduce((s, e) => s + e.requests, 0),
    errors: endpoints.reduce((s, e) => s + e.errors, 0),
    streamMB: +(vlisteners.reduce((s, L) => s + L.stream.bytes, 0) / 1048576).toFixed(1),
    streamDrops: vlisteners.reduce((s, L) => s + L.stream.drops, 0),
    streamStalls: vlisteners.reduce((s, L) => s + L.stream.stalls, 0),
    streamFailures: vlisteners.reduce((s, L) => s + L.stream.failures, 0),
    sseMessages: vlisteners.reduce((s, L) => s + L.sse.messages, 0),
    sseDrops: vlisteners.reduce((s, L) => s + L.sse.drops, 0),
    sseFailures: vlisteners.reduce((s, L) => s + L.sse.failures, 0),
  };
  totals.errorRate = totals.requests ? +((100 * totals.errors) / totals.requests).toFixed(2) : 0;

  return {
    config: {
      site: SITE,
      origin: ORIGIN,
      cdn: CDN,
      shortcode: SHORTCODE,
      listeners: N,
      minutes: MINUTES,
      rampSeconds: RAMP_S,
      audio: !NO_AUDIO,
    },
    startedAt: new Date(START).toISOString(),
    runSeconds: Math.round(runMs / 1000),
    totals,
    endpoints,
    perListener,
    stationReported: station,
    stationPeakListeners: station.length ? Math.max(...station.map((s) => s.current ?? 0)) : null,
    incidents,
    caveat:
      'All traffic originated from a single IP; region profiles shape headers and timing, not network path. Geographic latency is NOT measured.',
  };
}

function printReport(r) {
  const line = (s = '') => console.log(s);
  line();
  line('='.repeat(90));
  line('NR1 RADIO SOAK TEST - ' + r.config.listeners + ' listeners, ' + r.runSeconds + 's (' + (r.runSeconds / 60).toFixed(1) + ' min)');
  line('target ' + r.config.site + '  |  origin ' + r.config.origin + '  |  cdn ' + r.config.cdn);
  line('='.repeat(90));
  line();
  line('Requests ' + r.totals.requests + '   errors ' + r.totals.errors + ' (' + r.totals.errorRate + '%)');
  line('Audio pulled ' + r.totals.streamMB + ' MB   stream drops ' + r.totals.streamDrops + '   stalls ' + r.totals.streamStalls + '   connect failures ' + r.totals.streamFailures);
  line('SSE messages ' + r.totals.sseMessages + '   sse drops ' + r.totals.sseDrops + '   sse failures ' + r.totals.sseFailures);
  line('AzuraCast peak self-reported listeners: ' + r.stationPeakListeners);
  line();
  line('ENDPOINT                                     REQ    ERR     p50     p90     p99     max');
  line('-'.repeat(90));
  for (const e of r.endpoints) {
    const L = e.latency;
    line(
      e.label.padEnd(40).slice(0, 40) +
        String(e.requests).padStart(7) +
        (e.errorRate + '%').padStart(7) +
        String(L.p50 ?? '-').padStart(8) +
        String(L.p90 ?? '-').padStart(8) +
        String(L.p99 ?? '-').padStart(8) +
        String(L.max ?? '-').padStart(8)
    );
    const bad = Object.entries(e.byStatus).filter(([k]) => !/^2|^3/.test(k));
    if (bad.length) line(''.padEnd(41) + 'non-2xx: ' + bad.map(([k, v]) => k + ' x' + v).join(', '));
  }
  line();
  line('PER LISTENER (stream)                        MB    kbps    up%    ttfb   drops  stalls   SSEmsg  SSEup%');
  line('-'.repeat(100));
  for (const L of r.perListener) {
    line(
      (L.city + ' (' + L.cc + ') ' + L.via).padEnd(38).slice(0, 38) +
        String(L.stream.mb).padStart(8) +
        String(L.stream.kbps).padStart(8) +
        String(L.stream.upPct).padStart(7) +
        String(L.stream.ttfbMs ?? '-').padStart(8) +
        String(L.stream.drops).padStart(8) +
        String(L.stream.stalls).padStart(8) +
        String(L.sse.messages).padStart(9) +
        String(L.sse.upPct).padStart(8)
    );
  }
  line();
  line('STATION-REPORTED LISTENERS OVER TIME (seconds:count)');
  line(r.stationReported.map((s) => s.at + 's:' + s.current).join('  ') || '(none)');
  line();
  if (r.incidents.length) {
    line('INCIDENTS (' + r.incidents.length + ' total, showing non-join, first 60)');
    const notable = r.incidents.filter((i) => i.kind !== 'join');
    if (!notable.length) line('  none beyond listener joins');
    for (const i of notable.slice(0, 60)) line('  [' + i.at + 's] ' + i.kind + ': ' + i.msg);
  } else line('INCIDENTS: none');
  line();
  line('CAVEAT: ' + r.caveat);
  line('='.repeat(90));
}

function finish(code = 0) {
  const r = buildReport();
  printReport(r);
  if (OUT) {
    writeFileSync(OUT, JSON.stringify(r, null, 2));
    console.log('\nJSON report: ' + OUT);
  }
  process.exit(code);
}

// --- main -------------------------------------------------------------------
process.on('SIGINT', () => {
  note('abort', 'SIGINT - dumping partial report');
  finish(130);
});

console.log(
  'NR1 soak: ' + N + ' listeners for ' + MINUTES + ' min against ' + SITE + ' (ramp ' + RAMP_S + 's, audio ' + !NO_AUDIO + ')'
);

const tasks = [stationWatcher()];
for (let i = 0; i < N; i++) {
  const profile = REGIONS[i % REGIONS.length];
  const L = {
    profile,
    streamVia: SPLIT_CDN && i % 2 === 0 ? 'cdn' : 'origin',
    joinedAt: 0,
    stream: { bytes: 0, upMs: 0, connects: 0, drops: 0, stalls: 0, failures: 0, worstStallMs: 0, ttfbMs: null, url: null },
    sse: { messages: 0, connects: 0, drops: 0, failures: 0, upMs: 0 },
  };
  vlisteners.push(L);
  const delay = (RAMP_S * 1000 * i) / Math.max(1, N - 1);
  tasks.push(
    (async () => {
      await sleep(delay);
      L.joinedAt = +el();
      note('join', profile.city + ' (' + profile.cc + ') via ' + L.streamVia);
      await Promise.allSettled([
        pageTask(profile),
        nowPlayingTask(profile),
        statsTask(profile),
        sseTask(profile, L),
        streamTask(profile, L),
      ]);
    })()
  );
}

await Promise.allSettled(tasks);
finish(0);

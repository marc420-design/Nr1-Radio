import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

function readEnv(filePath) {
  const env = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=("?)(.*)\2$/);
    if (match) env[match[1]] = match[3];
  }
  return env;
}

function durationMinutes(seconds) {
  return Math.round((Number(seconds || 0) / 60) * 10) / 10;
}

function dateFromPath(path, title) {
  const value = `${path} ${title}`;
  const match = value.match(/(20\d{2})[-_](\d{2})[-_](\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}T00:00:00+00:00`;
}

function timestampToIso(timestamp) {
  const value = Number(timestamp);
  if (!Number.isFinite(value) || value <= 0) return null;
  return new Date(value * 1000).toISOString();
}

function fallbackLineup(media) {
  if (media.artist && media.artist !== 'NR1 DNB Radio') return media.artist;
  return 'NR1 DNB Radio';
}

const env = {
  ...readEnv('E:/NR1 RADIO/nr1-radio/.env.local'),
  ...readEnv('E:/NR1 RADIO/nr1-radio/.env.vercel'),
};
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const azuraHeaders = {
  'X-API-Key': env.AZURACAST_API_KEY,
  Accept: 'application/json',
};

const filesRes = await fetch(`${env.NEXT_PUBLIC_AZURACAST_BASE_URL}/api/station/1/files/list?currentDirectory=&searchPhrase=`, {
  headers: azuraHeaders,
});
if (!filesRes.ok) throw new Error(`AzuraCast files failed: HTTP ${filesRes.status}`);
const files = await filesRes.json();
const mediaFiles = files.filter((file) => file.media);

const showRows = mediaFiles.map((file) => {
  const media = file.media;
  return {
    youtube_id: `azuracast-${media.id}`,
    title: media.title || file.text || file.path,
    lineup: fallbackLineup(media),
    duration_min: durationMinutes(media.length),
    lufs: null,
    clipping_status: null,
    azuracast_id: media.id,
    azuracast_path: media.path || file.path,
    uploaded_at: dateFromPath(media.path || file.path, media.title) || timestampToIso(media.uploaded_at),
    description: media.album || null,
  };
});

const { error: showsError } = await supabase
  .from('shows')
  .upsert(showRows, { onConflict: 'youtube_id' });
if (showsError) throw showsError;

const { error: clearScheduleError } = await supabase
  .from('schedule')
  .delete()
  .neq('show_name', '__never__');
if (clearScheduleError) throw clearScheduleError;

const scheduleRows = [
  { show_name: 'NR1 7 Day All', dj_name: 'Full NR1 archive rotation', day_of_week: 0, start_time: '00:00', end_time: '23:59', show_type: 'replay' },
  { show_name: 'NR1 7 Day All', dj_name: 'Full NR1 archive rotation', day_of_week: 1, start_time: '00:00', end_time: '23:59', show_type: 'replay' },
  { show_name: 'NR1 7 Day All', dj_name: 'Full NR1 archive rotation', day_of_week: 2, start_time: '00:00', end_time: '23:59', show_type: 'replay' },
  { show_name: 'NR1 7 Day All', dj_name: 'Full NR1 archive rotation', day_of_week: 3, start_time: '00:00', end_time: '23:59', show_type: 'replay' },
  { show_name: 'NR1 7 Day All', dj_name: 'Full NR1 archive rotation', day_of_week: 4, start_time: '00:00', end_time: '23:59', show_type: 'replay' },
  { show_name: 'NR1 New Sets 2026', dj_name: '2026 uploaded sets block', day_of_week: 5, start_time: '01:00', end_time: '23:59', show_type: 'special' },
  { show_name: 'NR1 New Sets 2026', dj_name: '2026 uploaded sets block', day_of_week: 6, start_time: '00:00', end_time: '22:47', show_type: 'special' },
];

const { error: scheduleError } = await supabase.from('schedule').insert(scheduleRows);
if (scheduleError) throw scheduleError;

console.log(JSON.stringify({
  azuracast_media: mediaFiles.length,
  shows_upserted: showRows.length,
  schedule_inserted: scheduleRows.length,
}, null, 2));

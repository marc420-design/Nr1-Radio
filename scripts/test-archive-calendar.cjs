const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function load(relative) {
  const filename = path.join(root, relative);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  const req = id => id.startsWith('@/') ? (id.endsWith('.json') ? require(path.join(root, 'src', id.slice(2))) : load('src/' + id.slice(2) + '.ts')) : require(id);
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { console, Date, Intl, Map, Set })(req, module, module.exports);
  return module.exports;
}
const archive = load('src/lib/archive.ts');
const schedule = load('src/lib/schedule.ts');
const programming = load('src/lib/programming.ts');
const catalog = require('../src/data/archive-catalog.json');
const rows = Object.entries(catalog).flatMap(([filename, source]) => [
  { id: 'current-' + source.mediaId, azuracast_id: source.mediaId, azuracast_path: filename, title: 'Old title', lineup: 'Old names', uploaded_at: '2026-09-04T00:00:00Z', youtube_id: null, bunny_video_id: null, tracklist: null },
  { id: 'duplicate-' + source.mediaId, azuracast_id: -source.mediaId, azuracast_path: filename, title: 'Duplicate', lineup: 'Old names', uploaded_at: null, youtube_id: null, bunny_video_id: null, tracklist: null },
]);
const cleaned = archive.prepareArchive(rows);
assert.equal(cleaned.length, 285, 'One card per recording');
const nexus = cleaned.find(s => s.azuracast_path.includes('fj2vomiv5ww'));
assert.equal(nexus.lineup, 'NEXUS-D, MC NOVA, MC SICKA, PULSE');
assert.equal(archive.getArchiveDate(nexus).value, '2023-07-14');
assert.equal(archive.getArchiveDate(nexus).label, 'Published');
const recorded = cleaned.find(s => s.azuracast_path.startsWith('2018_10_17'));
assert.equal(archive.getArchiveDate(recorded).value, '2018-10-17');
assert.equal(archive.getArchiveDate(recorded).label, 'Recorded');
const undated = cleaned.find(s => s.azuracast_path === 'dj_tuff_kuts.mp3');
assert.equal(archive.getArchiveDate(undated), null, 'Import date is not show date');
assert.equal(schedule.londonStart('2026-10-24', '18:00:00').toISOString(), '2026-10-24T17:00:00.000Z');
assert.equal(schedule.londonStart('2026-10-25', '18:00:00').toISOString(), '2026-10-25T18:00:00.000Z');
assert.equal(schedule.londonStart('2026-03-29', '18:00:00').toISOString(), '2026-03-29T17:00:00.000Z');
assert.equal(schedule.weekMonday(new Date('2026-10-11T23:30:00Z')), '2026-10-12');
const slot = { id: 'a', show_name: 'Friday sessions', day_of_week: 4, start_time: '18:00:00', end_time: '22:00:00' };
assert.equal(schedule.getNextScheduledShow([slot], new Date('2026-10-23T17:00:01Z')).startsAt.toISOString(), '2026-10-30T18:00:00.000Z');
assert.equal(schedule.getNextScheduledShow([{ ...slot, show_name: 'NR1 7 Day All' }]), null);
assert.equal(schedule.addCalendarDays('2026-12-28', 6), '2027-01-03');
assert.equal(programming.programmeYear('2026-10-09'), null);
assert.equal(programming.programmeYear('2026-10-10'), 2026);
assert.equal(programming.programmeYear('2026-10-11'), 2026);
assert.equal(programming.programmeYear('2026-10-12'), 2018);
assert.equal(programming.programmeYear('2026-10-16'), 2022);
assert.equal(programming.programmeYear('2026-10-19'), 2023);
assert.equal(programming.programmeYear('2026-10-21'), 2025);
assert.equal(programming.programmeYear('2026-10-22'), 2018);
assert.equal(archive.featuredScore({title:'Set',lineup:'DJ Rinze / MC DNA, So-Low'}), 3);
assert.equal(archive.featuredScore({title:'Set',lineup:'Rinzer / Spinal DNAx'}), 0);
console.log('PASS: archive deduplication, verified lineups, date provenance, undated imports, UK midnight, DST changes, week rollover and next-show filtering.');

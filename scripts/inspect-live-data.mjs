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

const env = readEnv('E:/NR1 RADIO/nr1-radio/.env.vercel');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

for (const table of ['schedule', 'shows', 'djs']) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) {
    console.log(`${table} ERROR ${error.message}`);
    continue;
  }
  console.log(`\nTABLE ${table} COUNT ${data.length}`);
  console.log(JSON.stringify(data.slice(0, 80), null, 2));
}

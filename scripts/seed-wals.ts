/**
 * seed-wals.ts
 *
 * Fetches the WALS CLDF languages.csv and:
 *   1. Updates languages.wals_code where currently NULL (~2,600 languages)
 *   2. Upserts reference_identifiers rows (system_name='WALS')
 *
 * Matches by Glottolog code — WALS CLDF includes a Glottocode column.
 * Safe to re-run: wals_code only filled where NULL; reference_identifiers
 * has a UNIQUE index on (language_id, system_name, identifier).
 *
 * Source: https://github.com/cldf-datasets/wals (CC BY 4.0)
 */

import { supabase } from './lib/supabase';

const WALS_CSV_URL =
  'https://raw.githubusercontent.com/cldf-datasets/wals/master/cldf/languages.csv';
const SOURCE_ID = '11111111-0000-0000-0000-000000000003';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && !inQuotes) {
      inQuotes = true;
    } else if (ch === '"' && inQuotes) {
      if (line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = false;
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

async function main() {
  const { error: srcErr } = await supabase.from('sources').upsert({
    id: SOURCE_ID,
    name: 'WALS (World Atlas of Language Structures)',
    type: 'academic',
    url: 'https://github.com/cldf-datasets/wals',
    reliability_rating: 'high',
    notes: 'WALS CLDF release. Structural typology database covering ~2,600 languages. CC BY 4.0.',
  }, { onConflict: 'id' });
  if (srcErr) throw new Error(`Source upsert failed: ${srcErr.message}`);

  console.log('Fetching WALS CLDF languages.csv...');
  const res = await fetch(WALS_CSV_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const text = await res.text();

  const lines = text.split('\n');
  const headers = parseCSVLine(lines[0] ?? '');

  const idx = {
    id: headers.indexOf('ID'),
    glottocode: headers.indexOf('Glottocode'),
    name: headers.indexOf('Name'),
  };

  if (idx.id === -1) throw new Error(`No 'ID' column found. Headers: ${headers.join(', ')}`);
  if (idx.glottocode === -1) throw new Error(`No 'Glottocode' column found. Headers: ${headers.join(', ')}`);

  const walsMap = new Map<string, { code: string; name: string }>(); // glottocode → {wals_code, name}
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;
    const cols = parseCSVLine(line);
    const walsCode = cols[idx.id]?.trim();
    const glottocode = cols[idx.glottocode]?.trim();
    const name = cols[idx.name]?.trim() ?? '';
    if (walsCode && glottocode) {
      walsMap.set(glottocode, { code: walsCode, name });
    }
  }
  console.log(`Parsed ${walsMap.size} WALS entries with Glottocodes\n`);

  // Fetch all DB languages (paginated)
  console.log('Loading languages from database...');
  const DB_PAGE = 1000;
  const languages: Array<{ id: string; glottocode: string }> = [];
  for (let from = 0; ; from += DB_PAGE) {
    const { data, error } = await supabase
      .from('languages')
      .select('id, glottocode')
      .range(from, from + DB_PAGE - 1);
    if (error) throw new Error(`DB fetch: ${error.message}`);
    if (!data?.length) break;
    languages.push(...data);
    if (data.length < DB_PAGE) break;
  }
  console.log(`${languages.length} languages in DB\n`);

  let walsUpdated = 0;
  let refInserted = 0;
  let errors = 0;
  let matched = 0;

  for (const lang of languages) {
    const entry = walsMap.get(lang.glottocode);
    if (!entry) continue;
    matched++;

    // Update wals_code only where currently NULL
    const { error: upErr } = await supabase
      .from('languages')
      .update({ wals_code: entry.code })
      .eq('id', lang.id)
      .is('wals_code', null);
    if (!upErr) walsUpdated++;

    // Upsert reference identifier
    const { error: refErr } = await supabase
      .from('reference_identifiers')
      .upsert({
        language_id: lang.id,
        system_name: 'WALS',
        identifier: entry.code,
        url: `https://wals.info/languoid/lect/wals_code_${entry.code.toLowerCase()}`,
      }, { onConflict: 'language_id,system_name,identifier' });

    if (!refErr) refInserted++;
    else { errors++; }

    process.stdout.write(`\r  ${matched} matched | ${walsUpdated} wals_code updates | ${refInserted} ref_ids...`);
  }

  console.log(`\n\nDone.`);
  console.log(`  ${matched} languages matched WALS data`);
  console.log(`  ${walsUpdated} languages got wals_code`);
  console.log(`  ${refInserted} reference_identifiers upserted`);
  if (errors > 0) console.warn(`  ${errors} reference_identifiers errors`);
  console.log(`  ${languages.length - matched} languages have no WALS entry`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

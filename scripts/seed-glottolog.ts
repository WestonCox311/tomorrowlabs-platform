/**
 * seed-glottolog.ts
 *
 * Fetches the Glottolog CLDF languages.csv (master branch) and upserts all
 * spoken L1 languages into the `languages` table. Safe to run multiple times.
 *
 * Only Glottolog-sourced fields are written (english_name, glottocode,
 * iso_639_3, latitude, longitude, granularity). Manually curated fields
 * (endonym, ethnologue_status, notes) are never overwritten.
 *
 * Source: https://github.com/glottolog/glottolog-cldf (CC BY 4.0)
 */

import { supabase } from './lib/supabase';

const CLDF_URL =
  'https://raw.githubusercontent.com/glottolog/glottolog-cldf/master/cldf/languages.csv';

const BATCH_SIZE = 500;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && !inQuotes) {
      inQuotes = true;
    } else if (ch === '"' && inQuotes) {
      if (line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = false;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

async function main() {
  console.log('Fetching Glottolog CLDF languages.csv...');
  const res = await fetch(CLDF_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const text = await res.text();

  const lines = text.split('\n');
  const headers = parseCSVLine(lines[0] ?? '');

  const idx = {
    id: headers.indexOf('ID'),
    name: headers.indexOf('Name'),
    macroarea: headers.indexOf('Macroarea'),
    lat: headers.indexOf('Latitude'),
    lon: headers.indexOf('Longitude'),
    iso: headers.indexOf('ISO639P3code'),
    level: headers.indexOf('Level'),
  };

  const missingHeaders = Object.entries(idx)
    .filter(([, v]) => v === -1)
    .map(([k]) => k);
  if (missingHeaders.length > 0) {
    throw new Error(`Missing expected CSV columns: ${missingHeaders.join(', ')}`);
  }

  type LanguageRow = {
    english_name: string;
    glottocode: string;
    iso_639_3: string | null;
    latitude: number | null;
    longitude: number | null;
    granularity: 'language';
  };

  const records: LanguageRow[] = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;

    const cols = parseCSVLine(line);
    const level = cols[idx.level] ?? '';

    // Only ingest spoken L1 languages — not families, dialects, or bookkeeping
    if (level !== 'language') {
      skipped++;
      continue;
    }

    const glottocode = cols[idx.id] ?? '';
    const iso = cols[idx.iso]?.trim() || null;
    const latStr = cols[idx.lat] ?? '';
    const lonStr = cols[idx.lon] ?? '';

    records.push({
      english_name: cols[idx.name] ?? glottocode,
      glottocode,
      iso_639_3: iso,
      latitude: latStr ? parseFloat(latStr) : null,
      longitude: lonStr ? parseFloat(lonStr) : null,
      granularity: 'language',
    });
  }

  console.log(
    `Parsed ${records.length} L1 languages (skipped ${skipped} families/dialects/bookkeeping)`
  );
  console.log('Upserting to Supabase...');

  let total = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('languages')
      .upsert(batch, { onConflict: 'glottocode' });

    if (error) {
      console.error(`\nError at batch starting index ${i}: ${error.message}`);
      errors++;
      if (errors > 3) {
        console.error('Too many errors — aborting.');
        process.exit(1);
      }
    } else {
      total += batch.length;
    }

    process.stdout.write(`\r  ${total}/${records.length} upserted...`);
  }

  console.log(`\n\nDone. ${total} languages upserted from Glottolog CLDF.`);
  if (errors > 0) console.warn(`${errors} batch(es) had errors.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

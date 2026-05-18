/**
 * seed-geonames-admin1.ts
 *
 * Seeds first-level administrative divisions (states, provinces, territories)
 * for all 252 countries from the GeoNames admin1CodesASCII.txt dump.
 *
 * Source: https://download.geonames.org/export/dump/admin1CodesASCII.txt
 * Format: TSV — {countryCode}.{admin1Code} | name | asciiName | geonamesId
 * License: CC-BY 4.0, no auth required
 * Rows: ~3,900
 *
 * Run: npm run seed:geonames-admin1
 */

import { supabase } from './lib/supabase';

const ADMIN1_URL = 'https://download.geonames.org/export/dump/admin1CodesASCII.txt';
const SOURCE_ID = '11111111-0000-0000-0000-000000000013';
const BATCH_SIZE = 100;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface Admin1Row {
  countryCode: string;
  admin1Code: string;
  name: string;
  geonamesId: string;
}

function parseTsv(text: string): Admin1Row[] {
  const rows: Admin1Row[] = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split('\t');
    if (parts.length < 4) continue;
    const [composite, name, , geonamesId] = parts;
    const dotIdx = composite.indexOf('.');
    if (dotIdx === -1) continue;
    const countryCode = composite.slice(0, dotIdx);
    const admin1Code = composite.slice(dotIdx + 1);
    if (!countryCode || !admin1Code || !name || !geonamesId) continue;
    rows.push({ countryCode, admin1Code, name: name.trim(), geonamesId: geonamesId.trim() });
  }
  return rows;
}

async function ensureSource() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('sources').upsert({
    id: SOURCE_ID,
    name: 'GeoNames — admin1CodesASCII.txt',
    type: 'dataset',
    url: ADMIN1_URL,
    accessed_date: new Date().toISOString().slice(0, 10),
    reliability_rating: 'high',
    notes: 'First-level administrative divisions (states, provinces, territories) for all countries. TSV dump, no auth. CC-BY 4.0.',
  }, { onConflict: 'id', ignoreDuplicates: true });
}

async function main() {
  console.log('Fetching GeoNames admin1 dump…');
  const res = await fetch(ADMIN1_URL, {
    headers: { 'User-Agent': 'TomorrowLabs-seed/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const text = await res.text();

  const rows = parseTsv(text);
  console.log(`Parsed ${rows.length} admin1 rows`);

  await ensureSource();

  // Load all existing country places into a lookup map: alpha2 → id
  console.log('Loading country places…');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: countries } = await (supabase as any)
    .from('places')
    .select('id, iso_3166_1_alpha2, english_name')
    .eq('granularity', 'country')
    .not('iso_3166_1_alpha2', 'is', null);

  const countryMap: Record<string, string> = {}; // alpha2 → place id
  for (const c of countries ?? []) {
    if (c.iso_3166_1_alpha2) countryMap[c.iso_3166_1_alpha2] = c.id;
  }
  console.log(`Loaded ${Object.keys(countryMap).length} country records`);

  // Build insert rows
  const toInsert = [];
  let skippedNoParent = 0;

  for (const row of rows) {
    const parentId = countryMap[row.countryCode];
    if (!parentId) {
      skippedNoParent++;
      continue;
    }
    toInsert.push({
      english_name: row.name,
      granularity: 'state-province' as const,
      parent_place_id: parentId,
      geonames_id: row.geonamesId,
      iso_3166_2: `${row.countryCode}-${row.admin1Code}`,
      status: 'active' as const,
    });
  }

  console.log(`\nReady to insert: ${toInsert.length} | Skipped (no parent country): ${skippedNoParent}`);
  console.log('Inserting in batches…');

  let inserted = 0;
  let skippedDuplicate = 0;

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('places')
      .upsert(batch, { onConflict: 'geonames_id', ignoreDuplicates: true });

    if (error) {
      console.warn(`  Batch ${i / BATCH_SIZE + 1} warning: ${error.message}`);
      skippedDuplicate += batch.length;
    } else {
      inserted += batch.length;
    }

    if (i % 500 === 0 && i > 0) {
      console.log(`  ${i}/${toInsert.length} processed…`);
      await sleep(100);
    }
  }

  // Final count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('granularity', 'state-province');

  console.log(`\nDone.`);
  console.log(`  Inserted/upserted: ${inserted}`);
  console.log(`  Skipped (no country match): ${skippedNoParent}`);
  console.log(`  Total state-province rows in DB: ${count}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

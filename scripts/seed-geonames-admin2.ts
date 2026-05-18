/**
 * seed-geonames-admin2.ts
 *
 * Seeds second-level administrative divisions (counties, districts,
 * municipalities, prefectures, etc.) for all 252 countries from the
 * GeoNames admin2Codes.txt dump.
 *
 * Source: https://download.geonames.org/export/dump/admin2Codes.txt
 * Format: TSV — {countryCode}.{admin1Code}.{admin2Code} | name | asciiName | geonamesId
 * License: CC-BY 4.0, no auth required
 * Rows: ~40,000–50,000
 *
 * Prerequisites:
 *   - seed:geonames-admin1 must have run first (admin2 parents are admin1 places)
 *
 * Run: npm run seed:geonames-admin2
 */

import { supabase } from './lib/supabase';

const ADMIN2_URL = 'https://download.geonames.org/export/dump/admin2Codes.txt';
const SOURCE_ID = '11111111-0000-0000-0000-000000000014';
const BATCH_SIZE = 100;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface Admin2Row {
  countryCode: string;
  admin1Code: string;
  admin2Code: string;
  name: string;
  geonamesId: string;
}

function parseTsv(text: string): Admin2Row[] {
  const rows: Admin2Row[] = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split('\t');
    if (parts.length < 4) continue;
    const [composite, name, , geonamesId] = parts;
    const first = composite.indexOf('.');
    const second = composite.indexOf('.', first + 1);
    if (first === -1 || second === -1) continue;
    const countryCode = composite.slice(0, first);
    const admin1Code = composite.slice(first + 1, second);
    const admin2Code = composite.slice(second + 1);
    if (!countryCode || !admin1Code || !admin2Code || !name || !geonamesId) continue;
    rows.push({
      countryCode,
      admin1Code,
      admin2Code,
      name: name.trim(),
      geonamesId: geonamesId.trim(),
    });
  }
  return rows;
}

async function ensureSource() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('sources').upsert({
    id: SOURCE_ID,
    name: 'GeoNames — admin2Codes.txt',
    type: 'dataset',
    url: ADMIN2_URL,
    accessed_date: new Date().toISOString().slice(0, 10),
    reliability_rating: 'high',
    notes: 'Second-level administrative divisions (counties, districts, municipalities) for all countries. TSV dump, no auth. CC-BY 4.0.',
  }, { onConflict: 'id', ignoreDuplicates: true });
}

async function main() {
  console.log('Fetching GeoNames admin2 dump…');
  const res = await fetch(ADMIN2_URL, {
    headers: { 'User-Agent': 'TomorrowLabs-seed/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const text = await res.text();

  const rows = parseTsv(text);
  console.log(`Parsed ${rows.length} admin2 rows`);

  await ensureSource();

  // Load all existing admin1 places into a lookup map: iso_3166_2 → id
  // Admin1 places have iso_3166_2 set to e.g. "US-CA"
  // Supabase enforces a server-side max of 1,000 rows per query, so paginate.
  console.log('Loading admin1 places (paginated)…');
  const admin1Map: Record<string, string> = {}; // iso_3166_2 → place id
  const PAGE_SIZE = 1000;
  let page = 0;
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('places')
      .select('id, iso_3166_2')
      .eq('granularity', 'state-province')
      .not('iso_3166_2', 'is', null)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw new Error(`Failed to load admin1 places (page ${page}): ${error.message}`);
    if (!data || data.length === 0) break;

    for (const p of data) {
      if (p.iso_3166_2) admin1Map[p.iso_3166_2] = p.id;
    }

    if (data.length < PAGE_SIZE) break;
    page++;
  }
  console.log(`Loaded ${Object.keys(admin1Map).length} admin1 records`);

  // Build insert rows
  const toInsert = [];
  let skippedNoParent = 0;

  for (const row of rows) {
    const parentKey = `${row.countryCode}-${row.admin1Code}`;
    const parentId = admin1Map[parentKey];
    if (!parentId) {
      skippedNoParent++;
      continue;
    }
    toInsert.push({
      english_name: row.name,
      granularity: 'county' as const,
      parent_place_id: parentId,
      geonames_id: row.geonamesId,
      status: 'active' as const,
      // iso_3166_2 intentionally omitted — ISO 3166-2 only covers first-level divisions
    });
  }

  console.log(`\nReady to insert: ${toInsert.length} | Skipped (no parent admin1): ${skippedNoParent}`);
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
      console.warn(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} warning: ${error.message}`);
      skippedDuplicate += batch.length;
    } else {
      inserted += batch.length;
    }

    if (i % 2000 === 0 && i > 0) {
      console.log(`  ${i}/${toInsert.length} processed…`);
      await sleep(100);
    }
  }

  // Final count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('granularity', 'county');

  console.log(`\nDone.`);
  console.log(`  Inserted/upserted: ${inserted}`);
  console.log(`  Skipped (no admin1 match): ${skippedNoParent}`);
  console.log(`  Skipped (duplicate): ${skippedDuplicate}`);
  console.log(`  Total county rows in DB: ${count}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

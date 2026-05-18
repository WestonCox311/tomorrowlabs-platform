/**
 * seed-worldbank-populations.ts
 *
 * Seeds place_demographics.population_total for all countries using the
 * World Bank Open Data API (SP.POP.TOTL indicator). Returns most recent
 * available year per country (~2022–2023).
 *
 * Source: https://api.worldbank.org/v2/ (public, no auth)
 * Match:  iso_3166_1_alpha3 on places (World Bank uses ISO alpha-3 codes)
 * Rows:   ~217 (World Bank member countries; territories may be missing)
 *
 * Run: npm run seed:worldbank-populations
 */

import { supabase } from './lib/supabase';

const SOURCE_ID = '11111111-0000-0000-0000-000000000015';
const WB_URL =
  'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=300&mrv=1';

const BATCH_SIZE = 100;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface WBEntry {
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
}

async function ensureSource() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('sources').upsert(
    {
      id: SOURCE_ID,
      name: 'World Bank — SP.POP.TOTL',
      type: 'dataset',
      url: 'https://data.worldbank.org/indicator/SP.POP.TOTL',
      accessed_date: new Date().toISOString().slice(0, 10),
      reliability_rating: 'high',
      notes:
        'Total population (World Bank estimate). Most recent year available per country. SP.POP.TOTL indicator via Open Data API.',
    },
    { onConflict: 'id', ignoreDuplicates: true },
  );
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);

  console.log('Fetching World Bank population data…');
  const res = await fetch(WB_URL, {
    headers: { 'User-Agent': 'TomorrowLabs-seed/1.0' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

  const json = (await res.json()) as [{ pages: number; total: number }, WBEntry[]];
  const [meta, entries] = json;
  console.log(`  World Bank returned ${meta.total} rows across ${meta.pages} page(s)`);

  // Filter out aggregate rows (World, High income, etc.) which have blank iso3 codes
  const valid = entries.filter(
    (e) => e.countryiso3code && e.countryiso3code.trim() !== '' && e.value !== null,
  );
  console.log(`  Valid country entries: ${valid.length}`);

  await ensureSource();

  // Load country places: match by iso_3166_1_alpha3
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: countries } = await (supabase as any)
    .from('places')
    .select('id, iso_3166_1_alpha3, english_name')
    .eq('granularity', 'country')
    .not('iso_3166_1_alpha3', 'is', null);

  const alpha3Map: Record<string, string> = {};
  for (const c of countries ?? []) {
    if (c.iso_3166_1_alpha3) alpha3Map[c.iso_3166_1_alpha3.toUpperCase()] = c.id;
  }
  console.log(`  Loaded ${Object.keys(alpha3Map).length} country places`);

  // Build insert rows
  const toInsert: object[] = [];
  let skipped = 0;

  for (const entry of valid) {
    const placeId = alpha3Map[entry.countryiso3code.toUpperCase()];
    if (!placeId) {
      skipped++;
      continue;
    }
    toInsert.push({
      place_id: placeId,
      assessment_date: today,
      population_total: entry.value,
      data_year: parseInt(entry.date, 10),
      source_id: SOURCE_ID,
      confidence: 'medium',
    });
  }

  console.log(`\nMatched: ${toInsert.length} | Skipped (no place match): ${skipped}`);

  // Delete existing rows from this source before re-inserting (idempotency)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: deleteError } = await (supabase as any)
    .from('place_demographics')
    .delete()
    .eq('source_id', SOURCE_ID);
  if (deleteError) {
    console.warn(`  Delete warning: ${deleteError.message}`);
  } else {
    console.log('  Cleared previous rows for this source.');
  }

  // Insert in batches
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('place_demographics').insert(batch);
    if (error) {
      console.warn(`  Batch ${Math.floor(i / BATCH_SIZE) + 1} warning: ${error.message}`);
    } else {
      inserted += batch.length;
    }
    await sleep(50);
  }

  // Final count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from('place_demographics')
    .select('*', { count: 'exact', head: true });

  console.log(`\nDone.`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Total place_demographics rows in DB: ${count}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

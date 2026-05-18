/**
 * seed-wikidata-populations.ts
 *
 * Seeds place_demographics.population_total for admin1 (states/provinces)
 * and admin2 (counties/districts) using Wikidata SPARQL.
 *
 * Strategy: match by GeoNames ID (P1566) → population (P1082).
 * Uses the same batching, rate limiting, and retry patterns as
 * seed-wikidata-enrichment.ts (100 IDs per query, 3s between batches).
 *
 * Source: https://query.wikidata.org/sparql (CC0)
 * Reuses source_id: 11111111-0000-0000-0000-000000000002 (Wikidata)
 *
 * Coverage:
 *   admin1 (~3,900): near-complete for most countries
 *   admin2 (~35,000): near-complete for developed countries, partial elsewhere
 *
 * Run: npm run seed:wikidata-populations
 */

import { supabase } from './lib/supabase';

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const SPARQL_BATCH = 100;
const BATCH_DELAY_MS = 3000;
const MAX_RETRIES = 5;
const WIKIDATA_SOURCE_ID = '11111111-0000-0000-0000-000000000002';
const INSERT_BATCH = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Binding = Record<string, { type: string; value: string } | undefined>;

async function sparqlQuery<T extends Binding>(query: string): Promise<T[]> {
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/sparql-results+json',
        'User-Agent': 'TomorrowLabs-seed/1.0 (https://tomorrowlabs.org)',
      },
    });

    if (res.ok) {
      const json = (await res.json()) as { results: { bindings: T[] } };
      return json.results.bindings;
    }

    if (res.status === 429 || res.status === 503) {
      const retryAfter = res.headers.get('Retry-After');
      const waitMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : Math.min(10000 * attempt, 60000);
      process.stdout.write(
        `\n  HTTP ${res.status} — waiting ${waitMs / 1000}s (attempt ${attempt}/${MAX_RETRIES})...`,
      );
      await sleep(waitMs);
      continue;
    }

    if (res.status === 500 || res.status === 502 || res.status === 504) {
      const waitMs = 5000 * attempt;
      process.stdout.write(
        `\n  HTTP ${res.status} — waiting ${waitMs / 1000}s (attempt ${attempt}/${MAX_RETRIES})...`,
      );
      await sleep(waitMs);
      continue;
    }

    throw new Error(`Wikidata HTTP ${res.status}: ${res.statusText}`);
  }

  throw new Error(`Wikidata SPARQL failed after ${MAX_RETRIES} retries`);
}

async function fetchPopulations(
  geonamesIds: string[],
): Promise<Map<string, { population: number; year: number | null }>> {
  const map = new Map<string, { population: number; year: number | null }>();
  const total = Math.ceil(geonamesIds.length / SPARQL_BATCH);

  for (let i = 0; i < geonamesIds.length; i += SPARQL_BATCH) {
    const batch = geonamesIds.slice(i, i + SPARQL_BATCH);
    const batchNum = Math.floor(i / SPARQL_BATCH) + 1;
    process.stdout.write(`\r  [populations] batch ${batchNum}/${total}…`);

    const valuesClause = batch.map((id) => `"${id}"`).join(' ');
    const query = `
SELECT ?geonamesId ?population ?year WHERE {
  VALUES ?geonamesId { ${valuesClause} }
  ?item wdt:P1566 ?geonamesId .
  ?item p:P1082 ?popStatement .
  ?popStatement ps:P1082 ?population .
  OPTIONAL {
    ?popStatement pq:P585 ?pointInTime .
    BIND(YEAR(?pointInTime) AS ?year)
  }
}
ORDER BY ?geonamesId DESC(?year)
`;

    const rows = await sparqlQuery<Binding>(query);

    for (const b of rows) {
      const gid = b.geonamesId?.value;
      const popStr = b.population?.value;
      const yearStr = b.year?.value;
      if (!gid || !popStr) continue;

      const population = Math.round(parseFloat(popStr));
      const year = yearStr ? parseInt(yearStr, 10) : null;

      if (isNaN(population) || population <= 0) continue;

      // Keep only the most recent year's entry (SPARQL orders DESC by year)
      if (!map.has(gid)) {
        map.set(gid, { population, year });
      }
    }

    if (i + SPARQL_BATCH < geonamesIds.length) await sleep(BATCH_DELAY_MS);
  }

  process.stdout.write('\n');
  return map;
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);

  // ── Step 1: Load all admin1 + admin2 places with geonames_id ──────────────
  console.log('Loading admin1 + admin2 places (paginated)…');
  const placeMap = new Map<string, string>(); // geonamesId → place uuid
  const placeIds: string[] = [];
  const PAGE_SIZE = 1000;
  let page = 0;
  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('places')
      .select('id, geonames_id')
      .in('granularity', ['state-province', 'county'])
      .not('geonames_id', 'is', null)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw new Error(`Failed to load places (page ${page}): ${error.message}`);
    if (!data || data.length === 0) break;

    for (const p of data) {
      if (p.geonames_id) {
        placeMap.set(p.geonames_id, p.id);
        placeIds.push(p.id);
      }
    }

    if (data.length < PAGE_SIZE) break;
    page++;
  }
  console.log(`  Loaded ${placeMap.size} places with GeoNames IDs`);

  const geonamesIds = Array.from(placeMap.keys());

  // ── Step 2: Fetch populations from Wikidata ───────────────────────────────
  console.log(`\nQuerying Wikidata for ${geonamesIds.length} GeoNames IDs…`);
  console.log(`  (${Math.ceil(geonamesIds.length / SPARQL_BATCH)} batches × ~${BATCH_DELAY_MS / 1000}s = ~${Math.round((Math.ceil(geonamesIds.length / SPARQL_BATCH) * BATCH_DELAY_MS) / 60000)} min)`);

  const populationMap = await fetchPopulations(geonamesIds);
  console.log(`  Got population data for ${populationMap.size} places`);

  // ── Step 3: Build insert rows ─────────────────────────────────────────────
  const toInsert: object[] = [];
  let skipped = 0;

  for (const [geonamesId, { population, year }] of populationMap) {
    const placeId = placeMap.get(geonamesId);
    if (!placeId) { skipped++; continue; }

    toInsert.push({
      place_id: placeId,
      assessment_date: today,
      population_total: population,
      data_year: year,
      source_id: WIKIDATA_SOURCE_ID,
      confidence: 'low', // Wikidata population data varies in recency and sourcing
    });
  }

  console.log(`\nReady to insert: ${toInsert.length} | Skipped: ${skipped}`);

  // ── Step 4: Delete today's existing rows for this source (idempotency) ────
  // Leaves older historical rows intact (time-series safe)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: deleteError } = await (supabase as any)
    .from('place_demographics')
    .delete()
    .eq('source_id', WIKIDATA_SOURCE_ID)
    .eq('assessment_date', today);

  if (deleteError) {
    console.warn(`  Delete warning: ${deleteError.message}`);
  } else {
    console.log("  Cleared today's previous rows for this source.");
  }

  // ── Step 5: Insert in batches ─────────────────────────────────────────────
  console.log('Inserting in batches…');
  let inserted = 0;
  let warnings = 0;

  for (let i = 0; i < toInsert.length; i += INSERT_BATCH) {
    const batch = toInsert.slice(i, i + INSERT_BATCH);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('place_demographics').insert(batch);
    if (error) {
      console.warn(`  Batch ${Math.floor(i / INSERT_BATCH) + 1} warning: ${error.message}`);
      warnings++;
    } else {
      inserted += batch.length;
    }

    if (i % 5000 === 0 && i > 0) {
      process.stdout.write(`  ${i}/${toInsert.length} inserted…\n`);
    }
  }

  // ── Step 6: Final count ───────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from('place_demographics')
    .select('*', { count: 'exact', head: true });

  console.log(`\nDone.`);
  console.log(`  Inserted: ${inserted}`);
  if (warnings > 0) console.log(`  Batches with warnings: ${warnings}`);
  console.log(`  Total place_demographics rows in DB: ${count}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

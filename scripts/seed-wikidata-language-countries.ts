/**
 * seed-wikidata-language-countries.ts
 *
 * Fills two tables from Wikidata SPARQL:
 *
 * Phase A — speaker_populations (country_code='GLOBAL')
 *   P1394 (Glottolog) → P1098 (total speakers)
 *   One row per language with a known global speaker count.
 *
 * Phase B — geographic_concentrations
 *   P1394 → { P17 (country on language) UNION P2936 (language used on country) }
 *   Using both directions gives far broader coverage than P17 alone:
 *   P17 captures where languages self-report their country; P2936 captures
 *   what countries report as languages spoken there (often includes diaspora
 *   communities that Wikidata language editors haven't reflected on P17).
 *
 * Phase C — native country detection for diaspora flagging
 *   P1394 → P37 reverse (countries listing this as official language)
 *   A language in its official country → is_diaspora_concentration = false
 *   A language in any other country   → is_diaspora_concentration = true
 *   No official country found          → defaults to false (can't determine)
 *
 * Reuses the same SPARQL infrastructure as seed-wikidata-enrichment.ts:
 * same endpoint, User-Agent, batch size (100), 3s delay, exponential backoff.
 *
 * Idempotency:
 *   - speaker_populations: deletes rows WHERE source_id=Wikidata AND country_code='GLOBAL'
 *   - geographic_concentrations: deletes all Wikidata-sourced rows before reinserting
 *
 * Run: npm run seed:wikidata-language-countries
 */

import { supabase } from './lib/supabase';

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const SPARQL_BATCH = 100;
const BATCH_DELAY_MS = 3000;
const MAX_RETRIES = 5;
const WIKIDATA_SOURCE_ID = '11111111-0000-0000-0000-000000000002';
const INSERT_BATCH = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
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
      const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.min(10000 * attempt, 60000);
      process.stdout.write(`\n  HTTP ${res.status} — waiting ${waitMs / 1000}s (attempt ${attempt}/${MAX_RETRIES})...`);
      await sleep(waitMs);
      continue;
    }

    if (res.status === 500 || res.status === 502 || res.status === 504) {
      const waitMs = 5000 * attempt;
      process.stdout.write(`\n  HTTP ${res.status} — waiting ${waitMs / 1000}s (attempt ${attempt}/${MAX_RETRIES})...`);
      await sleep(waitMs);
      continue;
    }

    throw new Error(`Wikidata HTTP ${res.status}: ${res.statusText}`);
  }

  throw new Error(`Wikidata SPARQL failed after ${MAX_RETRIES} retries`);
}

async function batchedQuery<T extends Binding>(
  items: string[],
  makeQuery: (valuesClause: string) => string,
  label: string,
): Promise<T[]> {
  const all: T[] = [];
  const total = Math.ceil(items.length / SPARQL_BATCH);
  for (let i = 0; i < items.length; i += SPARQL_BATCH) {
    const batch = items.slice(i, i + SPARQL_BATCH);
    const batchNum = Math.floor(i / SPARQL_BATCH) + 1;
    process.stdout.write(`\r  [${label}] batch ${batchNum}/${total}…`);
    const valuesClause = batch.map((c) => `"${c}"`).join(' ');
    const rows = await sparqlQuery<T>(makeQuery(valuesClause));
    all.push(...rows);
    if (i + SPARQL_BATCH < items.length) await sleep(BATCH_DELAY_MS);
  }
  process.stdout.write('\n');
  return all;
}

// ── Phase A: Global speaker counts (P1098) ────────────────────────────────────

async function fetchGlobalSpeakerCounts(glottocodes: string[]): Promise<Map<string, number>> {
  const rows = await batchedQuery<Binding>(
    glottocodes,
    (vals) => `
SELECT ?glottolog (MAX(?speakersRaw) AS ?speakers) WHERE {
  VALUES ?glottolog { ${vals} }
  ?lang wdt:P1394 ?glottolog .
  ?lang wdt:P1098 ?speakersRaw .
}
GROUP BY ?glottolog`,
    'GlobalSpeakers',
  );

  const map = new Map<string, number>();
  for (const b of rows) {
    const code = b.glottolog?.value;
    const count = b.speakers?.value ? Math.round(parseFloat(b.speakers.value)) : null;
    if (code && count != null && count > 0 && !isNaN(count)) {
      map.set(code, count);
    }
  }
  return map;
}

// ── Phase B: Country distribution (P17 ∪ P2936) ──────────────────────────────

interface CountryEntry {
  countryCode: string;
  speakers: number | null;
}

async function fetchCountryDistribution(glottocodes: string[]): Promise<Map<string, CountryEntry[]>> {
  const rows = await batchedQuery<Binding>(
    glottocodes,
    (vals) => `
SELECT ?glottolog ?countryCode (SAMPLE(?speakersRaw) AS ?speakers) WHERE {
  VALUES ?glottolog { ${vals} }
  ?lang wdt:P1394 ?glottolog .
  {
    ?lang wdt:P17 ?country .
  } UNION {
    ?country wdt:P2936 ?lang .
  }
  ?country wdt:P297 ?countryCode .
  OPTIONAL {
    ?lang p:P1098 ?stmt .
    ?stmt ps:P1098 ?speakersRaw .
    ?stmt pq:P17 ?country .
  }
}
GROUP BY ?glottolog ?countryCode`,
    'Countries',
  );

  const map = new Map<string, CountryEntry[]>();
  for (const b of rows) {
    const code = b.glottolog?.value;
    const countryCode = b.countryCode?.value?.toUpperCase();
    if (!code || !countryCode || countryCode.length !== 2) continue;

    const speakersRaw = b.speakers?.value;
    const speakers = speakersRaw ? Math.round(parseFloat(speakersRaw)) : null;

    if (!map.has(code)) map.set(code, []);
    map.get(code)!.push({
      countryCode,
      speakers: speakers != null && speakers > 0 && !isNaN(speakers) ? speakers : null,
    });
  }
  return map;
}

// ── Phase C: Native country detection (P37 reverse) ──────────────────────────
// Finds countries where a language is listed as an official language (P37).
// These are "native" countries — everywhere else the language appears is diaspora.

async function fetchNativeCountries(glottocodes: string[]): Promise<Map<string, Set<string>>> {
  const rows = await batchedQuery<Binding>(
    glottocodes,
    (vals) => `
SELECT ?glottolog ?countryCode WHERE {
  VALUES ?glottolog { ${vals} }
  ?lang wdt:P1394 ?glottolog .
  ?country wdt:P37 ?lang .
  ?country wdt:P297 ?countryCode .
}
GROUP BY ?glottolog ?countryCode`,
    'NativeCountries',
  );

  const map = new Map<string, Set<string>>();
  for (const b of rows) {
    const code = b.glottolog?.value;
    const countryCode = b.countryCode?.value?.toUpperCase();
    if (!code || !countryCode || countryCode.length !== 2) continue;
    if (!map.has(code)) map.set(code, new Set());
    map.get(code)!.add(countryCode);
  }
  return map;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  // Load all languages with glottocodes (paginated)
  console.log('Loading languages…');
  const glottoToId = new Map<string, string>();
  let page = 0;
  while (true) {
    const { data, error } = await sb
      .from('languages')
      .select('id, glottocode')
      .not('glottocode', 'is', null)
      .range(page * 1000, (page + 1) * 1000 - 1);

    if (error) throw new Error(`Failed to load languages: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const l of data) {
      if (l.glottocode) glottoToId.set(l.glottocode, l.id);
    }
    if (data.length < 1000) break;
    page++;
  }
  console.log(`  Loaded ${glottoToId.size} languages`);

  const glottocodes = Array.from(glottoToId.keys());
  const totalBatches = Math.ceil(glottocodes.length / SPARQL_BATCH);
  console.log(`\n~${totalBatches} batches per phase × ~${BATCH_DELAY_MS / 1000}s = ~${Math.round((totalBatches * BATCH_DELAY_MS) / 60000)} min per phase (3 phases total)\n`);

  // ── Phase A: Global speaker counts ─────────────────────────────────────────
  console.log('Phase A: Fetching global speaker counts from Wikidata…');
  const speakerMap = await fetchGlobalSpeakerCounts(glottocodes);
  console.log(`  Found counts for ${speakerMap.size} languages`);

  const speakerRows: object[] = [];
  for (const [glottocode, count] of speakerMap) {
    const languageId = glottoToId.get(glottocode);
    if (!languageId) continue;
    speakerRows.push({
      language_id: languageId,
      country_code: 'GLOBAL',
      context: 'global',
      l1_speakers: count,
      source_id: WIKIDATA_SOURCE_ID,
      confidence: 'low',
    });
  }

  console.log(`  Deleting old GLOBAL rows…`);
  await sb.from('speaker_populations').delete()
    .eq('source_id', WIKIDATA_SOURCE_ID)
    .eq('country_code', 'GLOBAL');

  console.log(`  Inserting ${speakerRows.length} global speaker rows…`);
  let spInserted = 0;
  for (let i = 0; i < speakerRows.length; i += INSERT_BATCH) {
    const { error } = await sb.from('speaker_populations').insert(speakerRows.slice(i, i + INSERT_BATCH));
    if (error) console.warn(`  Batch ${Math.floor(i / INSERT_BATCH) + 1} warning: ${error.message}`);
    else spInserted += Math.min(INSERT_BATCH, speakerRows.length - i);
  }
  console.log(`  ✓ ${spInserted} rows inserted into speaker_populations`);

  // ── Phase B+C: Country distribution + diaspora detection ───────────────────
  console.log('\nPhase B: Fetching country distribution from Wikidata (P17 ∪ P2936)…');
  const countryMap = await fetchCountryDistribution(glottocodes);
  console.log(`  Found country entries for ${countryMap.size} languages`);

  console.log('\nPhase C: Fetching native countries (P37 official language) for diaspora flags…');
  const nativeCountriesMap = await fetchNativeCountries(glottocodes);
  console.log(`  Found official-language data for ${nativeCountriesMap.size} languages`);

  const gcRows: object[] = [];
  for (const [glottocode, entries] of countryMap) {
    const languageId = glottoToId.get(glottocode);
    if (!languageId) continue;
    const nativeSet = nativeCountriesMap.get(glottocode);
    for (const { countryCode, speakers } of entries) {
      // If we have P37 data for this language, anything outside its official countries is diaspora.
      // If no P37 data exists (language has no official country), default to false.
      const isDiaspora = nativeSet && nativeSet.size > 0 ? !nativeSet.has(countryCode) : false;
      gcRows.push({
        language_id: languageId,
        country_code: countryCode,
        region: 'national',
        region_type: 'country',
        estimated_speakers: speakers,
        is_diaspora_concentration: isDiaspora,
        source_id: WIKIDATA_SOURCE_ID,
        confidence: 'low',
      });
    }
  }

  console.log(`  Total language × country rows: ${gcRows.length}`);
  console.log('  Deleting old Wikidata geographic_concentrations rows…');
  await sb.from('geographic_concentrations').delete().eq('source_id', WIKIDATA_SOURCE_ID);

  console.log(`  Inserting ${gcRows.length} rows into geographic_concentrations…`);
  let gcInserted = 0;
  for (let i = 0; i < gcRows.length; i += INSERT_BATCH) {
    if (i % 5000 === 0 && i > 0) process.stdout.write(`  ${i}/${gcRows.length}…\n`);
    const { error } = await sb.from('geographic_concentrations').insert(gcRows.slice(i, i + INSERT_BATCH));
    if (error) console.warn(`  Batch ${Math.floor(i / INSERT_BATCH) + 1} warning: ${error.message}`);
    else gcInserted += Math.min(INSERT_BATCH, gcRows.length - i);
  }
  console.log(`  ✓ ${gcInserted} rows inserted into geographic_concentrations`);

  // ── Final counts ───────────────────────────────────────────────────────────
  const [{ count: spCount }, { count: gcCount }] = await Promise.all([
    sb.from('speaker_populations').select('*', { count: 'exact', head: true }),
    sb.from('geographic_concentrations').select('*', { count: 'exact', head: true }),
  ]);

  console.log('\nDone.');
  console.log(`  speaker_populations total rows in DB:      ${spCount}`);
  console.log(`  geographic_concentrations total rows in DB: ${gcCount}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

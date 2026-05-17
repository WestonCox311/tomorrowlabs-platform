/**
 * seed-endonyms.ts
 *
 * Queries Wikidata SPARQL for native language labels using the Glottolog
 * code property (P1394). This covers all ~8,600 seeded languages — not just
 * the 33 Babagigi targets. Coverage depends on what Wikidata has (typically
 * 2,000–4,000 languages with native labels).
 *
 * Only updates `endonym` where the current DB value is NULL — never overwrites
 * manually curated data (e.g., from migration-008).
 *
 * Source: https://query.wikidata.org/sparql (CC0)
 */

import { supabase } from './lib/supabase';

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const PAGE_SIZE = 3000;
const PAGE_DELAY_MS = 2000; // be polite to Wikidata's rate limits
const UPDATE_BATCH_SIZE = 50;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWikidataPage(
  offset: number
): Promise<Map<string, string>> {
  const query = `
    SELECT ?glottolog ?nativeLabel WHERE {
      ?lang wdt:P1394 ?glottolog.
      ?lang wdt:P1705 ?nativeLabel.
      FILTER(isLiteral(?nativeLabel))
    }
    LIMIT ${PAGE_SIZE}
    OFFSET ${offset}
  `;

  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': 'TomorrowLabs-seed-endonyms/1.0 (https://tomorrowlabs.org)',
    },
  });

  if (!res.ok) {
    throw new Error(`Wikidata SPARQL HTTP ${res.status}: ${res.statusText}`);
  }

  type WDBinding = {
    glottolog: { type: string; value: string };
    nativeLabel: { type: string; value: string };
  };
  const json = (await res.json()) as {
    results: { bindings: WDBinding[] };
  };

  const map = new Map<string, string>();
  for (const b of json.results.bindings) {
    const code = b.glottolog.value;
    // Defense-in-depth: skip anything that isn't a plain string literal
    if (b.nativeLabel.type !== 'literal') continue;
    // Some languages have multiple P1705 values — take the first one we see
    if (!map.has(code)) {
      map.set(code, b.nativeLabel.value);
    }
  }
  return map;
}

async function fetchAllWikidataEndonyms(): Promise<Map<string, string>> {
  const combined = new Map<string, string>();
  let offset = 0;
  let page = 1;

  while (true) {
    process.stdout.write(`  Fetching Wikidata page ${page} (offset ${offset})...`);
    const pageMap = await fetchWikidataPage(offset);
    process.stdout.write(` ${pageMap.size} entries\n`);

    for (const [k, v] of pageMap) {
      if (!combined.has(k)) combined.set(k, v);
    }

    if (pageMap.size < PAGE_SIZE) break; // last page

    offset += PAGE_SIZE;
    page++;
    await sleep(PAGE_DELAY_MS);
  }

  return combined;
}

async function main() {
  console.log('Fetching all Wikidata native labels via Glottolog code (P1394)...');
  const wikidataMap = await fetchAllWikidataEndonyms();
  console.log(`\nTotal Wikidata entries with Glottolog codes + native labels: ${wikidataMap.size}`);

  if (wikidataMap.size === 0) {
    console.log('No data returned from Wikidata — aborting.');
    process.exit(1);
  }

  // Fetch all DB languages that need endonyms (paginate — PostgREST caps at 1,000 rows)
  console.log('\nFetching languages from Supabase where endonym is NULL...');
  const DB_PAGE = 1000;
  const languages: Array<{ id: string; glottocode: string; english_name: string }> = [];

  for (let from = 0; ; from += DB_PAGE) {
    const { data, error } = await supabase
      .from('languages')
      .select('id, glottocode, english_name')
      .is('endonym', null)
      .range(from, from + DB_PAGE - 1);

    if (error) throw new Error(`Supabase fetch error: ${error.message}`);
    if (!data?.length) break;
    languages.push(...data);
    if (data.length < DB_PAGE) break;
  }

  if (!languages.length) {
    console.log('All languages already have endonyms — nothing to do.');
    process.exit(0);
  }

  console.log(`${languages.length} languages in DB have no endonym.`);

  // Match and collect updates
  const updates: Array<{ id: string; glottocode: string; english_name: string; endonym: string }> = [];
  for (const lang of languages) {
    const endonym = wikidataMap.get(lang.glottocode);
    if (endonym) {
      updates.push({ id: lang.id, glottocode: lang.glottocode, english_name: lang.english_name, endonym });
    }
  }

  console.log(`Wikidata has endonyms for ${updates.length} of ${languages.length} languages.\n`);

  if (updates.length === 0) {
    console.log('No matches found — nothing to update.');
    process.exit(0);
  }

  // Apply updates in batches
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < updates.length; i += UPDATE_BATCH_SIZE) {
    const batch = updates.slice(i, i + UPDATE_BATCH_SIZE);

    for (const u of batch) {
      const { error } = await supabase
        .from('languages')
        .update({ endonym: u.endonym })
        .eq('id', u.id)
        .is('endonym', null); // safety: never overwrite manually curated data

      if (error) {
        console.error(`  Error updating ${u.english_name}: ${error.message}`);
        errors++;
      } else {
        updated++;
      }
    }

    process.stdout.write(`\r  ${updated}/${updates.length} updated...`);
  }

  console.log(`\n\nDone.`);
  console.log(`  ${updated} endonyms written to database`);
  console.log(`  ${updates.length - updated - errors} already had endonyms (skipped)`);
  if (errors > 0) console.warn(`  ${errors} errors`);
  console.log(`  ${languages.length - updates.length} languages have no Wikidata entry for native label`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

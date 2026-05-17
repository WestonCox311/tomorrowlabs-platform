/**
 * seed-endonyms.ts
 *
 * Queries Wikidata SPARQL for native language labels (P1705) for the 33
 * Babagigi target languages. Only updates `endonym` where the current value
 * is NULL — never overwrites curated data.
 *
 * Run after migration-008 so Hebrew, Punjabi, and Gujarati are in the table.
 *
 * Source: https://query.wikidata.org/sparql (CC0)
 */

import { supabase } from './lib/supabase';

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

// Glottocodes for the 33 Babagigi target languages.
// These must exist in the languages table before this script runs.
const BABAGIGI_GLOTTOCODES = [
  'stan1288', // Spanish
  'mand1415', // Mandarin Chinese
  'taga1270', // Tagalog
  'viet1252', // Vietnamese
  'kore1280', // Korean
  'stan1318', // Arabic (MSA)
  'stan1290', // French
  'port1283', // Portuguese
  'russ1263', // Russian
  'hind1269', // Hindi
  'cant1236', // Cantonese
  'japa1256', // Japanese
  'stan1295', // German
  'ital1282', // Italian
  'poli1260', // Polish
  'mode1248', // Greek
  'urdu1245', // Urdu
  'cent1989', // Khmer
  'kich1262', // K'iche'
  'kaqc1270', // Kaqchikel
  'east2455', // Nahuatl
  'mixt1422', // Mixtec
  'laoo1244', // Lao
  'whit1273', // Hmong
  'hebr1245', // Hebrew (added in migration-008)
  'panj1256', // Punjabi (added in migration-008)
  'guja1252', // Gujarati (added in migration-008)
];

// Wikidata QIDs for each glottocode (for the SPARQL query)
// Mapping: glottocode → Wikidata QID
const GLOTTO_TO_QID: Record<string, string> = {
  stan1288: 'Q1321',   // Spanish
  mand1415: 'Q9192',   // Mandarin Chinese
  taga1270: 'Q34057',  // Tagalog
  viet1252: 'Q9199',   // Vietnamese
  kore1280: 'Q9176',   // Korean
  stan1318: 'Q13955',  // Arabic
  stan1290: 'Q150',    // French
  port1283: 'Q5146',   // Portuguese
  russ1263: 'Q7737',   // Russian
  hind1269: 'Q1568',   // Hindi
  cant1236: 'Q9186',   // Cantonese
  japa1256: 'Q5287',   // Japanese
  stan1295: 'Q188',    // German
  ital1282: 'Q652',    // Italian
  poli1260: 'Q809',    // Polish
  mode1248: 'Q36510',  // Modern Greek
  urdu1245: 'Q1617',   // Urdu
  cent1989: 'Q9205',   // Khmer
  kich1262: 'Q36494',  // K'iche'
  kaqc1270: 'Q35115',  // Kaqchikel
  east2455: 'Q13300',  // Nahuatl
  mixt1422: 'Q13352',  // Mixtec
  laoo1244: 'Q9211',   // Lao
  whit1273: 'Q35491',  // Hmong
  hebr1245: 'Q9288',   // Hebrew
  panj1256: 'Q58635',  // Punjabi
  guja1252: 'Q5137',   // Gujarati
};

async function fetchWikidataEndonyms(
  qids: string[]
): Promise<Record<string, string>> {
  const values = qids.map((q) => `wd:${q}`).join(' ');
  const query = `
    SELECT ?lang ?nativeLabel WHERE {
      VALUES ?lang { ${values} }
      ?lang wdt:P1705 ?nativeLabel.
    }
  `;

  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;
  const res = await fetch(url, {
    headers: { Accept: 'application/sparql-results+json' },
  });
  if (!res.ok) throw new Error(`Wikidata SPARQL HTTP ${res.status}`);

  const json = (await res.json()) as {
    results: { bindings: Array<{ lang: { value: string }; nativeLabel: { value: string } }> };
  };

  const result: Record<string, string> = {};
  for (const binding of json.results.bindings) {
    const qid = binding.lang.value.replace('http://www.wikidata.org/entity/', '');
    if (!result[qid]) {
      result[qid] = binding.nativeLabel.value;
    }
  }
  return result;
}

async function main() {
  console.log('Fetching languages from Supabase...');

  const { data: languages, error: fetchErr } = await supabase
    .from('languages')
    .select('id, glottocode, english_name, endonym')
    .in('glottocode', BABAGIGI_GLOTTOCODES);

  if (fetchErr) throw new Error(`Supabase fetch error: ${fetchErr.message}`);
  if (!languages?.length) {
    console.log('No matching languages found. Run migration-008 first.');
    process.exit(0);
  }

  // Only target languages with null endonyms
  const needsEndonym = languages.filter((l) => !l.endonym);
  if (!needsEndonym.length) {
    console.log('All 33 Babagigi languages already have endonyms — nothing to do.');
    process.exit(0);
  }

  console.log(`${needsEndonym.length} languages need endonyms from Wikidata.`);

  const qids = needsEndonym
    .map((l) => GLOTTO_TO_QID[l.glottocode])
    .filter((q): q is string => !!q);

  if (!qids.length) {
    console.log('No known Wikidata QIDs for the remaining languages.');
    process.exit(0);
  }

  console.log(`Querying Wikidata SPARQL for ${qids.length} QIDs...`);
  const endonymMap = await fetchWikidataEndonyms(qids);
  console.log(`Received ${Object.keys(endonymMap).length} native labels.`);

  let updated = 0;
  let notFound = 0;

  for (const lang of needsEndonym) {
    const qid = GLOTTO_TO_QID[lang.glottocode];
    if (!qid) {
      console.log(`  No QID mapping: ${lang.english_name} (${lang.glottocode})`);
      notFound++;
      continue;
    }

    const endonym = endonymMap[qid];
    if (!endonym) {
      console.log(`  No Wikidata endonym: ${lang.english_name} (${qid})`);
      notFound++;
      continue;
    }

    const { error } = await supabase
      .from('languages')
      .update({ endonym })
      .eq('id', lang.id)
      .is('endonym', null); // safety: only update if still null

    if (error) {
      console.error(`  Error updating ${lang.english_name}: ${error.message}`);
    } else {
      console.log(`  ${lang.english_name}: "${endonym}"`);
      updated++;
    }
  }

  console.log(`\nDone. ${updated} endonyms updated, ${notFound} not found in Wikidata.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

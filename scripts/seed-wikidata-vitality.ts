/**
 * seed-wikidata-vitality.ts
 *
 * Phase 4 of wikidata enrichment: UNESCO vitality status via P1999.
 * Run standalone after fixing the UNESCO_LABEL_MAP number-prefix bug.
 */

import { supabase } from './lib/supabase';

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const SPARQL_BATCH = 100;
const BATCH_DELAY_MS = 3000;
const MAX_RETRIES = 5;
const SOURCE_ID = '11111111-0000-0000-0000-000000000002';
const INSERT_BATCH = 500;

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

type Binding = Record<string, { type: string; value: string } | undefined>;

async function sparqlQuery<T extends Binding>(query: string): Promise<T[]> {
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 1) await sleep(5000 * attempt);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TomorrowLabs-seed/1.0', 'Accept': 'application/sparql-results+json' },
    });
    if (res.ok) return (await res.json()).results?.bindings ?? [];
    if (res.status === 429 || res.status === 503) { await sleep(30000); continue; }
    throw new Error(`Wikidata HTTP ${res.status}: ${res.statusText}`);
  }
  throw new Error('SPARQL failed after retries');
}

const UNESCO_LABEL_MAP: Record<string, string> = {
  '1 safe': 'safe',
  '2 vulnerable': 'vulnerable',
  '3 definitely endangered': 'definitely-endangered',
  '4 severely endangered': 'severely-endangered',
  '5 critically endangered': 'critically-endangered',
  '6 extinct': 'extinct',
  'safe language': 'safe', 'safe': 'safe',
  'vulnerable language': 'vulnerable', 'vulnerable': 'vulnerable',
  'definitely endangered language': 'definitely-endangered', 'definitely endangered': 'definitely-endangered',
  'severely endangered language': 'severely-endangered', 'severely endangered': 'severely-endangered',
  'critically endangered language': 'critically-endangered', 'critically endangered': 'critically-endangered',
  'extinct language': 'extinct', 'extinct': 'extinct',
};

async function main() {
  // Load all DB languages with glottocodes
  const all: Array<{ id: string; glottocode: string }> = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from('languages').select('id, glottocode').not('glottocode', 'is', null).range(from, from + 999);
    if (error) throw new Error(error.message);
    if (!data?.length) break;
    all.push(...data);
    if (data.length < 1000) break;
  }
  console.log(`${all.length} languages loaded`);
  const glottocodes = all.map((l) => l.glottocode);
  const glottoToId = new Map(all.map((l) => [l.glottocode, l.id]));

  // Discovery query
  console.log('Discovering P1999 Q-items...');
  const discoveryRows = await sparqlQuery<Binding>(`SELECT DISTINCT ?vitality ?vitalityLabel WHERE {
  ?lang wdt:P1999 ?vitality.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`);
  const qidMap = new Map<string, string>();
  for (const b of discoveryRows) {
    const qid = b.vitality?.value.split('/').pop() ?? '';
    const label = (b.vitalityLabel?.value ?? '').toLowerCase().trim();
    const mapped = UNESCO_LABEL_MAP[label];
    console.log(`  ${qid}: "${b.vitalityLabel?.value}" → ${mapped ?? 'UNMAPPED'}`);
    if (qid && mapped) qidMap.set(qid, mapped);
  }
  console.log(`${qidMap.size} P1999 values mapped\n`);

  await sleep(BATCH_DELAY_MS);

  // Batched query across all glottocodes
  const vitalityMap = new Map<string, string>();
  const total = Math.ceil(glottocodes.length / SPARQL_BATCH);
  for (let i = 0; i < glottocodes.length; i += SPARQL_BATCH) {
    const batch = glottocodes.slice(i, i + SPARQL_BATCH);
    const batchNum = Math.floor(i / SPARQL_BATCH) + 1;
    process.stdout.write(`\r  batch ${batchNum}/${total}...`);
    const vals = batch.map((c) => `"${c}"`).join(' ');
    const rows = await sparqlQuery<Binding>(`SELECT ?glottolog ?vitality WHERE {
  VALUES ?glottolog { ${vals} }
  ?lang wdt:P1394 ?glottolog.
  ?lang wdt:P1999 ?vitality.
}`);
    for (const b of rows) {
      const code = b.glottolog?.value;
      if (!code || vitalityMap.has(code)) continue;
      const qid = b.vitality?.value.split('/').pop() ?? '';
      const mapped = qidMap.get(qid);
      if (mapped) vitalityMap.set(code, mapped);
    }
    if (i + SPARQL_BATCH < glottocodes.length) await sleep(BATCH_DELAY_MS);
  }
  console.log(`\n${vitalityMap.size} languages with UNESCO vitality`);

  // Delete existing Wikidata vitality rows and re-insert
  await supabase.from('vitality_assessments').delete().eq('source_id', SOURCE_ID);

  const today = new Date().toISOString().split('T')[0];
  const vitRows = [];
  for (const [glottocode, status] of vitalityMap) {
    const langId = glottoToId.get(glottocode);
    if (!langId) continue;
    vitRows.push({
      language_id: langId,
      unesco_vitality: status,
      assessment_date: today,
      assessment_scope: 'global',
      source_id: SOURCE_ID,
      confidence: 'medium',
      rationale: 'Wikidata P1999 (UNESCO language status). Community-maintained; verify against UNESCO Atlas for critical decisions.',
    });
  }

  let inserted = 0;
  for (let i = 0; i < vitRows.length; i += INSERT_BATCH) {
    const { error } = await supabase.from('vitality_assessments').insert(vitRows.slice(i, i + INSERT_BATCH));
    if (!error) inserted += Math.min(INSERT_BATCH, vitRows.length - i);
    else console.warn(`  Insert error: ${error.message}`);
  }
  console.log(`Inserted ${inserted} vitality_assessments rows`);
}

main().catch((err) => { console.error(err); process.exit(1); });

/**
 * seed-wikidata-enrichment.ts
 *
 * Enriches the database using Wikidata SPARQL, keyed on Glottolog codes (P1394).
 * Targets all ~8,600 languages in the database.
 *
 * What it fills:
 *   1. languages.wikidata_qid      — Wikidata QID (Q-number)
 *   2. speaker_populations         — Global speaker count (P1098), confidence=low
 *   3. orthographies               — Writing systems (P282) + ISO 15924 codes (P506)
 *   4. vitality_assessments        — UNESCO vitality status (P1999)
 *
 * Idempotency:
 *   - wikidata_qid: only updated where currently NULL
 *   - speaker_populations, orthographies, vitality_assessments: existing rows
 *     from this source are deleted before re-insert
 *
 * Source: https://query.wikidata.org/sparql (CC0)
 */

import { supabase } from './lib/supabase';

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const PAGE_SIZE = 3000;
const PAGE_DELAY_MS = 8000;  // 8s between pages — Wikidata rate-limits aggressively
const MAX_RETRIES = 5;
const SOURCE_ID = '11111111-0000-0000-0000-000000000002';
const INSERT_BATCH = 500;
const UPDATE_BATCH = 50;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Binding = Record<string, { type: string; value: string }>;

async function sparqlPage<T extends Binding>(query: string, offset: number): Promise<T[]> {
  const paged = `${query}\nLIMIT ${PAGE_SIZE}\nOFFSET ${offset}`;
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(paged)}&format=json`;

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
      const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.min(15000 * attempt, 120000);
      console.warn(`\n  Rate limited (HTTP ${res.status}). Waiting ${waitMs / 1000}s before retry ${attempt}/${MAX_RETRIES}...`);
      await sleep(waitMs);
      continue;
    }

    throw new Error(`Wikidata HTTP ${res.status}: ${res.statusText}`);
  }

  throw new Error(`Wikidata SPARQL failed after ${MAX_RETRIES} retries`);
}

async function fetchAll<T extends Binding>(query: string, label: string): Promise<T[]> {
  const all: T[] = [];
  let offset = 0;
  let page = 1;
  while (true) {
    process.stdout.write(`  [${label}] page ${page} (offset ${offset})...`);
    const rows = await sparqlPage<T>(query, offset);
    process.stdout.write(` ${rows.length} rows\n`);
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
    page++;
    await sleep(PAGE_DELAY_MS);
  }
  return all;
}

// ─── Phase 1: Wikidata QIDs ──────────────────────────────────────────────────

async function fetchQIDs(): Promise<Map<string, string>> {
  const query = `SELECT ?glottolog ?lang WHERE {
    ?lang wdt:P1394 ?glottolog.
  }`;
  const rows = await fetchAll<Binding>(query, 'QIDs');
  const map = new Map<string, string>();
  for (const b of rows) {
    const code = b.glottolog?.value;
    const qid = b.lang?.value.split('/').pop() ?? '';
    if (code && qid.startsWith('Q') && !map.has(code)) map.set(code, qid);
  }
  return map;
}

// ─── Phase 2: Speaker counts (P1098) ────────────────────────────────────────

async function fetchSpeakerCounts(): Promise<Map<string, number>> {
  const query = `SELECT ?glottolog ?speakers WHERE {
    ?lang wdt:P1394 ?glottolog.
    ?lang wdt:P1098 ?speakers.
  }`;
  const rows = await fetchAll<Binding>(query, 'Speaker counts');
  const map = new Map<string, number>();
  for (const b of rows) {
    if (b.speakers?.type !== 'literal') continue;
    const code = b.glottolog?.value;
    const count = Math.round(parseFloat(b.speakers.value));
    if (code && !isNaN(count) && count > 0) {
      const existing = map.get(code) ?? 0;
      if (count > existing) map.set(code, count); // take max across multiple statements
    }
  }
  return map;
}

// ─── Phase 3: Writing systems (P282 + P506) ──────────────────────────────────

type ScriptEntry = { name: string; iso15924: string | null };

async function fetchWritingSystems(): Promise<Map<string, ScriptEntry[]>> {
  const query = `SELECT ?glottolog ?scriptLabel ?iso15924 WHERE {
    ?lang wdt:P1394 ?glottolog.
    ?lang wdt:P282 ?script.
    OPTIONAL { ?script wdt:P506 ?iso15924. }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;
  const rows = await fetchAll<Binding>(query, 'Writing systems');
  const map = new Map<string, ScriptEntry[]>();
  for (const b of rows) {
    const code = b.glottolog?.value;
    if (!code) continue;
    if (b.scriptLabel?.type !== 'literal') continue;
    const name = b.scriptLabel.value;
    const iso15924 = b.iso15924?.value ?? null;
    if (!map.has(code)) map.set(code, []);
    const list = map.get(code)!;
    if (!list.some((s) => s.name === name)) list.push({ name, iso15924 });
  }
  return map;
}

// ─── Phase 4: UNESCO vitality (P1999) ────────────────────────────────────────

const UNESCO_LABEL_MAP: Record<string, string> = {
  'safe language': 'safe',
  'vulnerable language': 'vulnerable',
  'definitely endangered language': 'definitely-endangered',
  'severely endangered language': 'severely-endangered',
  'critically endangered language': 'critically-endangered',
  'extinct language': 'extinct',
};

async function fetchUNESCOVitality(): Promise<Map<string, string>> {
  const query = `SELECT ?glottolog ?vitalityLabel WHERE {
    ?lang wdt:P1394 ?glottolog.
    ?lang wdt:P1999 ?vitality.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }`;
  const rows = await fetchAll<Binding>(query, 'UNESCO vitality');
  const map = new Map<string, string>();
  for (const b of rows) {
    const code = b.glottolog?.value;
    if (!code || map.has(code)) continue;
    if (b.vitalityLabel?.type !== 'literal') continue;
    const label = b.vitalityLabel.value.toLowerCase().trim();
    const mapped = UNESCO_LABEL_MAP[label];
    if (mapped) map.set(code, mapped);
  }
  return map;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchAllLanguages(): Promise<Array<{ id: string; glottocode: string }>> {
  const DB_PAGE = 1000;
  const all: Array<{ id: string; glottocode: string }> = [];
  for (let from = 0; ; from += DB_PAGE) {
    const { data, error } = await supabase
      .from('languages')
      .select('id, glottocode')
      .range(from, from + DB_PAGE - 1);
    if (error) throw new Error(`DB fetch: ${error.message}`);
    if (!data?.length) break;
    all.push(...data);
    if (data.length < DB_PAGE) break;
  }
  return all;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { error: srcErr } = await supabase.from('sources').upsert({
    id: SOURCE_ID,
    name: 'Wikidata SPARQL',
    type: 'academic',
    url: 'https://query.wikidata.org/sparql',
    reliability_rating: 'medium',
    notes: 'Wikidata community knowledge graph. Coverage and accuracy varies by language. CC0.',
  }, { onConflict: 'id' });
  if (srcErr) throw new Error(`Source upsert failed: ${srcErr.message}`);

  console.log('=== Wikidata Enrichment Seed ===\n');

  // ── Load all DB languages ─────────────────────────────────────────────────
  console.log('Loading languages from database...');
  const languages = await fetchAllLanguages();
  console.log(`  ${languages.length} languages loaded\n`);

  const glottoToId = new Map<string, string>();
  for (const l of languages) {
    if (l.glottocode) glottoToId.set(l.glottocode, l.id);
  }

  const today = new Date().toISOString().split('T')[0];

  // ── Phase 1: QIDs ─────────────────────────────────────────────────────────
  console.log('Phase 1: Wikidata QIDs...');
  const qidMap = await fetchQIDs();
  console.log(`  ${qidMap.size} QID mappings from Wikidata\n`);
  await sleep(PAGE_DELAY_MS);

  let qidUpdated = 0;
  const qidCandidates = languages.filter((l) => l.glottocode && qidMap.has(l.glottocode));
  for (let i = 0; i < qidCandidates.length; i += UPDATE_BATCH) {
    const batch = qidCandidates.slice(i, i + UPDATE_BATCH);
    for (const l of batch) {
      const { error } = await supabase
        .from('languages')
        .update({ wikidata_qid: qidMap.get(l.glottocode) })
        .eq('id', l.id)
        .is('wikidata_qid', null);
      if (!error) qidUpdated++;
    }
    process.stdout.write(`\r  QID updates: ${Math.min(i + UPDATE_BATCH, qidCandidates.length)}/${qidCandidates.length}...`);
  }
  console.log(`\n  Updated ${qidUpdated} wikidata_qid values\n`);

  // ── Phase 2: Speaker counts ───────────────────────────────────────────────
  console.log('Phase 2: Speaker counts...');
  const speakerMap = await fetchSpeakerCounts();
  console.log(`  ${speakerMap.size} languages with speaker counts\n`);
  await sleep(PAGE_DELAY_MS);

  await supabase.from('speaker_populations').delete().eq('source_id', SOURCE_ID);

  const spRows: Array<Record<string, unknown>> = [];
  for (const [glottocode, count] of speakerMap) {
    const langId = glottoToId.get(glottocode);
    if (!langId) continue;
    spRows.push({
      language_id: langId,
      country_code: 'WW',
      context: 'global',
      l1_speakers: count,
      data_year: new Date().getFullYear(),
      source_id: SOURCE_ID,
      confidence: 'low',
      notes: 'Wikidata P1098 global estimate. Often sourced from Wikipedia infoboxes — use with caution.',
    });
  }

  let spInserted = 0;
  for (let i = 0; i < spRows.length; i += INSERT_BATCH) {
    const { error } = await supabase.from('speaker_populations').insert(spRows.slice(i, i + INSERT_BATCH));
    if (!error) spInserted += Math.min(INSERT_BATCH, spRows.length - i);
    else console.warn(`  speaker_populations insert error: ${error.message}`);
    process.stdout.write(`\r  Inserting speaker rows: ${spInserted}/${spRows.length}...`);
  }
  console.log(`\n  Inserted ${spInserted} speaker population rows\n`);

  // ── Phase 3: Writing systems ──────────────────────────────────────────────
  console.log('Phase 3: Writing systems...');
  const scriptMap = await fetchWritingSystems();
  console.log(`  ${scriptMap.size} languages with writing system data\n`);
  await sleep(PAGE_DELAY_MS);

  await supabase.from('orthographies').delete().eq('source_id', SOURCE_ID);

  const orthRows: Array<Record<string, unknown>> = [];
  for (const [glottocode, scripts] of scriptMap) {
    const langId = glottoToId.get(glottocode);
    if (!langId) continue;
    for (let i = 0; i < scripts.length; i++) {
      const s = scripts[i];
      orthRows.push({
        language_id: langId,
        name: s.name,
        script_iso15924: s.iso15924,
        is_primary: i === 0,
        status: 'standardized',
        source_id: SOURCE_ID,
      });
    }
  }

  let orthInserted = 0;
  for (let i = 0; i < orthRows.length; i += INSERT_BATCH) {
    const { error } = await supabase.from('orthographies').insert(orthRows.slice(i, i + INSERT_BATCH));
    if (!error) orthInserted += Math.min(INSERT_BATCH, orthRows.length - i);
    else console.warn(`  orthographies insert error: ${error.message}`);
    process.stdout.write(`\r  Inserting orthography rows: ${orthInserted}/${orthRows.length}...`);
  }
  console.log(`\n  Inserted ${orthInserted} orthography rows\n`);

  // ── Phase 4: UNESCO vitality ──────────────────────────────────────────────
  console.log('Phase 4: UNESCO vitality...');
  const vitalityMap = await fetchUNESCOVitality();
  console.log(`  ${vitalityMap.size} languages with UNESCO vitality data\n`);

  await supabase.from('vitality_assessments').delete().eq('source_id', SOURCE_ID);

  const vitRows: Array<Record<string, unknown>> = [];
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

  let vitInserted = 0;
  for (let i = 0; i < vitRows.length; i += INSERT_BATCH) {
    const { error } = await supabase.from('vitality_assessments').insert(vitRows.slice(i, i + INSERT_BATCH));
    if (!error) vitInserted += Math.min(INSERT_BATCH, vitRows.length - i);
    else console.warn(`  vitality_assessments insert error: ${error.message}`);
    process.stdout.write(`\r  Inserting vitality rows: ${vitInserted}/${vitRows.length}...`);
  }
  console.log(`\n  Inserted ${vitInserted} vitality assessment rows\n`);

  console.log('=== Done ===');
  console.log(`  QIDs:                   ${qidUpdated} updated`);
  console.log(`  Speaker populations:    ${spInserted} rows inserted`);
  console.log(`  Orthographies:          ${orthInserted} rows inserted`);
  console.log(`  Vitality assessments:   ${vitInserted} rows inserted`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

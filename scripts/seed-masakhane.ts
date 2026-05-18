/**
 * seed-masakhane.ts
 *
 * Fetches all Masakhane datasets from HuggingFace and populates text_corpora
 * with NLP benchmark coverage for ~40 African languages.
 *
 * For each dataset, the script:
 *   1. Pulls language tags (ISO 639-1 or ISO 639-3 codes)
 *   2. Determines task type from dataset name (ner, pos, mt, sentiment, etc.)
 *   3. Matches language codes to our languages table via iso_639_1 / iso_639_3
 *   4. Upserts one row per (language, corpus_name, task_type)
 *
 * Skips derived test-split datasets (*-translate-test), index datasets,
 * and datasets with no language tags.
 *
 * Coverage: ~40 African languages across 12 task types.
 * Run time: ~1–2 min (28 HuggingFace API calls + DB upserts).
 * Safe to re-run: upsert on UNIQUE(language_id, corpus_name, task_type).
 *
 * Source: https://huggingface.co/masakhane (CC BY 4.0 / AFL-3.0 per dataset)
 * Community: https://masakhane.io
 */

import { supabase } from './lib/supabase';

const HF_API = 'https://huggingface.co/api';
const SOURCE_ID = '11111111-0000-0000-0000-000000000017';

// Map HuggingFace dataset id → task_type
// Datasets not in this map use heuristics from task_categories tags.
const TASK_TYPE_OVERRIDES: Record<string, string> = {
  'masakhane/masakhaner':           'ner',
  'masakhane/masakhaner2':          'ner',
  'masakhane/masakhaner-x':         'ner',
  'masakhane/masakhapos':           'pos',
  'masakhane/masakhanews':          'news-classification',
  'masakhane/mafand':               'mt',
  'masakhane/AfriDocMT':            'mt',
  'masakhane/AfriMTE-WMT2024':      'mt',
  'masakhane/ntrex_african':        'mt',
  'masakhane/afrisenti':            'sentiment',
  'masakhane/afriqa':               'qa',
  'masakhane/afriqa-gold-passages': 'qa',
  'masakhane/afrixnli':             'nli',
  'masakhane/afrimmlu':             'llm-benchmark',
  'masakhane/afrimgsm':             'llm-benchmark',
  'masakhane/african-ultrachat':    'llm-benchmark',
  'masakhane/african-translated-alpaca': 'llm-benchmark',
  'masakhane/uhura-arc-easy':       'llm-benchmark',
  'masakhane/uhura-truthfulqa':     'llm-benchmark',
  'masakhane/afrixnli-translate-test':  'nli',
  'masakhane/afrimgsm-translate-test':  'llm-benchmark',
  'masakhane/afrimmlu-translate-test':  'llm-benchmark',
  'masakhane/InjongoIntent':        'llm-benchmark',
  'masakhane/AfrIFact':             'llm-benchmark',
  'masakhane/AfriADR':              'other',
};

// Datasets to skip (index files, non-language-specific, no usable language tags)
const SKIP_IDS = new Set([
  'masakhane/afriqa_wiki_en_fr_100',
  'masakhane/afriqa-prebuilt-sparse-indexes',
  'masakhane/africa-news',
]);

// Languages that appear in Masakhane but are not African — skip them
const NON_AFRICAN_CODES = new Set([
  'en', 'fr', 'ar', 'pt', 'de', 'it', 'es', 'ru', 'zh', 'ja', 'ko', 'nl',
  'arb', 'ary', 'arz', 'msa', 'tam', 'tel', 'urd', 'fra',
]);

function taskFromTags(tags: string[], datasetId: string): string {
  if (TASK_TYPE_OVERRIDES[datasetId]) return TASK_TYPE_OVERRIDES[datasetId]!;
  for (const tag of tags) {
    if (!tag.startsWith('task_categories:')) continue;
    const t = tag.replace('task_categories:', '');
    if (t === 'token-classification') return 'ner';
    if (t === 'translation') return 'mt';
    if (t === 'question-answering') return 'qa';
  }
  return 'other';
}

async function main() {
  // Register source
  const { error: srcErr } = await supabase.from('sources').upsert(
    {
      id: SOURCE_ID,
      name: 'Masakhane',
      type: 'academic',
      url: 'https://huggingface.co/masakhane',
      reliability_rating: 'high',
      notes:
        'Masakhane African NLP community. Research-quality benchmarks for ~40 African languages ' +
        'across NER, POS, MT, news classification, sentiment, QA, and LLM evaluation tasks.',
    },
    { onConflict: 'id' }
  );
  if (srcErr) throw new Error(`Source upsert failed: ${srcErr.message}`);

  // ------------------------------------------------------------------
  // 1. Load all language IDs from our DB keyed by ISO 639-1 and ISO 639-3
  // ------------------------------------------------------------------
  console.log('Loading language ISO codes from database...');
  const { data: langs, error: langErr } = await supabase
    .from('languages')
    .select('id, iso_639_1, iso_639_3')
    .or('iso_639_1.not.is.null,iso_639_3.not.is.null');
  if (langErr) throw new Error(`Language load failed: ${langErr.message}`);

  const iso1ToId = new Map<string, string>();
  const iso3ToId = new Map<string, string>();
  for (const l of langs ?? []) {
    if (l.iso_639_1) iso1ToId.set(l.iso_639_1.toLowerCase(), l.id);
    if (l.iso_639_3) iso3ToId.set(l.iso_639_3.toLowerCase(), l.id);
  }
  console.log(`  ${iso1ToId.size} ISO-1 codes, ${iso3ToId.size} ISO-3 codes indexed`);

  function resolveCode(code: string): string | null {
    const c = code.toLowerCase().trim();
    if (NON_AFRICAN_CODES.has(c)) return null;
    return iso1ToId.get(c) ?? iso3ToId.get(c) ?? null;
  }

  // ------------------------------------------------------------------
  // 2. Fetch all Masakhane datasets from HuggingFace
  // ------------------------------------------------------------------
  console.log('Fetching Masakhane dataset list from HuggingFace...');
  const listRes = await fetch(`${HF_API}/datasets?author=masakhane&limit=100`);
  if (!listRes.ok) throw new Error(`HF API error: ${listRes.status}`);
  const datasetList: Array<{ id: string; tags: string[] }> = await listRes.json();
  console.log(`  ${datasetList.length} datasets found`);

  // ------------------------------------------------------------------
  // 3. Fetch metadata for each dataset and build upsert rows
  // ------------------------------------------------------------------
  type TextCorpusRow = {
    language_id: string;
    source_id: string;
    corpus_name: string;
    task_type: string;
    hf_dataset_id: string;
    url: string;
    confidence: 'estimated';
  };

  const rows: TextCorpusRow[] = [];
  let datasetCount = 0;
  let langMatchCount = 0;
  let langMissCount = 0;

  for (const ds of datasetList) {
    if (SKIP_IDS.has(ds.id)) continue;

    // Fetch full metadata for this dataset
    const metaRes = await fetch(`${HF_API}/datasets/${ds.id}`);
    if (!metaRes.ok) {
      console.warn(`  Skipping ${ds.id}: HTTP ${metaRes.status}`);
      continue;
    }
    const meta: { tags?: string[] } = await metaRes.json();
    const tags: string[] = meta.tags ?? [];

    const taskType = taskFromTags(tags, ds.id);

    // Extract language tags
    const langTags = tags
      .filter((t) => t.startsWith('language:'))
      .map((t) => t.replace('language:', ''));

    if (langTags.length === 0) continue;

    // Short display name: strip "masakhane/" prefix
    const corpusName = ds.id.replace('masakhane/', '');

    for (const code of langTags) {
      const languageId = resolveCode(code);
      if (!languageId) {
        if (!NON_AFRICAN_CODES.has(code.toLowerCase())) langMissCount++;
        continue;
      }
      rows.push({
        language_id: languageId,
        source_id: SOURCE_ID,
        corpus_name: corpusName,
        task_type: taskType,
        hf_dataset_id: ds.id,
        url: `https://huggingface.co/datasets/${ds.id}`,
        confidence: 'estimated',
      });
      langMatchCount++;
    }
    datasetCount++;
    process.stdout.write(`  ${datasetCount}: ${ds.id} (${taskType}) — ${langTags.length} langs\n`);
  }

  console.log(`\n  ${rows.length} rows to upsert (${langMatchCount} matches, ${langMissCount} unmatched codes)`);

  // ------------------------------------------------------------------
  // 4. Batch upsert
  // ------------------------------------------------------------------
  const BATCH = 200;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('text_corpora')
      .upsert(batch, { onConflict: 'language_id,corpus_name,task_type' });
    if (error) throw new Error(`Upsert failed at offset ${i}: ${error.message}`);
    inserted += batch.length;
  }

  console.log(`\nMasakhane seed complete: ${inserted} rows upserted across ${datasetCount} datasets.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

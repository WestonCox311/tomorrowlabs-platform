/**
 * seed-huggingface-models.ts
 *
 * Seeds language_models rows from the HuggingFace Hub API.
 * Covers top TTS and ASR (STT) models by download count, filtered to
 * models with a manageable number of language tags (1–10 languages).
 *
 * Source: https://huggingface.co/api/models (public API, no auth)
 *
 * Run: npm run seed:huggingface
 */

import { supabase } from './lib/supabase';

const HF_API = 'https://huggingface.co/api/models';
const SOURCE_ID = '11111111-0000-0000-0000-000000000012';

// How many models to fetch per pipeline type (sorted by downloads desc)
const FETCH_LIMIT = 500;

// Skip models tagged for too many languages (likely multilingual catch-alls)
const MAX_LANG_TAGS = 8;

// Minimum download count to include
const MIN_DOWNLOADS = 500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

interface HFModel {
  id: string;
  pipeline_tag: string;
  tags: string[];
  downloads: number;
  likes: number;
  createdAt: string;
}

/** Extract language ISO tags from the model's tags array */
function extractLangTags(tags: string[]): string[] {
  // HuggingFace tags ISO 639-1 codes directly (e.g. "en", "fr", "sw")
  // and sometimes 639-3 (e.g. "haw") — filter to likely language codes
  return tags.filter((t) => /^[a-z]{2,3}(-[A-Z]{2})?$/.test(t) && !EXCLUDED_TAGS.has(t));
}

// Tags that look like language codes but aren't
const EXCLUDED_TAGS = new Set([
  'cpu', 'gpu', 'tpu', 'onnx', 'pt', 'tf', 'jax', 'fp', 'bf',
  'en-us', // we handle locale variants separately
]);

/** Derive a provider name from the HuggingFace model ID (owner/model-name) */
function inferProvider(modelId: string): string {
  const owner = modelId.split('/')[0]?.toLowerCase() ?? 'community';
  const providerMap: Record<string, string> = {
    openai: 'openai',
    facebook: 'meta',
    'facebook-ai-research': 'meta',
    microsoft: 'microsoft',
    google: 'google',
    mozilla: 'mozilla',
    coqui: 'community',
    'suno-ai': 'community',
    espnet: 'academic',
    speechbrain: 'academic',
    bark: 'community',
  };
  return providerMap[owner] ?? 'community';
}

/** Infer quality tier from download count as a rough proxy */
function inferQuality(downloads: number): 'production' | 'usable' | 'experimental' {
  if (downloads >= 100000) return 'production';
  if (downloads >= 10000) return 'usable';
  return 'experimental';
}

async function fetchModels(pipelineTag: string): Promise<HFModel[]> {
  const url = `${HF_API}?pipeline_tag=${pipelineTag}&sort=downloads&direction=-1&limit=${FETCH_LIMIT}&full=false`;
  console.log(`Fetching HuggingFace ${pipelineTag} models…`);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'TomorrowLabs-seed/1.0' },
  });
  if (!res.ok) throw new Error(`HuggingFace API HTTP ${res.status}`);
  const models: HFModel[] = await res.json();
  console.log(`  → ${models.length} models returned`);
  return models;
}

async function seedModels(
  models: HFModel[],
  modelType: 'stt' | 'tts'
): Promise<number> {
  // Filter to models with sensible language coverage
  const usable = models.filter(
    (m) => m.downloads >= MIN_DOWNLOADS && m.tags && m.tags.length > 0
  );

  console.log(`  Usable models (≥${MIN_DOWNLOADS} downloads): ${usable.length}`);

  let inserted = 0;

  for (const model of usable) {
    const langTags = extractLangTags(model.tags);
    if (langTags.length === 0 || langTags.length > MAX_LANG_TAGS) continue;

    // Separate 2-letter (iso_639_1) and 3-letter (iso_639_3) codes
    const twoLetter = langTags.filter((t) => t.length === 2);
    const threeLetter = langTags.filter((t) => t.length === 3);

    // Look up language IDs
    const matches: Array<{ id: string; english_name: string }> = [];

    if (twoLetter.length > 0) {
      const { data } = await supabase
        .from('languages')
        .select('id, english_name')
        .in('iso_639_1', twoLetter);
      if (data) matches.push(...data);
    }

    if (threeLetter.length > 0) {
      const alreadyIds = new Set(matches.map((m) => m.id));
      const { data } = await supabase
        .from('languages')
        .select('id, english_name')
        .in('iso_639_3', threeLetter);
      if (data) {
        for (const row of data) {
          if (!alreadyIds.has(row.id)) matches.push(row);
        }
      }
    }

    if (matches.length === 0) continue;

    const modelUrl = `https://huggingface.co/${model.id}`;
    const rows = matches.map((lang) => ({
      language_id: lang.id,
      model_name: model.id.split('/').pop() ?? model.id, // use model slug as name
      provider: inferProvider(model.id),
      model_type: modelType,
      quality_tier: inferQuality(model.downloads),
      is_open_source: true,
      license: null as string | null, // license not in API response without full=true
      source_url: modelUrl,
      source_id: SOURCE_ID,
      notes: `${model.downloads.toLocaleString()} downloads · ${model.likes} likes on HuggingFace`,
      last_verified_at: new Date().toISOString().slice(0, 10),
    }));

    const { error } = await supabase.from('language_models').insert(rows);
    if (error && !error.message.includes('duplicate')) {
      console.warn(`  Warning inserting ${model.id}: ${error.message}`);
    } else {
      inserted += rows.length;
    }

    await sleep(50); // gentle pacing
  }

  return inserted;
}

async function main() {
  const [ttsModels, asrModels] = await Promise.all([
    fetchModels('text-to-speech'),
    fetchModels('automatic-speech-recognition'),
  ]);

  console.log('\nSeeding TTS models…');
  const ttsInserted = await seedModels(ttsModels, 'tts');
  console.log(`  Inserted: ${ttsInserted} language-model rows`);

  console.log('\nSeeding ASR/STT models…');
  const asrInserted = await seedModels(asrModels, 'stt');
  console.log(`  Inserted: ${asrInserted} language-model rows`);

  const { count } = await supabase
    .from('language_models')
    .select('*', { count: 'exact', head: true })
    .eq('provider', 'community');

  console.log(`\nDone. Total HuggingFace-sourced rows in DB: ${(ttsInserted + asrInserted).toLocaleString()}`);
  console.log(`Total community provider rows: ${count}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

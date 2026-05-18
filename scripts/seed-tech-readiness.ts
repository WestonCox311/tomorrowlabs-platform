/**
 * seed-tech-readiness.ts
 *
 * Upserts tech_readiness rows for ~75 languages beyond the 27 already seeded
 * by migrations 000–001. Data sourced from:
 *
 *   - Omnilingual ASR paper (Meta / arXiv 2511.09690, Nov 2025) — CER values
 *   - Mozilla Common Voice stats (cv.mozilla.org, Dataset 17.0 / 2024) — CV hours
 *   - Google Cloud TTS/STT, AWS Polly/Transcribe, Azure Cognitive Services — tier
 *   - Ethnologue, Glottolog, SIL — script/keyboard/font metadata
 *
 * Assessed date used: 2026-01-15 (reflects language-tech landscape at start of 2026).
 *
 * Safe to re-run — uses onConflict: 'language_id' upsert.
 * Languages already in tech_readiness (the 27 Babagigi languages) are not
 * overwritten unless they are also in this dataset.
 */

import { supabase } from './lib/supabase';

type TechQuality = 'production' | 'usable' | 'experimental' | 'none';

interface LangTechData {
  glottocode: string;
  label: string; // human-readable label for logging — not written to DB
  stt_quality_tier: TechQuality;
  tts_quality_tier: TechQuality;
  omnilingual_supported: boolean;
  omnilingual_cer?: number;
  common_voice_hours_validated?: number;
  common_voice_dataset_version?: string;
  ipa_pipeline_viable: boolean;
  ipa_pipeline_notes?: string;
  keyboard_support?: 'full' | 'partial' | 'none';
  font_availability?: 'commercial' | 'open-source' | 'limited' | 'none';
  rendering_complexity?: 'standard' | 'complex-shaping' | 'bidirectional' | 'vertical';
  notable_gaps?: string;
  notes?: string;
}

const ASSESSED_AT = '2026-01-15';
const CV_VERSION = '17.0';

// ─── EUROPEAN — GERMANIC ──────────────────────────────────────────────────────

const GERMANIC: LangTechData[] = [
  {
    glottocode: 'dutc1256', label: 'Dutch',
    stt_quality_tier: 'production', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 4.7,
    common_voice_hours_validated: 810, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'G2P mature; commercial pipeline preferred.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Full support: Google Cloud, AWS Polly, Azure Cognitive Services. Multiple production voices.',
  },
  {
    glottocode: 'swed1254', label: 'Swedish',
    stt_quality_tier: 'usable', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 4.4,
    common_voice_hours_validated: 470, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'G2P tools available; pitch accent manageable.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Strong TTS from Google/Azure/AWS. STT slightly behind English-tier but functional.',
  },
  {
    glottocode: 'norw1258', label: 'Norwegian Bokmål',
    stt_quality_tier: 'usable', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 4.8,
    common_voice_hours_validated: 200, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Pitch accent present but simplified in standard Bokmål.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Azure and Google TTS both offer Norwegian voices. STT improving rapidly.',
  },
  {
    glottocode: 'dani1285', label: 'Danish',
    stt_quality_tier: 'usable', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 5.1,
    common_voice_hours_validated: 110, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Stød (laryngeal feature) adds phonological complexity.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'Stød is difficult for G2P models; STT accuracy drops in informal speech.',
    notes: 'Production TTS; STT improving. Informal Danish speech challenging for ASR.',
  },
  {
    glottocode: 'afri1274', label: 'Afrikaans',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 7.9,
    common_voice_hours_validated: 25, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Highly regular phonology; G2P straightforward.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Azure TTS added Afrikaans (2023). Omnilingual covers well. Small but growing CV dataset.',
  },
];

// ─── EUROPEAN — ROMANCE ───────────────────────────────────────────────────────

const ROMANCE: LangTechData[] = [
  {
    glottocode: 'roma1327', label: 'Romanian',
    stt_quality_tier: 'usable', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 5.9,
    common_voice_hours_validated: 140, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script; G2P tools available.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Google Cloud and Azure both offer Romanian TTS. Strong CV community.',
  },
  {
    glottocode: 'cata1282', label: 'Catalan',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 5.2,
    common_voice_hours_validated: 1700, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Softcatalà G2P; large open corpus.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Exceptionally large CV dataset (1700h) due to Softcatalà community. Catalan-specific TTS from festcat/festival.',
  },
  {
    glottocode: 'gali1258', label: 'Galician',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 5.6,
    common_voice_hours_validated: 45, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Close to Portuguese; existing G2P adaptable.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Galician-Portuguese continuum gives access to Portuguese tooling. Proxl TTS project.',
  },
];

// ─── EUROPEAN — SLAVIC ────────────────────────────────────────────────────────

const SLAVIC: LangTechData[] = [
  {
    glottocode: 'ukra1253', label: 'Ukrainian',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 7.3,
    common_voice_hours_validated: 170, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Cyrillic G2P; stress not marked in text — challenge for TTS.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'Stress placement not orthographically marked; TTS quality varies significantly.',
    notes: 'Increased investment post-2022. Microsoft Azure TTS, Google Cloud. Ukranian CV community active.',
  },
  {
    glottocode: 'bulg1262', label: 'Bulgarian',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 6.8,
    common_voice_hours_validated: 45, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Cyrillic; G2P available. Relatively regular phonology.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Azure and Google TTS support Bulgarian. STT improving.',
  },
  {
    glottocode: 'croa1245', label: 'Croatian',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 6.5,
    common_voice_hours_validated: 60, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script; pitch-accent complexity but G2P tools exist.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Azure TTS has Croatian voice. Shared tooling with Serbian (mutual intelligibility).',
  },
  {
    glottocode: 'serb1264', label: 'Serbian',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 6.7,
    common_voice_hours_validated: 45, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Dual Cyrillic/Latin; regular phonology helps G2P.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Dual-script (Cyrillic and Latin). Azure TTS has Serbian. CV dataset growing.',
  },
  {
    glottocode: 'czec1258', label: 'Czech',
    stt_quality_tier: 'usable', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 5.7,
    common_voice_hours_validated: 440, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Regular phonology; G2P well-studied.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Strong Czech TTS from Google, Azure. Large CV dataset. University research active.',
  },
  {
    glottocode: 'slov1269', label: 'Slovak',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 6.4,
    common_voice_hours_validated: 60, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Close to Czech; G2P adapts well.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Benefits from Czech tooling proximity. Azure has Slovak TTS voice.',
  },
  {
    glottocode: 'slov1268', label: 'Slovenian',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 7.1,
    common_voice_hours_validated: 60, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Pitch accent present; G2P tools from Jožef Stefan Institute.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Strong academic research base (Jožef Stefan). Azure TTS includes Slovenian.',
  },
  {
    glottocode: 'mace1250', label: 'Macedonian',
    stt_quality_tier: 'experimental', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 8.4,
    common_voice_hours_validated: 15, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Cyrillic; stress predictable. G2P feasible.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Limited commercial TTS; research-grade STT. Macedonian phonology well-documented.',
  },
];

// ─── EUROPEAN — BALTIC ───────────────────────────────────────────────────────

const BALTIC: LangTechData[] = [
  {
    glottocode: 'latv1249', label: 'Latvian',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 8.2,
    common_voice_hours_validated: 30, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Highly regular phonology; tone distinctions manageable.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'University of Latvia TTS research. Azure TTS has Latvian. Omnilingual covers well.',
  },
  {
    glottocode: 'lith1251', label: 'Lithuanian',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 7.9,
    common_voice_hours_validated: 35, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Pitch accent complex but documented. G2P tools exist.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Azure TTS has Lithuanian. Research active at Vilnius University.',
  },
  {
    glottocode: 'esto1258', label: 'Estonian',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 8.7,
    common_voice_hours_validated: 45, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Three-way length contrast adds G2P complexity.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'Three vowel/consonant length distinctions phonemically challenging for G2P.',
    notes: 'Azure TTS includes Estonian. University of Tartu active in NLP research.',
  },
];

// ─── EUROPEAN — FINNO-UGRIC ──────────────────────────────────────────────────

const FINNO_UGRIC: LangTechData[] = [
  {
    glottocode: 'finn1318', label: 'Finnish',
    stt_quality_tier: 'usable', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 6.3,
    common_voice_hours_validated: 110, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Highly regular phonology; G2P is almost trivial.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Google Cloud and Azure have Finnish TTS. Phonological regularity makes it an IPA pipeline showcase.',
  },
  {
    glottocode: 'hung1274', label: 'Hungarian',
    stt_quality_tier: 'usable', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 7.4,
    common_voice_hours_validated: 120, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Agglutinative morphology complicates tokenization but phonology is regular.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'Heavy agglutination produces very long words; STT models need large vocab.',
    notes: 'Azure and Google Cloud TTS for Hungarian. BEA speech corpus from Budapest.',
  },
];

// ─── EUROPEAN — CELTIC ───────────────────────────────────────────────────────

const CELTIC: LangTechData[] = [
  {
    glottocode: 'wels1247', label: 'Welsh',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 9.2,
    common_voice_hours_validated: 1600, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Bangor University Merlin TTS; Welsh Language Technology Unit G2P.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Outsize CV dataset (1600h) due to Welsh Government / Mozilla funding. Welsh Language Technology Unit drives quality.',
  },
  {
    glottocode: 'iris1253', label: 'Irish',
    stt_quality_tier: 'experimental', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 12.8,
    common_voice_hours_validated: 6, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Initial mutations make G2P highly context-dependent.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'Consonant mutations (lenition, eclipsis) require morphological parsing for accurate G2P.',
    notes: 'ABAIR TTS project (Trinity College Dublin) has production-quality Irish voices. STT remains limited.',
  },
];

// ─── EUROPEAN — TURKIC ───────────────────────────────────────────────────────

const TURKIC_EU: LangTechData[] = [
  {
    glottocode: 'turk1311', label: 'Turkish',
    stt_quality_tier: 'production', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 5.8,
    common_voice_hours_validated: 600, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script; agglutinative but very regular phonology.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Full commercial support: Google Cloud, AWS Polly, Azure. Large CV dataset. Strong research community (Istanbul Technical University).',
  },
];

// ─── EUROPEAN — IBERIAN (NON-ROMANCE) ────────────────────────────────────────

const IBERIAN: LangTechData[] = [
  {
    glottocode: 'basq1248', label: 'Basque',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 8.4,
    common_voice_hours_validated: 280, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Aholab TTS (Basque Country Univ). Phonology well-documented; G2P mature.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Aholab and Ixa research groups drive quality. Large CV dataset for its speaker population size (~750k).',
  },
  {
    glottocode: 'malt1254', label: 'Maltese',
    stt_quality_tier: 'experimental', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 11.4,
    common_voice_hours_validated: 8, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Semitic-Romance hybrid; G2P complex but manageable.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'Semitic root-pattern morphology + Romance loanwords creates G2P complexity.',
    notes: 'University of Malta MLRS project. Azure TTS has Maltese voice. Unique Semitic-Romance hybrid language.',
  },
];

// ─── CAUCASUS ────────────────────────────────────────────────────────────────

const CAUCASUS: LangTechData[] = [
  {
    glottocode: 'geor1253', label: 'Georgian',
    stt_quality_tier: 'experimental', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 8.9,
    common_voice_hours_validated: 35, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Mkhedruli script unique but phonologically transparent. G2P feasible.',
    keyboard_support: 'full', font_availability: 'open-source', rendering_complexity: 'standard',
    notes: 'Mkhedruli script has good Unicode support. Azure TTS has Georgian (2023). STT improving via CV.',
  },
  {
    glottocode: 'east2422', label: 'Eastern Armenian',
    stt_quality_tier: 'experimental', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 11.2,
    common_voice_hours_validated: 90, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Armenian script phonologically transparent; G2P tools from ArmSoft.',
    keyboard_support: 'full', font_availability: 'open-source', rendering_complexity: 'standard',
    notes: 'Azure TTS has Armenian. Omnilingual CER at 11% — usable for some applications. Eastern (Armenia) and Western (diaspora) differ.',
  },
];

// ─── CENTRAL ASIAN ───────────────────────────────────────────────────────────

const CENTRAL_ASIAN: LangTechData[] = [
  {
    glottocode: 'nort2697', label: 'North Azerbaijani',
    stt_quality_tier: 'experimental', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 10.8,
    common_voice_hours_validated: 25, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script (post-1991 reform); Turkic phonology regular.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Azure TTS has Azerbaijani. Omnilingual covers at ~11% CER. Latin script since 1991.',
  },
  {
    glottocode: 'kaza1248', label: 'Kazakh',
    stt_quality_tier: 'experimental', tts_quality_tier: 'experimental',
    omnilingual_supported: true, omnilingual_cer: 12.1,
    common_voice_hours_validated: 25, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Transitioning from Cyrillic to Latin; G2P in flux.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'Script transition (Cyrillic → Latin) creates inconsistent training data.',
    notes: 'Kazakh NLP progressing. Omnilingual adds coverage. Script standardization ongoing.',
  },
  {
    glottocode: 'uzbe1247', label: 'Uzbek',
    stt_quality_tier: 'experimental', tts_quality_tier: 'experimental',
    omnilingual_supported: true, omnilingual_cer: 11.8,
    common_voice_hours_validated: 20, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script (post-1993); Turkic phonology helps.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Latin script since 1993. Omnilingual covers at ~12% CER. Growing NLP investment.',
  },
];

// ─── MIDDLE EASTERN ──────────────────────────────────────────────────────────

const MIDDLE_EASTERN: LangTechData[] = [
  {
    glottocode: 'west2369', label: 'Western Farsi (Persian)',
    stt_quality_tier: 'usable', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 7.6,
    common_voice_hours_validated: 280, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Persian-specific G2P from hazm library; Arabic-script G2P mature.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'bidirectional',
    notes: 'Google Cloud and Azure TTS for Persian. Large diaspora (US, Europe) drives investment. CV dataset strong.',
  },
];

// ─── SOUTH ASIAN ─────────────────────────────────────────────────────────────

const SOUTH_ASIAN: LangTechData[] = [
  {
    glottocode: 'beng1280', label: 'Bengali',
    stt_quality_tier: 'production', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 9.1,
    common_voice_hours_validated: 180, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Bengali G2P from indic-transliteration; complex script.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'complex-shaping',
    notes: 'Google Cloud TTS production-grade. 230M+ speakers drives commercial investment. CV dataset growing.',
  },
  {
    glottocode: 'tami1289', label: 'Tamil',
    stt_quality_tier: 'usable', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 8.7,
    common_voice_hours_validated: 390, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Tamil G2P mature; script complex but phonologically transparent.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'complex-shaping',
    notes: 'Google Cloud TTS production-grade Tamil. Large CV dataset. Strong diaspora in UK, Canada, Singapore drives investment.',
  },
  {
    glottocode: 'telu1262', label: 'Telugu',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 9.3,
    common_voice_hours_validated: 65, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Abugida script; G2P tools from IIT research.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'complex-shaping',
    notes: 'Google Cloud TTS supports Telugu. Second-largest Dravidian language. IIT Hyderabad research active.',
  },
  {
    glottocode: 'mara1378', label: 'Marathi',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 10.4,
    common_voice_hours_validated: 50, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Devanagari; shared G2P infrastructure with Hindi.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'complex-shaping',
    notes: 'Shares Devanagari script with Hindi; much tooling transferable. Google Cloud TTS covers Marathi.',
  },
  {
    glottocode: 'nepa1254', label: 'Nepali',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 9.8,
    common_voice_hours_validated: 70, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Devanagari; close to Hindi. G2P transferable.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'complex-shaping',
    notes: 'Azure TTS has Nepali voice. Omnilingual near the 10% threshold. Shared Devanagari tooling.',
  },
  {
    glottocode: 'sinh1246', label: 'Sinhala',
    stt_quality_tier: 'experimental', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 14.2,
    common_voice_hours_validated: 45, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Sinhala script complex but G2P from University of Colombo.',
    keyboard_support: 'partial', font_availability: 'open-source', rendering_complexity: 'complex-shaping',
    notable_gaps: 'CER of 14% makes Omnilingual borderline for production. Script rendering inconsistent across platforms.',
    notes: 'University of Colombo LangNet project. Azure TTS has Sinhala. Growing CV dataset.',
  },
  {
    glottocode: 'panj1256', label: 'Punjabi (Gurmukhi)',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 10.1,
    common_voice_hours_validated: 30, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Gurmukhi script phonologically transparent; G2P from IIT Patiala.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'complex-shaping',
    notes: 'Azure TTS has Punjabi (Gurmukhi). Large Punjabi diaspora in Canada/UK drives investment.',
  },
];

// ─── SOUTHEAST ASIAN ─────────────────────────────────────────────────────────

const SOUTHEAST_ASIAN: LangTechData[] = [
  {
    glottocode: 'thai1261', label: 'Thai',
    stt_quality_tier: 'production', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 8.2,
    common_voice_hours_validated: 80, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'BEST Thai G2P; tonal language with complex word segmentation.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'complex-shaping',
    notes: 'Google Cloud and AWS have production Thai TTS/STT. Active Thai NLP community (ThaiNLP). 70M speakers.',
  },
  {
    glottocode: 'indo1316', label: 'Indonesian',
    stt_quality_tier: 'production', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 4.9,
    common_voice_hours_validated: 280, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script; very regular phonology. G2P trivial.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Full commercial support: Google, AWS, Azure. Extremely regular phonology gives outstanding Omnilingual CER (4.9%). 270M speakers.',
  },
  {
    glottocode: 'stan1306', label: 'Standard Malay',
    stt_quality_tier: 'usable', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 5.2,
    common_voice_hours_validated: 75, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Close to Indonesian; G2P and phonology nearly identical.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Mutual intelligibility with Indonesian allows significant tooling reuse. Azure TTS has Malaysian Malay.',
  },
  {
    glottocode: 'java1254', label: 'Javanese',
    stt_quality_tier: 'experimental', tts_quality_tier: 'experimental',
    omnilingual_supported: true, omnilingual_cer: 12.4,
    common_voice_hours_validated: 0, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Javanese script (Hanacaraka) or Latin; G2P tools emerging from BRIN.',
    keyboard_support: 'partial', font_availability: 'limited', rendering_complexity: 'complex-shaping',
    notable_gaps: 'No Common Voice data. Speech register system (Ngoko/Madya/Krama) adds complexity.',
    notes: '98M speakers but severely under-resourced in tech. Omnilingual provides baseline at ~12% CER.',
  },
  {
    glottocode: 'sund1252', label: 'Sundanese',
    stt_quality_tier: 'experimental', tts_quality_tier: 'experimental',
    omnilingual_supported: true, omnilingual_cer: 13.8,
    common_voice_hours_validated: 0, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script predominant in modern use; G2P feasible.',
    keyboard_support: 'full', font_availability: 'limited', rendering_complexity: 'standard',
    notable_gaps: 'No Common Voice dataset. Limited TTS research outside Bandung Institute of Technology.',
    notes: '42M speakers; second-largest language in Indonesia. Under-resourced relative to speaker count.',
  },
  {
    glottocode: 'cebu1242', label: 'Cebuano',
    stt_quality_tier: 'experimental', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 12.8,
    common_voice_hours_validated: 8, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script; phonology well-documented. G2P straightforward.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: '20M speakers in Visayas/Mindanao. Google TTS has Cebuano voice. Second-largest Philippine language.',
  },
  {
    glottocode: 'nucl1310', label: 'Burmese',
    stt_quality_tier: 'experimental', tts_quality_tier: 'experimental',
    omnilingual_supported: true, omnilingual_cer: 16.9,
    common_voice_hours_validated: 10, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Myanmar script complex; G2P tools emerging from MyanmarNLP.',
    keyboard_support: 'partial', font_availability: 'limited', rendering_complexity: 'complex-shaping',
    notable_gaps: 'Myanmar script rendering inconsistent across platforms. Omnilingual CER 17% — limited reliability.',
    notes: 'MyanmarNLP project (Mandalay Technology University). Script encoding issues (Zawgyi vs Unicode) complicate datasets.',
  },
  {
    glottocode: 'iloc1237', label: 'Ilocano',
    stt_quality_tier: 'none', tts_quality_tier: 'experimental',
    omnilingual_supported: false,
    common_voice_hours_validated: 4, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script; regular phonology. G2P relatively simple.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'No commercial STT. Very limited TTS research. Third-largest Philippine language.',
    notes: '9M speakers in Ilocos region and diaspora. Under-resourced relative to Filipino/Tagalog.',
  },
];

// ─── EAST ASIAN ──────────────────────────────────────────────────────────────

const EAST_ASIAN: LangTechData[] = [
  {
    glottocode: 'mand1415', label: 'Mandarin (zh)',
    stt_quality_tier: 'production', tts_quality_tier: 'production',
    omnilingual_supported: true, omnilingual_cer: 4.2,
    common_voice_hours_validated: 580, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Already seeded in Babagigi — updating with IPA note.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Already seeded as Babagigi Wave 1. Updated data.',
  },
];

// ─── AFRICA ──────────────────────────────────────────────────────────────────

const AFRICAN: LangTechData[] = [
  {
    glottocode: 'swah1253', label: 'Swahili',
    stt_quality_tier: 'usable', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 10.2,
    common_voice_hours_validated: 0, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Highly regular Latin orthography. G2P near-trivial.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'No Common Voice data. STT training data concentrated in East African formal speech.',
    notes: 'Google Cloud TTS has Swahili. 200M speakers (L1+L2). Omnilingual near 10% threshold. AI4D project active.',
  },
  {
    glottocode: 'amha1245', label: 'Amharic',
    stt_quality_tier: 'experimental', tts_quality_tier: 'experimental',
    omnilingual_supported: true, omnilingual_cer: 14.8,
    common_voice_hours_validated: 5, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Ethiopic (Ge\'ez) script; consonant-heavy phonology. G2P tools from Addis Ababa Univ.',
    keyboard_support: 'full', font_availability: 'open-source', rendering_complexity: 'standard',
    notable_gaps: 'CER 15% reduces reliability. Minimal training data. Gemination phonemically significant.',
    notes: '57M speakers; official language of Ethiopia. Google Translate support drives baseline. Masakhane project active.',
  },
  {
    glottocode: 'yoru1245', label: 'Yoruba',
    stt_quality_tier: 'experimental', tts_quality_tier: 'experimental',
    omnilingual_supported: true, omnilingual_cer: 18.3,
    common_voice_hours_validated: 12, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Tonal language with diacritic marking; G2P tools from Masakhane.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'CER 18% — low reliability. Tone diacritics often omitted in text which breaks G2P. Limited training data.',
    notes: '47M speakers (Nigeria/Benin). Masakhane NLP project driving West African language research. Afro-centric AI4D.',
  },
  {
    glottocode: 'igbo1259', label: 'Igbo',
    stt_quality_tier: 'none', tts_quality_tier: 'experimental',
    omnilingual_supported: true, omnilingual_cer: 22.1,
    common_voice_hours_validated: 5, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Tone marking critical; G2P tools from IgboNLP project.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'CER 22% — essentially unusable for production. Tone marking almost never used in text. Severely under-resourced.',
    notes: '45M speakers. IgboNLP and Masakhane projects building foundation. Igbo tone essential but rarely marked in text.',
  },
  {
    glottocode: 'haus1257', label: 'Hausa',
    stt_quality_tier: 'experimental', tts_quality_tier: 'experimental',
    omnilingual_supported: true, omnilingual_cer: 16.7,
    common_voice_hours_validated: 8, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script (Boko); tonal with length contrast. G2P tools emerging.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'CER 17% limits reliability. Tone/length rarely marked in standard text.',
    notes: '70M speakers (Nigeria/Niger/Chad). Lingua franca of West Africa. Masakhane + AI4D attention. Growing research base.',
  },
  {
    glottocode: 'zulu1248', label: 'Zulu',
    stt_quality_tier: 'experimental', tts_quality_tier: 'experimental',
    omnilingual_supported: true, omnilingual_cer: 19.4,
    common_voice_hours_validated: 0, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script; click phonemes complicate ASR training.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'Click consonants (c, q, x) require specialized ASR training. No CV data. CER 19% on Omnilingual.',
    notes: '12M speakers (South Africa official language). SADiLaR (South African Digital Innovation Lab) research. Click phonemes challenging for ASR.',
  },
  {
    glottocode: 'xhos1239', label: 'Xhosa',
    stt_quality_tier: 'experimental', tts_quality_tier: 'experimental',
    omnilingual_supported: true, omnilingual_cer: 21.8,
    common_voice_hours_validated: 0, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script; high click consonant density vs Zulu.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'Click density (15-20% of consonants) most challenging of SADiLaR Nguni languages for ASR.',
    notes: '8M speakers (South Africa). Even more click phonemes than Zulu. SADiLaR project. Mandela\'s native language — symbolic importance.',
  },
  {
    glottocode: 'soma1255', label: 'Somali',
    stt_quality_tier: 'none', tts_quality_tier: 'none',
    omnilingual_supported: true, omnilingual_cer: 22.4,
    common_voice_hours_validated: 5, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script adopted 1972; phonology complex. G2P tools minimal.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'CER 22% — effectively no reliable ASR. No production TTS. Critical diaspora language severely under-resourced.',
    notes: '22M speakers; major US diaspora (Minneapolis/St. Paul). No viable commercial voice tech. Critically under-resourced relative to community size.',
  },
  {
    glottocode: 'tigr1271', label: 'Tigrinya',
    stt_quality_tier: 'none', tts_quality_tier: 'none',
    omnilingual_supported: false,
    common_voice_hours_validated: 0,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Ethiopic (Ge\'ez) script; similar to Amharic. G2P from Amharic tools adaptable.',
    keyboard_support: 'full', font_availability: 'open-source', rendering_complexity: 'standard',
    notable_gaps: 'Not in Omnilingual 1600. No commercial tech. Eritrean diaspora in US/EU a major gap.',
    notes: '8M speakers (Eritrea/Ethiopia). Major US diaspora. No voice tech pipeline. Shares Ge\'ez script with Amharic but distinct language.',
  },
  {
    glottocode: 'kiny1244', label: 'Kinyarwanda',
    stt_quality_tier: 'experimental', tts_quality_tier: 'experimental',
    omnilingual_supported: true, omnilingual_cer: 17.6,
    common_voice_hours_validated: 30, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script; noun class system complex but phonology regular.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Rwanda government AI investment driving improvement. Mozilla CV partnership. Omnilingual coverage at ~18% CER.',
  },
  {
    glottocode: 'wolo1247', label: 'Wolof',
    stt_quality_tier: 'none', tts_quality_tier: 'none',
    omnilingual_supported: false,
    common_voice_hours_validated: 0,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script; tone not usually marked. Phonology well-documented.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'No Omnilingual support. No CV data. No commercial tech. Senegalese diaspora (France, US) a gap.',
    notes: '12M speakers; dominant street language of Senegal. Masakhane has begun work. Completely under-resourced commercially.',
  },
  {
    glottocode: 'shon1251', label: 'Shona',
    stt_quality_tier: 'none', tts_quality_tier: 'none',
    omnilingual_supported: false,
    common_voice_hours_validated: 0,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Latin script; tone not marked. G2P feasible but requires tonal training data.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'No Omnilingual coverage. No CV data. Tone linguistically present but not written.',
    notes: '14M speakers (Zimbabwe). African language research from University of Zimbabwe and Masakhane. No commercial pipeline.',
  },
];

// ─── PACIFIC ─────────────────────────────────────────────────────────────────

const PACIFIC: LangTechData[] = [
  {
    glottocode: 'maor1246', label: 'Māori',
    stt_quality_tier: 'experimental', tts_quality_tier: 'usable',
    omnilingual_supported: true, omnilingual_cer: 13.4,
    common_voice_hours_validated: 2, common_voice_dataset_version: CV_VERSION,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Very regular phonology; only ~16 phonemes. G2P near-trivial.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notes: 'Te Hiku Media (iwi-led) has built Te Kōrero STT and Papa Reo TTS using community data. Sovereignty-focused data approach. NZ government funding.',
  },
  {
    glottocode: 'hawa1245', label: 'Hawaiian',
    stt_quality_tier: 'none', tts_quality_tier: 'none',
    omnilingual_supported: false,
    common_voice_hours_validated: 0,
    ipa_pipeline_viable: true, ipa_pipeline_notes: 'Very small phoneme inventory (13 phonemes); G2P trivial. Lacks training data.',
    keyboard_support: 'full', font_availability: 'commercial', rendering_complexity: 'standard',
    notable_gaps: 'Only ~2,000 L1 speakers. No commercial tech pipeline. Academic work at UH Hilo.',
    notes: 'Critically endangered. University of Hawaiʻi at Hilo Hale Kuamoʻo. No viable voice tech without community-led data collection.',
  },
];

// ─── COMBINE ALL ─────────────────────────────────────────────────────────────

const ALL_LANGUAGES: LangTechData[] = [
  ...GERMANIC,
  ...ROMANCE,
  ...SLAVIC,
  ...BALTIC,
  ...FINNO_UGRIC,
  ...CELTIC,
  ...TURKIC_EU,
  ...IBERIAN,
  ...CAUCASUS,
  ...CENTRAL_ASIAN,
  ...MIDDLE_EASTERN,
  ...SOUTH_ASIAN,
  ...SOUTHEAST_ASIAN,
  ...EAST_ASIAN,
  ...AFRICAN,
  ...PACIFIC,
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const glottocodes = ALL_LANGUAGES.map((l) => l.glottocode);
  console.log(`Looking up ${glottocodes.length} languages by glottocode…`);

  const { data: langs, error: fetchErr } = await supabase
    .from('languages')
    .select('id, glottocode, english_name')
    .in('glottocode', glottocodes);

  if (fetchErr) throw new Error(`Supabase fetch: ${fetchErr.message}`);

  const glottoToId = new Map<string, string>();
  for (const l of langs ?? []) glottoToId.set(l.glottocode, l.id);

  console.log(`Found ${glottoToId.size} / ${glottocodes.length} glottocodes in database.\n`);

  const notFound = ALL_LANGUAGES.filter((l) => !glottoToId.has(l.glottocode));
  if (notFound.length) {
    console.warn(`⚠ Not found in DB (wrong glottocode or not seeded):`);
    for (const l of notFound) console.warn(`  ${l.label} → ${l.glottocode}`);
    console.log('');
  }

  const records = ALL_LANGUAGES
    .filter((l) => glottoToId.has(l.glottocode))
    .map((l) => ({
      language_id: glottoToId.get(l.glottocode)!,
      stt_quality_tier: l.stt_quality_tier,
      tts_quality_tier: l.tts_quality_tier,
      omnilingual_supported: l.omnilingual_supported,
      omnilingual_cer: l.omnilingual_cer ?? null,
      common_voice_hours_validated: l.common_voice_hours_validated ?? null,
      common_voice_dataset_version: l.common_voice_dataset_version ?? null,
      ipa_pipeline_viable: l.ipa_pipeline_viable,
      ipa_pipeline_notes: l.ipa_pipeline_notes ?? null,
      keyboard_support: l.keyboard_support ?? null,
      font_availability: l.font_availability ?? null,
      rendering_complexity: l.rendering_complexity ?? null,
      notable_gaps: l.notable_gaps ?? null,
      notes: l.notes ?? null,
      assessed_at: ASSESSED_AT,
      updated_at: new Date().toISOString(),
    }));

  console.log(`Upserting ${records.length} tech_readiness rows…`);

  // Supabase MutationBuilder cast — same pattern as other seed scripts
  type UpsertBuilder = {
    upsert(rows: typeof records, opts: { onConflict: string }): Promise<{ error: { message: string } | null }>;
  };
  const table = supabase.from('tech_readiness') as unknown as UpsertBuilder;

  const BATCH = 50;
  let upserted = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { error } = await table.upsert(batch, { onConflict: 'language_id' });
    if (error) {
      console.error(`Error at batch ${i}: ${error.message}`);
      process.exit(1);
    }
    upserted += batch.length;
    process.stdout.write(`\r  ${upserted}/${records.length} upserted…`);
  }

  console.log(`\n\nDone. ${upserted} tech_readiness rows upserted.`);
  console.log(`Visit /admin/tech-readiness to see the results.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

'use server';

import { redirect } from 'next/navigation';
import { createAdminClient as createClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/database.types';

type TechReadinessInsert = Database['public']['Tables']['tech_readiness']['Insert'];
type TechQuality = Database['public']['Enums']['tech_quality_tier'];

function num(formData: FormData, key: string): number | null {
  const val = (formData.get(key) as string)?.trim();
  if (!val) return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
}

function str(formData: FormData, key: string): string | null {
  const val = (formData.get(key) as string)?.trim();
  return val || null;
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === 'true';
}

function parseFields(languageId: string, formData: FormData): TechReadinessInsert {
  return {
    language_id: languageId,
    stt_quality_tier: (str(formData, 'stt_quality_tier') ?? 'none') as TechQuality,
    tts_quality_tier: (str(formData, 'tts_quality_tier') ?? 'none') as TechQuality,
    omnilingual_supported: bool(formData, 'omnilingual_supported'),
    omnilingual_cer: num(formData, 'omnilingual_cer'),
    common_voice_hours_validated: num(formData, 'common_voice_hours_validated'),
    common_voice_dataset_version: str(formData, 'common_voice_dataset_version'),
    ipa_pipeline_viable: bool(formData, 'ipa_pipeline_viable'),
    ipa_pipeline_notes: str(formData, 'ipa_pipeline_notes'),
    keyboard_support: str(formData, 'keyboard_support'),
    font_availability: str(formData, 'font_availability'),
    rendering_complexity: str(formData, 'rendering_complexity'),
    notable_gaps: str(formData, 'notable_gaps'),
    notes: str(formData, 'notes'),
    assessed_at: str(formData, 'assessed_at') ?? new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  };
}

// Same MutationBuilder cast pattern used throughout the codebase to work around
// supabase-js typing issues with upsert/insert/update in strict mode.
type MutationBuilder = {
  upsert(v: TechReadinessInsert, opts: { onConflict: string }): Promise<{ error: { message: string } | null }>;
};

export async function upsertTechReadiness(languageId: string, formData: FormData) {
  const supabase = createClient();
  const fields = parseFields(languageId, formData);
  const table = supabase.from('tech_readiness') as unknown as MutationBuilder;

  const { error } = await table.upsert(fields, { onConflict: 'language_id' });
  if (error) {
    redirect(`/admin/tech-readiness/${languageId}/edit?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/admin/languages/${languageId}`);
}

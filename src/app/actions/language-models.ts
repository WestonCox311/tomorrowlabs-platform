'use server';

import { redirect } from 'next/navigation';
import { createAdminClient as createClient } from '@/lib/supabase/admin';

function str(formData: FormData, key: string): string | null {
  const val = (formData.get(key) as string)?.trim();
  return val || null;
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === 'true' || formData.get(key) === 'on';
}

function parseFields(formData: FormData) {
  return {
    language_id: str(formData, 'language_id')!,
    model_name: str(formData, 'model_name')!,
    provider: str(formData, 'provider')!,
    model_type: str(formData, 'model_type')!,
    quality_tier: str(formData, 'quality_tier') ?? null,
    is_open_source: bool(formData, 'is_open_source'),
    license: str(formData, 'license'),
    source_url: str(formData, 'source_url'),
    notes: str(formData, 'notes'),
    last_verified_at: str(formData, 'last_verified_at') ?? new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  };
}

export async function createLanguageModel(formData: FormData) {
  const supabase = createClient();
  const fields = parseFields(formData);
  const langId = fields.language_id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('language_models') as any).insert(fields);
  if (error) {
    redirect(`/admin/language-models/new?language_id=${langId}&error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/admin/languages/${langId}`);
}

export async function updateLanguageModel(id: string, formData: FormData) {
  const supabase = createClient();
  const fields = parseFields(formData);
  const langId = fields.language_id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('language_models') as any)
    .update(fields)
    .eq('id', id);

  if (error) {
    redirect(`/admin/language-models/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/admin/languages/${langId}`);
}

export async function deleteLanguageModel(id: string, languageId: string) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('language_models') as any).delete().eq('id', id);
  redirect(`/admin/languages/${languageId}`);
}

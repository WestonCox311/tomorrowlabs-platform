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

function num(formData: FormData, key: string): number | null {
  const val = (formData.get(key) as string)?.trim();
  if (!val) return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function bigint_(formData: FormData, key: string): number | null {
  const val = (formData.get(key) as string)?.trim();
  if (!val) return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

function parseFields(formData: FormData) {
  return {
    language_id: str(formData, 'language_id'),
    parent_model_id: str(formData, 'parent_model_id'),
    model_name: str(formData, 'model_name')!,
    provider: str(formData, 'provider')!,
    model_type: str(formData, 'model_type')!,
    quality_tier: str(formData, 'quality_tier') ?? null,
    is_open_source: bool(formData, 'is_open_source'),
    license: str(formData, 'license'),
    source_url: str(formData, 'source_url'),
    wer: num(formData, 'wer'),
    cer: num(formData, 'cer'),
    bleu_score: num(formData, 'bleu_score'),
    eval_dataset: str(formData, 'eval_dataset'),
    eval_notes: str(formData, 'eval_notes'),
    parameter_count: bigint_(formData, 'parameter_count'),
    notes: str(formData, 'notes'),
    last_verified_at: str(formData, 'last_verified_at') ?? new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  };
}

export async function createLanguageModel(formData: FormData) {
  const supabase = createClient();
  const fields = parseFields(formData);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: created, error } = await (supabase.from('language_models') as any)
    .insert(fields)
    .select('id')
    .single();

  if (error) {
    const back = fields.parent_model_id
      ? `/admin/language-models/new?parent_id=${fields.parent_model_id}&error=${encodeURIComponent(error.message)}`
      : fields.language_id
      ? `/admin/language-models/new?language_id=${fields.language_id}&error=${encodeURIComponent(error.message)}`
      : `/admin/language-models/new?error=${encodeURIComponent(error.message)}`;
    redirect(back);
  }

  if (fields.parent_model_id) {
    redirect(`/admin/language-models/${fields.parent_model_id}`);
  } else if (fields.language_id) {
    redirect(`/admin/languages/${fields.language_id}`);
  } else {
    redirect(`/admin/language-models/${created.id}`);
  }
}

export async function updateLanguageModel(id: string, formData: FormData) {
  const supabase = createClient();
  const fields = parseFields(formData);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('language_models') as any)
    .update(fields)
    .eq('id', id);

  if (error) {
    redirect(`/admin/language-models/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  if (fields.parent_model_id) {
    redirect(`/admin/language-models/${fields.parent_model_id}`);
  } else if (fields.language_id) {
    redirect(`/admin/languages/${fields.language_id}`);
  } else {
    redirect(`/admin/language-models/${id}`);
  }
}

export async function deleteLanguageModel(id: string, languageId: string) {
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('language_models') as any).delete().eq('id', id);
  redirect(`/admin/languages/${languageId}`);
}

'use server';

import { redirect } from 'next/navigation';
import { createAdminClient as createClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/database.types';

type Granularity = Database['public']['Enums']['language_granularity'];
type LanguageInsert = Database['public']['Tables']['languages']['Insert'];
type LanguageUpdate = Database['public']['Tables']['languages']['Update'];

function parseFields(formData: FormData): LanguageInsert {
  return {
    english_name: formData.get('english_name') as string,
    endonym: (formData.get('endonym') as string) || null,
    glottocode: (formData.get('glottocode') as string) || null,
    iso_639_3: (formData.get('iso_639_3') as string) || null,
    iso_639_1: (formData.get('iso_639_1') as string) || null,
    granularity: ((formData.get('granularity') as string) || 'language') as Granularity,
    ethnologue_status: (formData.get('ethnologue_status') as string) || null,
    notes: (formData.get('notes') as string) || null,
  };
}

// The @supabase/ssr 0.6.1 + supabase-js 2.105.4 combination causes insert/update/delete
// to infer `never` for mutation arguments. We cast the table builder to bypass this;
// runtime behavior is unaffected since Supabase validates schema at the DB level.
type MutationBuilder = {
  insert(v: LanguageInsert): { select(c: string): { single(): Promise<{ data: { id: string } | null; error: { message: string } | null }> } };
  update(v: LanguageUpdate): { eq(col: string, val: string): Promise<{ error: { message: string } | null }> };
  delete(): { eq(col: string, val: string): Promise<unknown> };
};

export async function createLanguage(formData: FormData) {
  const supabase = createClient();
  const fields = parseFields(formData);
  const table = supabase.from('languages') as unknown as MutationBuilder;

  const { data, error } = await table.insert(fields).select('id').single();
  if (error) redirect(`/admin/languages/new?error=${encodeURIComponent(error.message)}`);
  if (!data) redirect('/admin/languages');
  redirect(`/admin/languages/${data.id}`);
}

export async function updateLanguage(id: string, formData: FormData) {
  const supabase = createClient();
  const fields = parseFields(formData) as LanguageUpdate;
  const table = supabase.from('languages') as unknown as MutationBuilder;

  const { error } = await table.update(fields).eq('id', id);
  if (error) redirect(`/admin/languages/${id}/edit?error=${encodeURIComponent(error.message)}`);
  redirect(`/admin/languages/${id}`);
}

export async function deleteLanguage(id: string) {
  const supabase = createClient();
  const table = supabase.from('languages') as unknown as MutationBuilder;
  await table.delete().eq('id', id);
  redirect('/admin/languages');
}

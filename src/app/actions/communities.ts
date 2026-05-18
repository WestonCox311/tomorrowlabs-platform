'use server';

import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/database.types';

type ConfidenceLevel = Database['public']['Enums']['confidence_level'];
type CommunityInsert = Database['public']['Tables']['communities']['Insert'];
type CommunityUpdate = Database['public']['Tables']['communities']['Update'];

function parseFields(formData: FormData): CommunityInsert {
  const pop = formData.get('estimated_global_population') as string;
  return {
    english_name: formData.get('english_name') as string,
    endonym: (formData.get('endonym') as string) || null,
    community_type: (formData.get('community_type') as string) || null,
    is_self_identified_community: formData.get('is_self_identified_community') === 'true',
    self_identification_basis: (formData.get('self_identification_basis') as string) || null,
    estimated_global_population: pop ? parseInt(pop, 10) : null,
    estimated_population_confidence: ((formData.get('estimated_population_confidence') as string) || null) as ConfidenceLevel | null,
    notes: (formData.get('notes') as string) || null,
  };
}

type MutationBuilder = {
  insert(v: CommunityInsert): { select(c: string): { single(): Promise<{ data: { id: string } | null; error: { message: string } | null }> } };
  update(v: CommunityUpdate): { eq(col: string, val: string): Promise<{ error: { message: string } | null }> };
  delete(): { eq(col: string, val: string): Promise<unknown> };
};

export async function createCommunity(formData: FormData) {
  const supabase = createAdminClient();
  const fields = parseFields(formData);
  const table = supabase.from('communities') as unknown as MutationBuilder;

  const { data, error } = await table.insert(fields).select('id').single();
  if (error) redirect(`/admin/communities/new?error=${encodeURIComponent(error.message)}`);
  if (!data) redirect('/admin/communities');
  redirect(`/admin/communities/${data.id}`);
}

export async function updateCommunity(id: string, formData: FormData) {
  const supabase = createAdminClient();
  const fields = parseFields(formData) as CommunityUpdate;
  const table = supabase.from('communities') as unknown as MutationBuilder;

  const { error } = await table.update(fields).eq('id', id);
  if (error) redirect(`/admin/communities/${id}/edit?error=${encodeURIComponent(error.message)}`);
  redirect(`/admin/communities/${id}`);
}

export async function deleteCommunity(id: string) {
  const supabase = createAdminClient();
  const table = supabase.from('communities') as unknown as MutationBuilder;
  await table.delete().eq('id', id);
  redirect('/admin/communities');
}

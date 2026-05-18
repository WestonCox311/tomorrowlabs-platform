'use server';

import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/database.types';

type OrgType = Database['public']['Enums']['organization_type'];
type IncorporationStatus = Database['public']['Enums']['incorporation_status'];
type FunderCategory = Database['public']['Enums']['funder_category'];
type OrgInsert = Database['public']['Tables']['organizations']['Insert'];
type OrgUpdate = Database['public']['Tables']['organizations']['Update'];

function parseFields(formData: FormData): OrgInsert {
  const foundingYear = formData.get('founding_year') as string;
  const focusAreasRaw = (formData.get('focus_areas') as string) || '';
  const focusAreas = focusAreasRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    legal_name: formData.get('legal_name') as string,
    display_name: (formData.get('display_name') as string) || null,
    endonym: (formData.get('endonym') as string) || null,
    organization_type: formData.get('organization_type') as OrgType,
    incorporation_status: ((formData.get('incorporation_status') as string) || null) as IncorporationStatus | null,
    funder_category: ((formData.get('funder_category') as string) || 'not-a-funder') as FunderCategory,
    mission_statement: (formData.get('mission_statement') as string) || null,
    focus_areas: focusAreas.length > 0 ? focusAreas : null,
    geographic_scope: (formData.get('geographic_scope') as string) || null,
    primary_url: (formData.get('primary_url') as string) || null,
    ein: (formData.get('ein') as string) || null,
    wikidata_id: (formData.get('wikidata_id') as string) || null,
    crunchbase_id: (formData.get('crunchbase_id') as string) || null,
    guidestar_id: (formData.get('guidestar_id') as string) || null,
    candid_id: (formData.get('candid_id') as string) || null,
    founding_year: foundingYear ? parseInt(foundingYear, 10) : null,
    is_active: formData.get('is_active') === 'true',
    notes: (formData.get('notes') as string) || null,
  };
}

type MutationBuilder = {
  insert(v: OrgInsert): { select(c: string): { single(): Promise<{ data: { id: string } | null; error: { message: string } | null }> } };
  update(v: OrgUpdate): { eq(col: string, val: string): Promise<{ error: { message: string } | null }> };
  delete(): { eq(col: string, val: string): Promise<unknown> };
};

export async function createOrganization(formData: FormData) {
  const supabase = createAdminClient();
  const fields = parseFields(formData);
  const table = supabase.from('organizations') as unknown as MutationBuilder;

  const { data, error } = await table.insert(fields).select('id').single();
  if (error) redirect(`/admin/organizations/new?error=${encodeURIComponent(error.message)}`);
  if (!data) redirect('/admin/organizations');
  redirect(`/admin/organizations/${data.id}`);
}

export async function updateOrganization(id: string, formData: FormData) {
  const supabase = createAdminClient();
  const fields = parseFields(formData) as OrgUpdate;
  const table = supabase.from('organizations') as unknown as MutationBuilder;

  const { error } = await table.update(fields).eq('id', id);
  if (error) redirect(`/admin/organizations/${id}/edit?error=${encodeURIComponent(error.message)}`);
  redirect(`/admin/organizations/${id}`);
}

export async function deleteOrganization(id: string) {
  const supabase = createAdminClient();
  const table = supabase.from('organizations') as unknown as MutationBuilder;
  await table.delete().eq('id', id);
  redirect('/admin/organizations');
}

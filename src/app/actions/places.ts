'use server';

import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/database.types';

type Granularity = Database['public']['Enums']['place_granularity'];
type PlaceStatus = Database['public']['Enums']['place_status'];
type GovernanceType = Database['public']['Enums']['governance_type'];
type TerritoryRecognition = Database['public']['Enums']['territory_recognition'];
type ClimateZone = Database['public']['Enums']['climate_zone'];
type PlaceInsert = Database['public']['Tables']['places']['Insert'];
type PlaceUpdate = Database['public']['Tables']['places']['Update'];

function parseFields(formData: FormData): PlaceInsert {
  const lat = formData.get('latitude') as string;
  const lon = formData.get('longitude') as string;
  const area = formData.get('area_sq_km') as string;
  return {
    english_name: formData.get('english_name') as string,
    endonym: (formData.get('endonym') as string) || null,
    granularity: (formData.get('granularity') as string) as Granularity,
    parent_place_id: (formData.get('parent_place_id') as string) || null,
    geonames_id: (formData.get('geonames_id') as string) || null,
    wikidata_id: (formData.get('wikidata_id') as string) || null,
    iso_3166_1_alpha2: (formData.get('iso_3166_1_alpha2') as string) || null,
    iso_3166_1_alpha3: (formData.get('iso_3166_1_alpha3') as string) || null,
    iso_3166_2: (formData.get('iso_3166_2') as string) || null,
    status: ((formData.get('status') as string) || 'active') as PlaceStatus,
    governance_type: ((formData.get('governance_type') as string) || null) as GovernanceType | null,
    territory_recognition: ((formData.get('territory_recognition') as string) || null) as TerritoryRecognition | null,
    climate_zone: ((formData.get('climate_zone') as string) || null) as ClimateZone | null,
    primary_timezone: (formData.get('primary_timezone') as string) || null,
    latitude: lat ? parseFloat(lat) : null,
    longitude: lon ? parseFloat(lon) : null,
    area_sq_km: area ? parseFloat(area) : null,
    native_land_ca_id: (formData.get('native_land_ca_id') as string) || null,
    notes: (formData.get('notes') as string) || null,
  };
}

type MutationBuilder = {
  insert(v: PlaceInsert): { select(c: string): { single(): Promise<{ data: { id: string } | null; error: { message: string } | null }> } };
  update(v: PlaceUpdate): { eq(col: string, val: string): Promise<{ error: { message: string } | null }> };
  delete(): { eq(col: string, val: string): Promise<unknown> };
};

export async function createPlace(formData: FormData) {
  const supabase = createAdminClient();
  const fields = parseFields(formData);
  const table = supabase.from('places') as unknown as MutationBuilder;

  const { data, error } = await table.insert(fields).select('id').single();
  if (error) redirect(`/admin/places/new?error=${encodeURIComponent(error.message)}`);
  if (!data) redirect('/admin/places');
  redirect(`/admin/places/${data.id}`);
}

export async function updatePlace(id: string, formData: FormData) {
  const supabase = createAdminClient();
  const fields = parseFields(formData) as PlaceUpdate;
  const table = supabase.from('places') as unknown as MutationBuilder;

  const { error } = await table.update(fields).eq('id', id);
  if (error) redirect(`/admin/places/${id}/edit?error=${encodeURIComponent(error.message)}`);
  redirect(`/admin/places/${id}`);
}

export async function deletePlace(id: string) {
  const supabase = createAdminClient();
  const table = supabase.from('places') as unknown as MutationBuilder;
  await table.delete().eq('id', id);
  redirect('/admin/places');
}

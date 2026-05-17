import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/delete-button';
import { deletePlace } from '@/app/actions/places';
import type { Database } from '@/lib/database.types';

type Place = Database['public']['Tables']['places']['Row'];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlaceDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) notFound();
  const place = data as Place;

  const deleteAction = deletePlace.bind(null, id);

  const fields: [string, string | number | boolean | null | undefined][] = [
    ['English name', place.english_name],
    ['Endonym', place.endonym],
    ['Granularity', place.granularity],
    ['Status', place.status],
    ['Parent place ID', place.parent_place_id],
    ['Governance type', place.governance_type],
    ['Territory recognition', place.territory_recognition],
    ['Climate zone', place.climate_zone],
    ['Primary timezone', place.primary_timezone],
    ['GeoNames ID', place.geonames_id],
    ['Wikidata ID', place.wikidata_id],
    ['ISO 3166-1 α2', place.iso_3166_1_alpha2],
    ['ISO 3166-1 α3', place.iso_3166_1_alpha3],
    ['ISO 3166-2', place.iso_3166_2],
    ['UN M.49 code', place.un_m49_code],
    ['FIPS code', place.fips_code],
    ['OSM relation ID', place.osm_relation_id],
    ['Native Land CA ID', place.native_land_ca_id],
    ['Latitude', place.latitude],
    ['Longitude', place.longitude],
    ['Area (km²)', place.area_sq_km],
    ['GeoNames validated', place.geonames_validated],
    ['Notes', place.notes],
  ];

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/places" className="hover:text-ink">Places</Link>
        <span>/</span>
        <span className="text-ink">{place.english_name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{place.english_name}</h1>
          {place.endonym && <p className="text-muted-foreground mt-1">{place.endonym}</p>}
          <p className="text-xs text-muted-foreground mt-1">{place.granularity}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/places/${id}/edit`}
            className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
          >
            Edit
          </Link>
          <DeleteButton action={deleteAction} label="Delete place" />
        </div>
      </div>

      <dl className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        {fields.map(([label, value]) => (
          <div key={label} className="flex px-4 py-3 text-sm">
            <dt className="w-48 shrink-0 font-medium text-muted-foreground">{label}</dt>
            <dd className="text-ink">
              {value === null || value === undefined
                ? <span className="text-muted-foreground">—</span>
                : typeof value === 'boolean'
                ? value ? 'Yes' : 'No'
                : String(value)}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs text-muted-foreground">
        ID: <span className="font-mono">{place.id}</span>
      </p>
    </div>
  );
}

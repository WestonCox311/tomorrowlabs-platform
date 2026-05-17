import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PlaceForm } from '@/components/place-form';
import { updatePlace } from '@/app/actions/places';
import type { Database } from '@/lib/database.types';

type Place = Database['public']['Tables']['places']['Row'];

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditPlacePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) notFound();
  const place = data as Place;

  const updateAction = updatePlace.bind(null, id);

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/places" className="hover:text-ink">Places</Link>
        <span>/</span>
        <Link href={`/admin/places/${id}`} className="hover:text-ink">{place.english_name}</Link>
        <span>/</span>
        <span className="text-ink">Edit</span>
      </div>

      <h1 className="text-2xl font-semibold text-ink mb-8">Edit {place.english_name}</h1>

      <PlaceForm
        action={updateAction}
        defaultValues={place}
        cancelHref={`/admin/places/${id}`}
        error={error}
      />
    </div>
  );
}

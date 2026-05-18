import Link from 'next/link';
import { PlaceForm } from '@/components/place-form';
import { createPlace } from '@/app/actions/places';

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewPlacePage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/places" className="hover:text-ink">Places</Link>
        <span>/</span>
        <span className="text-ink">New place</span>
      </div>

      <h1 className="text-2xl font-semibold text-ink mb-8">Add place</h1>

      <PlaceForm
        action={createPlace}
        cancelHref="/admin/places"
        error={error}
      />
    </div>
  );
}

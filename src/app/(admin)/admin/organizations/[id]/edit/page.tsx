import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { OrganizationForm } from '@/components/organization-form';
import { updateOrganization } from '@/app/actions/organizations';
import type { Database } from '@/lib/database.types';

type Organization = Database['public']['Tables']['organizations']['Row'];

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditOrganizationPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = createAdminClient();

  const [{ data }, { data: placesData }] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', id).single(),
    supabase
      .from('places')
      .select('id, english_name, granularity')
      .in('granularity', ['metro-area', 'city', 'county', 'state-province', 'country'])
      .order('english_name', { ascending: true }),
  ]);

  if (!data) notFound();
  const org = data as Organization;
  const places = (placesData ?? []) as { id: string; english_name: string; granularity: string }[];

  const updateAction = updateOrganization.bind(null, id);

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/organizations" className="hover:text-ink">Organizations</Link>
        <span>/</span>
        <Link href={`/admin/organizations/${id}`} className="hover:text-ink">
          {org.display_name ?? org.legal_name}
        </Link>
        <span>/</span>
        <span className="text-ink">Edit</span>
      </div>

      <h1 className="text-2xl font-semibold text-ink mb-8">
        Edit {org.display_name ?? org.legal_name}
      </h1>

      <OrganizationForm
        action={updateAction}
        defaultValues={org}
        cancelHref={`/admin/organizations/${id}`}
        error={error}
        places={places}
      />
    </div>
  );
}

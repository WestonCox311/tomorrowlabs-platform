import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CommunityForm } from '@/components/community-form';
import { updateCommunity } from '@/app/actions/communities';
import type { Database } from '@/lib/database.types';

type Community = Database['public']['Tables']['communities']['Row'];

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditCommunityPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('communities')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) notFound();
  const community = data as Community;

  const updateAction = updateCommunity.bind(null, id);

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/communities" className="hover:text-ink">Communities</Link>
        <span>/</span>
        <Link href={`/admin/communities/${id}`} className="hover:text-ink">{community.english_name}</Link>
        <span>/</span>
        <span className="text-ink">Edit</span>
      </div>

      <h1 className="text-2xl font-semibold text-ink mb-8">Edit {community.english_name}</h1>

      <CommunityForm
        action={updateAction}
        defaultValues={community}
        cancelHref={`/admin/communities/${id}`}
        error={error}
      />
    </div>
  );
}

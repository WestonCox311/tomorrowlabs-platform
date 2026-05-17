import Link from 'next/link';
import { CommunityForm } from '@/components/community-form';
import { createCommunity } from '@/app/actions/communities';

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewCommunityPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/communities" className="hover:text-ink">Communities</Link>
        <span>/</span>
        <span className="text-ink">New community</span>
      </div>

      <h1 className="text-2xl font-semibold text-ink mb-8">Add community</h1>

      <CommunityForm
        action={createCommunity}
        cancelHref="/admin/communities"
        error={error}
      />
    </div>
  );
}

import Link from 'next/link';
import { OrganizationForm } from '@/components/organization-form';
import { createOrganization } from '@/app/actions/organizations';

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewOrganizationPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/organizations" className="hover:text-ink">Organizations</Link>
        <span>/</span>
        <span className="text-ink">New organization</span>
      </div>

      <h1 className="text-2xl font-semibold text-ink mb-8">Add organization</h1>

      <OrganizationForm
        action={createOrganization}
        cancelHref="/admin/organizations"
        error={error}
      />
    </div>
  );
}

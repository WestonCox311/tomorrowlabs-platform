import { createAdminClient as createClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LanguageForm } from '@/components/language-form';
import { updateLanguage } from '@/app/actions/languages';
import type { Database } from '@/lib/database.types';

type Language = Database['public']['Tables']['languages']['Row'];

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditLanguagePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = createClient();

  const { data } = await supabase
    .from('languages')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) notFound();
  const lang = data as Language;

  const updateAction = updateLanguage.bind(null, id);

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/languages" className="hover:text-ink">Languages</Link>
        <span>/</span>
        <Link href={`/admin/languages/${id}`} className="hover:text-ink">{lang.english_name}</Link>
        <span>/</span>
        <span className="text-ink">Edit</span>
      </div>

      <h1 className="text-2xl font-semibold text-ink mb-8">Edit {lang.english_name}</h1>

      <LanguageForm
        action={updateAction}
        defaultValues={lang}
        cancelHref={`/admin/languages/${id}`}
        error={error}
      />
    </div>
  );
}

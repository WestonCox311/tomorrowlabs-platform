import { createAdminClient as createClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/delete-button';
import { deleteLanguage } from '@/app/actions/languages';
import type { Database } from '@/lib/database.types';

type Language = Database['public']['Tables']['languages']['Row'];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LanguageDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createClient();

  const { data } = await supabase
    .from('languages')
    .select('*')
    .eq('id', id)
    .single();

  if (!data) notFound();
  const lang = data as Language;

  const deleteAction = deleteLanguage.bind(null, id);

  const fields: [string, string | boolean | null][] = [
    ['English name', lang.english_name],
    ['Endonym', lang.endonym],
    ['Glottocode', lang.glottocode],
    ['ISO 639-3', lang.iso_639_3],
    ['ISO 639-1', lang.iso_639_1],
    ['Granularity', lang.granularity],
    ['Ethnologue status', lang.ethnologue_status],
    ['Wikidata QID', lang.wikidata_qid],
    ['WALS code', lang.wals_code],
    ['Linguasphere code', lang.linguasphere_code],
    ['Signed language', lang.is_signed_language],
    ['Constructed', lang.is_constructed],
    ['Glottolog validated', lang.glottolog_validated],
    ['Notes', lang.notes],
  ];

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/languages" className="hover:text-ink">Languages</Link>
        <span>/</span>
        <span className="text-ink">{lang.english_name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{lang.english_name}</h1>
          {lang.endonym && <p className="text-muted-foreground mt-1">{lang.endonym}</p>}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/languages/${id}/edit`}
            className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
          >
            Edit
          </Link>
          <DeleteButton action={deleteAction} label="Delete language" />
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
                : value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs text-muted-foreground">
        ID: <span className="font-mono">{lang.id}</span>
      </p>
    </div>
  );
}

import { createAdminClient as createClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import type { Database } from '@/lib/database.types';

type Language = Database['public']['Tables']['languages']['Row'];
type LanguageRow = Pick<Language, 'id' | 'english_name' | 'endonym' | 'glottocode' | 'iso_639_3' | 'granularity' | 'ethnologue_status'>;

const GRANULARITIES = ['macrolanguage', 'language', 'dialect', 'variety', 'register'] as const;

interface Props {
  searchParams: Promise<{ q?: string; granularity?: string }>;
}

export default async function LanguagesPage({ searchParams }: Props) {
  const { q, granularity } = await searchParams;
  const supabase = createClient();

  let query = supabase
    .from('languages')
    .select('id, english_name, endonym, glottocode, iso_639_3, granularity, ethnologue_status')
    .order('english_name');

  if (q) {
    query = query.or(`english_name.ilike.%${q}%,glottocode.ilike.%${q}%,iso_639_3.ilike.%${q}%`);
  }
  if (granularity) {
    query = query.eq('granularity', granularity as (typeof GRANULARITIES)[number]);
  }

  const { data, error } = await query;
  const languages = data as LanguageRow[] | null;

  if (error) {
    return (
      <div className="p-8">
        <p className="text-destructive font-mono text-sm bg-destructive/10 p-4 rounded-md">
          Supabase error: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Languages</h1>
        <Link
          href="/admin/languages/new"
          className="px-4 py-2 text-sm font-medium text-white bg-moss hover:bg-moss-light rounded-md transition-colors"
        >
          Add language
        </Link>
      </div>

      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, glottocode, ISO code…"
          className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent"
        />
        <select
          name="granularity"
          defaultValue={granularity ?? ''}
          className="px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
        >
          <option value="">All granularities</option>
          {GRANULARITIES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-moss/10 transition-colors"
        >
          Filter
        </button>
        {(q || granularity) && (
          <Link
            href="/admin/languages"
            className="px-4 py-2 text-sm text-muted-foreground hover:text-ink transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Endonym</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Glottocode</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">ISO 639-3</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Granularity</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ethnologue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {languages && languages.length > 0 ? (
              languages.map((lang) => (
                <tr key={lang.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/languages/${lang.id}`} className="font-medium text-ink hover:text-moss">
                      {lang.english_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lang.endonym ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{lang.glottocode ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{lang.iso_639_3 ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                      {lang.granularity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lang.ethnologue_status ?? '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  {q || granularity ? 'No languages match your filters.' : 'No languages yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {languages && (
        <p className="mt-3 text-xs text-muted-foreground">{languages.length} language{languages.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  );
}

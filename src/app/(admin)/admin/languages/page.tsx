import { createAdminClient as createClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Suspense } from 'react';
import { InfoTooltip } from '@/components/info-tooltip';
import { ClickableRow } from '@/components/clickable-row';
import { SortHeader } from '@/components/sort-header';
import { FilterBar } from '@/components/filter-bar';
import type { Database } from '@/lib/database.types';

type Language = Database['public']['Tables']['languages']['Row'];
type LanguageRow = Pick<Language, 'id' | 'english_name' | 'endonym' | 'glottocode' | 'iso_639_3' | 'granularity' | 'ethnologue_status'>;

const GRANULARITIES = ['macrolanguage', 'language', 'dialect', 'variety', 'register'] as const;
const ETHNOLOGUE_STATUSES = ['International', 'National', 'Vigorous', 'Threatened', 'Shifting', 'Moribund'] as const;
const PAGE_SIZE = 50;
const ALLOWED_SORT = ['english_name', 'endonym', 'glottocode', 'iso_639_3', 'granularity', 'ethnologue_status'] as const;

const BABAGIGI_GLOTTOCODES = [
  'stan1288','mand1415','taga1270','viet1252','kore1280','stan1318','stan1290','port1283',
  'cant1236','russ1263','poli1260','ital1282','hind1269',
  'stan1295','japa1256','mode1248','urdu1245','hebr1245','panj1256','guja1252',
  'cent1989','kich1262','laoo1244','whit1273','east2455','mixt1422','kaqc1270',
];

const ETHNOLOGUE_COLORS: Record<string, string> = {
  International: 'text-green-700',
  National: 'text-blue-700',
  Vigorous: 'text-indigo-600',
  Threatened: 'text-amber-700',
  Shifting: 'text-orange-700',
  Moribund: 'text-red-700',
};

interface Props {
  searchParams: Promise<{ q?: string; granularity?: string; ethnologue_status?: string; is_constructed?: string; babagigi?: string; page?: string; sort?: string; dir?: string }>;
}

export default async function LanguagesPage({ searchParams }: Props) {
  const { q, granularity, ethnologue_status, is_constructed, babagigi, page: pageParam, sort: sortParam, dir: dirParam } = await searchParams;

  const sortCol = (ALLOWED_SORT as readonly string[]).includes(sortParam ?? '') ? sortParam! : 'english_name';
  const sortDir = dirParam === 'desc' ? 'desc' : 'asc';

  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createClient();

  let query = supabase
    .from('languages')
    .select('id, english_name, endonym, glottocode, iso_639_3, granularity, ethnologue_status', { count: 'exact' })
    .order(sortCol, { ascending: sortDir === 'asc', nullsFirst: false })
    .range(from, to);

  if (q) {
    query = query.or(`english_name.ilike.%${q}%,glottocode.ilike.%${q}%,iso_639_3.ilike.%${q}%`);
  }
  if (granularity) {
    query = query.eq('granularity', granularity as (typeof GRANULARITIES)[number]);
  }
  if (ethnologue_status) {
    query = query.eq('ethnologue_status', ethnologue_status as (typeof ETHNOLOGUE_STATUSES)[number]);
  }
  if (is_constructed === 'true') {
    query = query.eq('is_constructed', true);
  } else if (is_constructed === 'false') {
    query = query.eq('is_constructed', false);
  }
  if (babagigi) {
    query = query.in('glottocode', BABAGIGI_GLOTTOCODES);
  }

  const { data, error, count } = await query;
  const languages = data as LanguageRow[] | null;
  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const hasFilters = q || granularity || ethnologue_status || is_constructed || babagigi;

  function sortHref(col: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (granularity) params.set('granularity', granularity);
    if (ethnologue_status) params.set('ethnologue_status', ethnologue_status);
    if (is_constructed) params.set('is_constructed', is_constructed);
    if (babagigi) params.set('babagigi', '1');
    params.set('sort', col);
    params.set('dir', sortCol === col && sortDir === 'asc' ? 'desc' : 'asc');
    return `/admin/languages?${params.toString()}`;
  }

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (granularity) params.set('granularity', granularity);
    if (ethnologue_status) params.set('ethnologue_status', ethnologue_status);
    if (is_constructed) params.set('is_constructed', is_constructed);
    if (babagigi) params.set('babagigi', '1');
    if (sortCol !== 'english_name') params.set('sort', sortCol);
    if (sortDir !== 'asc') params.set('dir', sortDir);
    params.set('page', String(p));
    return `/admin/languages?${params.toString()}`;
  }

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

      <Suspense>
        <FilterBar
          basePath="/admin/languages"
          searchPlaceholder="Search by name, glottocode, ISO code…"
          filters={[
            {
              param: 'granularity',
              label: 'Granularity',
              defaultLabel: 'All granularities',
              options: GRANULARITIES.map((g) => ({ value: g, label: g })),
            },
            {
              param: 'ethnologue_status',
              label: 'Ethnologue',
              defaultLabel: 'All statuses',
              options: ETHNOLOGUE_STATUSES.map((s) => ({ value: s, label: s })),
            },
            {
              param: 'is_constructed',
              label: 'Type',
              defaultLabel: 'All types',
              options: [
                { value: 'false', label: 'Natural only' },
                { value: 'true', label: 'Constructed only' },
              ],
            },
          ]}
        />
      </Suspense>

      {/* Preset filters */}
      <div className="flex gap-2 mb-6">
        <Link
          href={babagigi ? '/admin/languages' : '/admin/languages?babagigi=1'}
          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
            babagigi
              ? 'bg-moss text-white border-moss'
              : 'border-border text-muted-foreground hover:border-moss hover:text-moss'
          }`}
        >
          Babagigi pipeline only
        </Link>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <SortHeader href={sortHref('english_name')} label="Name" isActive={sortCol === 'english_name'} isAsc={sortDir === 'asc'} />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <SortHeader href={sortHref('endonym')} label="Endonym" isActive={sortCol === 'endonym'} isAsc={sortDir === 'asc'} />
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <SortHeader href={sortHref('glottocode')} label="Glottocode" isActive={sortCol === 'glottocode'} isAsc={sortDir === 'asc'} />
                  <InfoTooltip text="Glottolog's unique identifier — the primary key for cross-database joins. Example: 'stan1288' for Spanish." />
                </span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <SortHeader href={sortHref('iso_639_3')} label="ISO 639-3" isActive={sortCol === 'iso_639_3'} isAsc={sortDir === 'asc'} />
                  <InfoTooltip text="Three-letter code from the ISO 639-3 standard, maintained by SIL International. Not all languages have one — Glottolog is more comprehensive." />
                </span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <SortHeader href={sortHref('granularity')} label="Granularity" isActive={sortCol === 'granularity'} isAsc={sortDir === 'asc'} />
                  <InfoTooltip text="How specific this record is: 'language' = a distinct L1 language; 'dialect' = a regional variant; 'variety' = a functional variant (e.g. written Arabic); 'macrolanguage' = an umbrella term for closely related languages." />
                </span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <SortHeader href={sortHref('ethnologue_status')} label="Ethnologue" isActive={sortCol === 'ethnologue_status'} isAsc={sortDir === 'asc'} />
                  <InfoTooltip text="Ethnologue EGIDS level: International = used globally; National = official in a country; Vigorous = all generations actively use it; Threatened = children are not learning it at the rate needed to sustain it." />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {languages && languages.length > 0 ? (
              languages.map((lang) => (
                <ClickableRow key={lang.id} href={`/admin/languages/${lang.id}`}>
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{lang.english_name}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lang.endonym ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{lang.glottocode ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{lang.iso_639_3 ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                      {lang.granularity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {lang.ethnologue_status ? (
                      <span className={`text-xs font-medium ${ETHNOLOGUE_COLORS[lang.ethnologue_status] ?? 'text-muted-foreground'}`}>
                        {lang.ethnologue_status}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </ClickableRow>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  {hasFilters ? 'No languages match your filters.' : 'No languages yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: count + pagination */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {total.toLocaleString()} language{total !== 1 ? 's' : ''}
          {totalPages > 1 && ` · page ${page} of ${totalPages}`}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Link
              href={pageHref(1)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                page <= 1 ? 'border-transparent text-muted-foreground/40 pointer-events-none' : 'border-border hover:bg-muted/50'
              }`}
              aria-disabled={page <= 1}
            >
              ««
            </Link>
            <Link
              href={pageHref(page - 1)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                page <= 1 ? 'border-transparent text-muted-foreground/40 pointer-events-none' : 'border-border hover:bg-muted/50'
              }`}
              aria-disabled={page <= 1}
            >
              ‹ Prev
            </Link>
            <Link
              href={pageHref(page + 1)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                page >= totalPages ? 'border-transparent text-muted-foreground/40 pointer-events-none' : 'border-border hover:bg-muted/50'
              }`}
              aria-disabled={page >= totalPages}
            >
              Next ›
            </Link>
            <Link
              href={pageHref(totalPages)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                page >= totalPages ? 'border-transparent text-muted-foreground/40 pointer-events-none' : 'border-border hover:bg-muted/50'
              }`}
              aria-disabled={page >= totalPages}
            >
              »»
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

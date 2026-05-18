import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { SortHeader } from '@/components/sort-header';
import { FilterBar } from '@/components/filter-bar';
import { ClickableRow } from '@/components/clickable-row';
import type { Database } from '@/lib/database.types';

type TechQuality = Database['public']['Enums']['tech_quality_tier'];

// Extended type — includes columns added by migration-020 not yet in generated types
type ModelRow = Database['public']['Tables']['language_models']['Row'] & {
  wer?: number | null;
  cer?: number | null;
  bleu_score?: number | null;
  eval_dataset?: string | null;
  parameter_count?: number | null;
  languages: { id: string; english_name: string; endonym: string | null } | null;
};

const MODEL_TYPES = ['stt', 'tts', 'llm', 'translation', 'g2p'] as const;
const PROVIDERS = ['openai', 'meta', 'microsoft', 'google', 'mozilla', 'community', 'academic'] as const;
const QUALITY_TIERS: TechQuality[] = ['production', 'usable', 'experimental', 'none'];
const PAGE_SIZE = 50;
const ALLOWED_SORT = ['model_name', 'model_type', 'provider', 'quality_tier', 'wer', 'cer', 'bleu_score', 'last_verified_at'] as const;

const TIER_COLORS: Record<TechQuality, string> = {
  production:   'bg-green-100 text-green-800',
  usable:       'bg-blue-100 text-blue-800',
  experimental: 'bg-amber-100 text-amber-800',
  none:         'bg-muted text-muted-foreground',
};

const TYPE_COLORS: Record<string, string> = {
  stt:         'bg-violet-100 text-violet-800',
  tts:         'bg-sky-100 text-sky-800',
  llm:         'bg-orange-100 text-orange-800',
  translation: 'bg-teal-100 text-teal-800',
  g2p:         'bg-pink-100 text-pink-800',
};

function TierBadge({ tier }: { tier: TechQuality | null }) {
  if (!tier) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[tier]}`}>
      {tier}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const cls = TYPE_COLORS[type] ?? 'bg-muted text-muted-foreground';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {type.toUpperCase()}
    </span>
  );
}

function MetricCell({ value, unit }: { value: number | null | undefined; unit?: string }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="font-mono text-sm">
      {value.toFixed(1)}{unit}
    </span>
  );
}

function formatParams(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}

interface Props {
  searchParams: Promise<{
    q?: string;
    type?: string;
    provider?: string;
    tier?: string;
    page?: string;
    sort?: string;
    dir?: string;
  }>;
}

export default async function LanguageModelsPage({ searchParams }: Props) {
  const { q, type, provider, tier, page: pageParam, sort: sortParam, dir: dirParam } = await searchParams;

  const sortCol = (ALLOWED_SORT as readonly string[]).includes(sortParam ?? '') ? sortParam! : 'model_name';
  const sortDir = dirParam === 'desc' ? 'desc' : 'asc';
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from('language_models') as any)
    .select(`
      id, model_name, model_type, provider, quality_tier,
      is_open_source, license, wer, cer, bleu_score,
      eval_dataset, parameter_count, last_verified_at,
      languages ( id, english_name, endonym )
    `, { count: 'exact' })
    .order(sortCol, { ascending: sortDir === 'asc', nullsFirst: false })
    .range(from, to);

  if (q) {
    query = query.or(`model_name.ilike.%${q}%,provider.ilike.%${q}%`);
  }
  if (type) query = query.eq('model_type', type);
  if (provider) query = query.eq('provider', provider);
  if (tier) query = query.eq('quality_tier', tier);

  const { data, error, count } = await query;
  const models = (data ?? []) as ModelRow[];
  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = q || type || provider || tier;

  function sortHref(col: string) {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (type) p.set('type', type);
    if (provider) p.set('provider', provider);
    if (tier) p.set('tier', tier);
    p.set('sort', col);
    p.set('dir', sortCol === col && sortDir === 'asc' ? 'desc' : 'asc');
    return `/admin/language-models?${p}`;
  }

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (type) params.set('type', type);
    if (provider) params.set('provider', provider);
    if (tier) params.set('tier', tier);
    if (sortCol !== 'model_name') params.set('sort', sortCol);
    if (sortDir !== 'asc') params.set('dir', sortDir);
    params.set('page', String(p));
    return `/admin/language-models?${params}`;
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
        <div>
          <h1 className="text-2xl font-semibold text-ink">Models</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            TTS, STT, LLM, and translation models — with metrics and provenance.
          </p>
        </div>
        <Link
          href="/admin/language-models/new"
          className="px-3 py-2 bg-moss text-white text-sm rounded-md hover:bg-moss/90 transition-colors font-medium"
        >
          + New model
        </Link>
      </div>

      <FilterBar
        filters={[
          {
            param: 'type',
            label: 'Type',
            value: type ?? '',
            options: [
              { value: '', label: 'All types' },
              ...MODEL_TYPES.map((t) => ({ value: t, label: t.toUpperCase() })),
            ],
          },
          {
            param: 'provider',
            label: 'Provider',
            value: provider ?? '',
            options: [
              { value: '', label: 'All providers' },
              ...PROVIDERS.map((p) => ({ value: p, label: p })),
            ],
          },
          {
            param: 'tier',
            label: 'Quality',
            value: tier ?? '',
            options: [
              { value: '', label: 'All tiers' },
              ...QUALITY_TIERS.map((t) => ({ value: t, label: t })),
            ],
          },
        ]}
        searchParam="q"
        searchValue={q ?? ''}
        searchPlaceholder="Search model name or provider…"
        baseHref="/admin/language-models"
      />

      <div className="mt-4 rounded-md border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                <SortHeader col="model_name" label="Model" currentSort={sortCol} currentDir={sortDir} href={sortHref('model_name')} />
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Language</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                <SortHeader col="model_type" label="Type" currentSort={sortCol} currentDir={sortDir} href={sortHref('model_type')} />
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                <SortHeader col="provider" label="Provider" currentSort={sortCol} currentDir={sortDir} href={sortHref('provider')} />
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                <SortHeader col="quality_tier" label="Quality" currentSort={sortCol} currentDir={sortDir} href={sortHref('quality_tier')} />
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                <SortHeader col="wer" label="WER" currentSort={sortCol} currentDir={sortDir} href={sortHref('wer')} />
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                <SortHeader col="cer" label="CER" currentSort={sortCol} currentDir={sortDir} href={sortHref('cer')} />
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                <SortHeader col="bleu_score" label="BLEU" currentSort={sortCol} currentDir={sortDir} href={sortHref('bleu_score')} />
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Params</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">License</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                <SortHeader col="last_verified_at" label="Verified" currentSort={sortCol} currentDir={sortDir} href={sortHref('last_verified_at')} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {models.length > 0 ? (
              models.map((model) => {
                const lang = Array.isArray(model.languages) ? model.languages[0] : model.languages;
                return (
                  <ClickableRow key={model.id} href={`/admin/language-models/${model.id}`}>
                    <td className="px-4 py-3 font-medium text-ink">{model.model_name}</td>
                    <td className="px-4 py-3 text-sm">
                      {lang ? (
                        <span className="text-ink">{lang.english_name}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <TypeBadge type={model.model_type} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{model.provider}</td>
                    <td className="px-4 py-3">
                      <TierBadge tier={model.quality_tier} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <MetricCell value={model.wer} unit="%" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <MetricCell value={model.cer} unit="%" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <MetricCell value={model.bleu_score} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                      {formatParams(model.parameter_count)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {model.license ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {model.last_verified_at ?? '—'}
                    </td>
                  </ClickableRow>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">
                  {hasFilters ? 'No models match your filters.' : 'No models yet. Add one from a language page or use + New model above.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {total.toLocaleString()} model{total !== 1 ? 's' : ''}
          {totalPages > 1 && ` · page ${page} of ${totalPages}`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Link href={pageHref(page - 1)} aria-disabled={page <= 1}
              className={`px-2 py-1 text-xs rounded border transition-colors ${page <= 1 ? 'border-transparent text-muted-foreground/40 pointer-events-none' : 'border-border hover:bg-muted/50'}`}>
              ‹ Prev
            </Link>
            <Link href={pageHref(page + 1)} aria-disabled={page >= totalPages}
              className={`px-2 py-1 text-xs rounded border transition-colors ${page >= totalPages ? 'border-transparent text-muted-foreground/40 pointer-events-none' : 'border-border hover:bg-muted/50'}`}>
              Next ›
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Database } from '@/lib/database.types';

type TechQuality = Database['public']['Enums']['tech_quality_tier'];

type Model = Database['public']['Tables']['language_models']['Row'] & {
  wer?: number | null;
  cer?: number | null;
  bleu_score?: number | null;
  eval_dataset?: string | null;
  eval_notes?: string | null;
  parameter_count?: number | null;
  languages: { id: string; english_name: string } | null;
};

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

function formatParams(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B parameters`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)}M parameters`;
  return `${n.toLocaleString()} parameters`;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ModelDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('language_models') as any)
    .select(`
      *,
      languages ( id, english_name )
    `)
    .eq('id', id)
    .single();

  if (!data) notFound();
  const model = data as Model;
  const lang = Array.isArray(model.languages) ? model.languages[0] : model.languages;

  const hasMetrics = model.wer != null || model.cer != null || model.bleu_score != null;

  return (
    <div className="p-8 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/admin/language-models" className="hover:text-ink transition-colors">Models</Link>
        <span>/</span>
        {lang && (
          <>
            <Link href={`/admin/languages/${lang.id}`} className="hover:text-ink transition-colors">
              {lang.english_name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-ink">{model.model_name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[model.model_type] ?? 'bg-muted text-muted-foreground'}`}>
              {model.model_type.toUpperCase()}
            </span>
            {model.quality_tier && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[model.quality_tier]}`}>
                {model.quality_tier}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-ink">{model.model_name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{model.provider}</p>
        </div>
        <Link
          href={`/admin/language-models/${model.id}/edit`}
          className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted/50 transition-colors text-ink"
        >
          Edit
        </Link>
      </div>

      {/* Evaluation Metrics */}
      {hasMetrics && (
        <section className="mb-6">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Evaluation Metrics</h2>
          <div className="rounded-md border border-border overflow-hidden">
            <div className="grid grid-cols-3 divide-x divide-border">
              {model.wer != null && (
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">WER</p>
                  <p className="text-2xl font-mono font-semibold text-ink">{model.wer.toFixed(1)}<span className="text-sm font-normal text-muted-foreground">%</span></p>
                </div>
              )}
              {model.cer != null && (
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">CER</p>
                  <p className="text-2xl font-mono font-semibold text-ink">{model.cer.toFixed(1)}<span className="text-sm font-normal text-muted-foreground">%</span></p>
                </div>
              )}
              {model.bleu_score != null && (
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">BLEU</p>
                  <p className="text-2xl font-mono font-semibold text-ink">{model.bleu_score.toFixed(1)}</p>
                </div>
              )}
            </div>
            {(model.eval_dataset || model.eval_notes) && (
              <div className="px-4 py-2.5 bg-muted/30 border-t border-border text-xs text-muted-foreground space-y-0.5">
                {model.eval_dataset && <p><span className="font-medium">Test set:</span> {model.eval_dataset}</p>}
                {model.eval_notes && <p>{model.eval_notes}</p>}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Details */}
      <section className="mb-6">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Details</h2>
        <dl className="rounded-md border border-border divide-y divide-border">
          {lang && (
            <div className="grid grid-cols-3 px-4 py-2.5">
              <dt className="text-sm text-muted-foreground">Language</dt>
              <dd className="col-span-2 text-sm text-ink">
                <Link href={`/admin/languages/${lang.id}`} className="hover:underline text-moss">{lang.english_name}</Link>
              </dd>
            </div>
          )}
          <div className="grid grid-cols-3 px-4 py-2.5">
            <dt className="text-sm text-muted-foreground">Provider</dt>
            <dd className="col-span-2 text-sm text-ink">{model.provider}</dd>
          </div>
          <div className="grid grid-cols-3 px-4 py-2.5">
            <dt className="text-sm text-muted-foreground">Type</dt>
            <dd className="col-span-2 text-sm text-ink">{model.model_type.toUpperCase()}</dd>
          </div>
          <div className="grid grid-cols-3 px-4 py-2.5">
            <dt className="text-sm text-muted-foreground">License</dt>
            <dd className="col-span-2 text-sm font-mono text-ink">{model.license ?? '—'}</dd>
          </div>
          <div className="grid grid-cols-3 px-4 py-2.5">
            <dt className="text-sm text-muted-foreground">Open source</dt>
            <dd className="col-span-2 text-sm text-ink">{model.is_open_source ? 'Yes' : 'No'}</dd>
          </div>
          {model.parameter_count != null && (
            <div className="grid grid-cols-3 px-4 py-2.5">
              <dt className="text-sm text-muted-foreground">Size</dt>
              <dd className="col-span-2 text-sm font-mono text-ink">{formatParams(model.parameter_count)}</dd>
            </div>
          )}
          {model.source_url && (
            <div className="grid grid-cols-3 px-4 py-2.5">
              <dt className="text-sm text-muted-foreground">Source</dt>
              <dd className="col-span-2 text-sm">
                <a href={model.source_url} target="_blank" rel="noopener noreferrer"
                   className="text-moss hover:underline break-all">
                  {model.source_url}
                </a>
              </dd>
            </div>
          )}
          <div className="grid grid-cols-3 px-4 py-2.5">
            <dt className="text-sm text-muted-foreground">Last verified</dt>
            <dd className="col-span-2 text-sm text-ink">{model.last_verified_at ?? '—'}</dd>
          </div>
        </dl>
      </section>

      {/* Notes */}
      {model.notes && (
        <section className="mb-6">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Notes</h2>
          <p className="text-sm text-ink whitespace-pre-wrap rounded-md border border-border px-4 py-3 bg-muted/20">
            {model.notes}
          </p>
        </section>
      )}
    </div>
  );
}

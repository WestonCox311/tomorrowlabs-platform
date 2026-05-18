import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { updateLanguageModel, deleteLanguageModel } from '@/app/actions/language-models';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

const PROVIDERS = ['openai', 'meta', 'microsoft', 'google', 'mozilla', 'community', 'academic'];
const MODEL_TYPES = ['stt', 'tts', 'llm', 'translation', 'g2p'];
const QUALITY_TIERS = ['production', 'usable', 'experimental', 'none'];

export default async function EditLanguageModelPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: model } = await (supabase.from('language_models') as any)
    .select(`
      *,
      languages ( id, english_name )
    `)
    .eq('id', id)
    .single();

  if (!model) notFound();

  const lang = Array.isArray(model.languages) ? model.languages[0] : model.languages;
  const updateAction = updateLanguageModel.bind(null, id);
  const deleteAction = deleteLanguageModel.bind(null, id, lang?.id ?? '');

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <Link
          href={`/admin/languages/${lang?.id}`}
          className="text-xs text-muted-foreground hover:text-ink transition-colors"
        >
          ← {lang?.english_name}
        </Link>
        <h1 className="text-2xl font-semibold text-ink mt-2">Edit language model</h1>
        <p className="text-sm text-muted-foreground mt-1">{model.model_name}</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md bg-rust/10 border border-rust/30 text-sm text-rust">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="language_id" value={lang?.id ?? ''} />

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Model name *</label>
          <input
            name="model_name"
            required
            defaultValue={model.model_name}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink focus:outline-none focus:ring-1 focus:ring-moss"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Provider *</label>
            <select
              name="provider"
              required
              defaultValue={model.provider}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink focus:outline-none focus:ring-1 focus:ring-moss"
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Type *</label>
            <select
              name="model_type"
              required
              defaultValue={model.model_type}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink focus:outline-none focus:ring-1 focus:ring-moss"
            >
              {MODEL_TYPES.map((t) => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Quality tier</label>
            <select
              name="quality_tier"
              defaultValue={model.quality_tier ?? ''}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink focus:outline-none focus:ring-1 focus:ring-moss"
            >
              <option value="">Unknown</option>
              {QUALITY_TIERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">License</label>
            <input
              name="license"
              defaultValue={model.license ?? ''}
              placeholder="e.g. mit, apache-2.0"
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_open_source"
            name="is_open_source"
            defaultChecked={model.is_open_source}
            className="rounded border-border text-moss focus:ring-moss"
          />
          <label htmlFor="is_open_source" className="text-sm text-ink">Open source</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Source URL</label>
          <input
            name="source_url"
            type="url"
            defaultValue={model.source_url ?? ''}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink focus:outline-none focus:ring-1 focus:ring-moss"
          />
        </div>

        {/* Evaluation metrics — relevant for STT (WER/CER) and MT (BLEU) */}
        <div className="pt-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Evaluation metrics</p>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">WER %</label>
              <input
                name="wer"
                type="number"
                step="0.1"
                min="0"
                max="100"
                defaultValue={model.wer ?? ''}
                placeholder="e.g. 12.4"
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">CER %</label>
              <input
                name="cer"
                type="number"
                step="0.1"
                min="0"
                max="100"
                defaultValue={model.cer ?? ''}
                placeholder="e.g. 5.1"
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">BLEU</label>
              <input
                name="bleu_score"
                type="number"
                step="0.1"
                min="0"
                max="100"
                defaultValue={model.bleu_score ?? ''}
                placeholder="e.g. 32.5"
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Test dataset</label>
              <input
                name="eval_dataset"
                defaultValue={model.eval_dataset ?? ''}
                placeholder="e.g. CommonVoice 17 test"
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Parameter count</label>
              <input
                name="parameter_count"
                type="number"
                min="0"
                defaultValue={model.parameter_count ?? ''}
                placeholder="e.g. 1500000000"
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-ink mb-1">Eval notes</label>
            <input
              name="eval_notes"
              defaultValue={model.eval_notes ?? ''}
              placeholder="e.g. Zero-shot; fine-tuned on 10h; greedy decoding"
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Notes</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={model.notes ?? ''}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Last verified</label>
          <input
            name="last_verified_at"
            type="date"
            defaultValue={model.last_verified_at ?? new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink focus:outline-none focus:ring-1 focus:ring-moss"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-moss text-white text-sm rounded-md hover:bg-moss/90 transition-colors font-medium"
          >
            Save changes
          </button>
          <Link
            href={`/admin/languages/${lang?.id}`}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-ink transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Delete */}
      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground mb-3">
          Permanently remove this model resource from the database.
        </p>
        <form action={deleteAction}>
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-md text-rust hover:bg-rust/10 transition-colors border border-rust/30"
          >
            Delete model resource
          </button>
        </form>
      </div>
    </div>
  );
}

import { createAdminClient } from '@/lib/supabase/admin';
import { createLanguageModel } from '@/app/actions/language-models';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ language_id?: string; parent_id?: string; error?: string }>;
}

const PROVIDERS = ['openai', 'meta', 'microsoft', 'google', 'mozilla', 'community', 'academic'];
const MODEL_TYPES = ['stt', 'tts', 'llm', 'translation', 'g2p'];
const QUALITY_TIERS = ['production', 'usable', 'experimental', 'none'];

export default async function NewLanguageModelPage({ searchParams }: Props) {
  const { language_id, parent_id, error } = await searchParams;
  const supabase = createAdminClient();

  // Pre-linked language (coming from a language detail page)
  let lang: { id: string; english_name: string } | null = null;
  if (language_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('languages') as any)
      .select('id, english_name')
      .eq('id', language_id)
      .single();
    lang = data;
  }

  // Pre-linked parent model (coming from a model detail page "+ Add language")
  let parentModel: { id: string; model_name: string; model_type: string; provider: string } | null = null;
  if (parent_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('language_models') as any)
      .select('id, model_name, model_type, provider')
      .eq('id', parent_id)
      .single();
    parentModel = data;
  }

  // Load all languages for the selector (when no pre-linked language)
  let allLanguages: { id: string; english_name: string }[] = [];
  if (!language_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('languages') as any)
      .select('id, english_name')
      .order('english_name', { ascending: true });
    allLanguages = data ?? [];
  }

  // Load all top-level models for parent selector (when no pre-linked parent)
  let allModels: { id: string; model_name: string; model_type: string }[] = [];
  if (!parent_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('language_models') as any)
      .select('id, model_name, model_type')
      .is('parent_model_id', null)
      .order('model_name', { ascending: true });
    allModels = data ?? [];
  }

  const cancelHref = parentModel
    ? `/admin/language-models/${parentModel.id}`
    : lang
    ? `/admin/languages/${lang.id}`
    : '/admin/language-models';

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <Link href={cancelHref} className="text-xs text-muted-foreground hover:text-ink transition-colors">
          ← {parentModel ? parentModel.model_name : lang ? lang.english_name : 'Models'}
        </Link>
        <h1 className="text-2xl font-semibold text-ink mt-2">Add language model</h1>
        {parentModel && (
          <p className="text-sm text-muted-foreground mt-1">
            Adding a language variant to <span className="font-medium text-ink">{parentModel.model_name}</span>.
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md bg-rust/10 border border-rust/30 text-sm text-rust">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createLanguageModel} className="space-y-4">
        {/* Parent model linkage */}
        {parentModel ? (
          <input type="hidden" name="parent_model_id" value={parentModel.id} />
        ) : (
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Parent model <span className="text-muted-foreground font-normal">(optional — for language variants of a multilingual model)</span>
            </label>
            <select
              name="parent_model_id"
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink focus:outline-none focus:ring-1 focus:ring-moss"
            >
              <option value="">None — standalone model</option>
              {allModels.map((m) => (
                <option key={m.id} value={m.id}>{m.model_name} ({m.model_type.toUpperCase()})</option>
              ))}
            </select>
          </div>
        )}

        {/* Language linkage */}
        {lang ? (
          <input type="hidden" name="language_id" value={lang.id} />
        ) : (
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Language <span className="text-muted-foreground font-normal">(optional — leave blank for multilingual umbrella records)</span>
            </label>
            <select
              name="language_id"
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink focus:outline-none focus:ring-1 focus:ring-moss"
            >
              <option value="">Multilingual / no specific language</option>
              {allLanguages.map((l) => (
                <option key={l.id} value={l.id}>{l.english_name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Model name *</label>
          <input
            name="model_name"
            required
            placeholder="e.g. Whisper Large v3, MMS TTS, XTTS v2"
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Provider *</label>
            <select
              name="provider"
              required
              defaultValue={parentModel?.provider ?? ''}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink focus:outline-none focus:ring-1 focus:ring-moss"
            >
              <option value="">Select provider</option>
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
              defaultValue={parentModel?.model_type ?? ''}
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink focus:outline-none focus:ring-1 focus:ring-moss"
            >
              <option value="">Select type</option>
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
              placeholder="e.g. mit, apache-2.0, cc-by-nc-4.0"
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_open_source"
            name="is_open_source"
            defaultChecked
            className="rounded border-border text-moss focus:ring-moss"
          />
          <label htmlFor="is_open_source" className="text-sm text-ink">Open source</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Source URL</label>
          <input
            name="source_url"
            type="url"
            placeholder="https://huggingface.co/… or https://github.com/…"
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss"
          />
        </div>

        {/* Evaluation metrics */}
        <div className="pt-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Evaluation metrics</p>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">WER %</label>
              <input name="wer" type="number" step="0.1" min="0" max="100" placeholder="e.g. 12.4"
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">CER %</label>
              <input name="cer" type="number" step="0.1" min="0" max="100" placeholder="e.g. 5.1"
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">BLEU</label>
              <input name="bleu_score" type="number" step="0.1" min="0" max="100" placeholder="e.g. 32.5"
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Test dataset</label>
              <input name="eval_dataset" placeholder="e.g. CommonVoice 17 test"
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Parameter count</label>
              <input name="parameter_count" type="number" min="0" placeholder="e.g. 1500000000"
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-ink mb-1">Eval notes</label>
            <input name="eval_notes" placeholder="e.g. Zero-shot; fine-tuned on 10h; greedy decoding"
              className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Notes</label>
          <textarea name="notes" rows={3} placeholder="Quality notes, limitations, dialect coverage, etc."
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Last verified</label>
          <input name="last_verified_at" type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink focus:outline-none focus:ring-1 focus:ring-moss" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="px-4 py-2 bg-moss text-white text-sm rounded-md hover:bg-moss/90 transition-colors font-medium">
            Add model
          </button>
          <Link href={cancelHref} className="px-4 py-2 text-sm text-muted-foreground hover:text-ink transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

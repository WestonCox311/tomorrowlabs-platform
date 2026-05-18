import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { createLanguageModel } from '@/app/actions/language-models';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ language_id?: string; error?: string }>;
}

const PROVIDERS = ['openai', 'meta', 'microsoft', 'google', 'mozilla', 'community', 'academic'];
const MODEL_TYPES = ['stt', 'tts', 'llm', 'translation', 'g2p'];
const QUALITY_TIERS = ['production', 'usable', 'experimental', 'none'];

export default async function NewLanguageModelPage({ searchParams }: Props) {
  const { language_id, error } = await searchParams;
  if (!language_id) notFound();

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: lang } = await (supabase.from('languages') as any)
    .select('id, english_name')
    .eq('id', language_id)
    .single();

  if (!lang) notFound();

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6">
        <Link
          href={`/admin/languages/${language_id}`}
          className="text-xs text-muted-foreground hover:text-ink transition-colors"
        >
          ← {lang.english_name}
        </Link>
        <h1 className="text-2xl font-semibold text-ink mt-2">Add language model</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record a specific TTS, STT, or other AI model resource for {lang.english_name}.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md bg-rust/10 border border-rust/30 text-sm text-rust">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={createLanguageModel} className="space-y-4">
        <input type="hidden" name="language_id" value={language_id} />

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

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Notes</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Quality notes, limitations, dialect coverage, etc."
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-moss resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Last verified</label>
          <input
            name="last_verified_at"
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-ink focus:outline-none focus:ring-1 focus:ring-moss"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-moss text-white text-sm rounded-md hover:bg-moss/90 transition-colors font-medium"
          >
            Add model
          </button>
          <Link
            href={`/admin/languages/${language_id}`}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-ink transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

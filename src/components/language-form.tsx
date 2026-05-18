import type { Database } from '@/lib/database.types';
import Link from 'next/link';

type Language = Database['public']['Tables']['languages']['Row'];
type Granularity = Database['public']['Enums']['language_granularity'];

const GRANULARITIES: Granularity[] = ['macrolanguage', 'language', 'dialect', 'variety', 'register'];

interface Props {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<Language>;
  cancelHref: string;
  error?: string;
}

function Field({ label, name, defaultValue, required, placeholder, monospace }: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  placeholder?: string;
  monospace?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink mb-1.5">
        {label}{required && <span className="text-rust ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue ?? ''}
        required={required}
        placeholder={placeholder}
        className={`w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent ${monospace ? 'font-mono' : ''}`}
      />
    </div>
  );
}

export function LanguageForm({ action, defaultValues, cancelHref, error }: Props) {
  return (
    <form action={action} className="space-y-5">
      <Field label="English name" name="english_name" defaultValue={defaultValues?.english_name} required placeholder="e.g. Khmer" />
      <Field label="Endonym" name="endonym" defaultValue={defaultValues?.endonym} placeholder="e.g. ភាសាខ្មែរ" />

      <div className="grid grid-cols-2 gap-4">
        <Field label="Glottocode" name="glottocode" defaultValue={defaultValues?.glottocode} monospace placeholder="e.g. khmr1253" />
        <Field label="ISO 639-3" name="iso_639_3" defaultValue={defaultValues?.iso_639_3} monospace placeholder="e.g. khm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="ISO 639-1" name="iso_639_1" defaultValue={defaultValues?.iso_639_1} monospace placeholder="e.g. km" />
        <Field label="Ethnologue status" name="ethnologue_status" defaultValue={defaultValues?.ethnologue_status} placeholder="e.g. 6a" />
      </div>

      <div>
        <label htmlFor="granularity" className="block text-sm font-medium text-ink mb-1.5">
          Granularity<span className="text-rust ml-1">*</span>
        </label>
        <select
          id="granularity"
          name="granularity"
          defaultValue={defaultValues?.granularity ?? 'language'}
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
        >
          {GRANULARITIES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-ink mb-1.5">Notes</label>
        <textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes ?? ''}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent resize-none"
          placeholder="Any additional context…"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-moss hover:bg-moss-light rounded-md transition-colors"
        >
          Save
        </button>
        <Link
          href={cancelHref}
          className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

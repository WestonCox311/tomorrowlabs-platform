import Link from 'next/link';
import { LanguageForm } from '@/components/language-form';
import { createLanguage } from '@/app/actions/languages';

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewLanguagePage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/admin/languages" className="hover:text-ink">Languages</Link>
        <span>/</span>
        <span className="text-ink">New</span>
      </div>

      <h1 className="text-2xl font-semibold text-ink mb-8">Add language</h1>

      <LanguageForm
        action={createLanguage}
        cancelHref="/admin/languages"
        error={error}
      />
    </div>
  );
}

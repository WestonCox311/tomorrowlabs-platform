# Code Conventions

The conventions Claude Code follows when writing code for this project. These are also covered briefly in `CLAUDE.md` — this file is the deeper reference.

---

## TypeScript

### Strict mode is non-negotiable

`tsconfig.json` should have:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### No `any` types

Use `unknown` when you genuinely don't know the type, then narrow:

```typescript
// Bad
function processData(data: any) { ... }

// Good
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'id' in data) {
    // now narrowed
  }
}
```

### Database types

Always use the generated Supabase types from `src/lib/database.types.ts`. Never hand-roll types that should match the database — they'll drift.

```typescript
import type { Database } from '@/lib/database.types';

type Language = Database['public']['Tables']['languages']['Row'];
type LanguageInsert = Database['public']['Tables']['languages']['Insert'];
type LanguageUpdate = Database['public']['Tables']['languages']['Update'];
```

## React / Next.js

### Server Components by default

Default to Server Components. Only use Client Components when you need:
- Interactivity (event handlers, state)
- Browser-only APIs
- React hooks (`useState`, `useEffect`, etc.)
- Real-time Supabase subscriptions

Mark Client Components explicitly with `'use client'` at the top of the file.

### File naming

- Files: `kebab-case.tsx`
- Components: `PascalCase` (named exports preferred)
- Pages (in `app/`): `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` (Next.js conventions)

### Component organization

```
src/components/
├── ui/                      ← shadcn/ui components
├── languages/
│   ├── language-list.tsx
│   ├── language-form.tsx
│   └── language-detail.tsx
├── places/
│   └── ...
└── shared/
    └── ...
```

Each entity gets its own folder under `components/`. Shared components go in `shared/`.

### Props

Always type props via interface or type:

```typescript
interface LanguageListProps {
  languages: Language[];
  onSelect?: (language: Language) => void;
}

export function LanguageList({ languages, onSelect }: LanguageListProps) { ... }
```

Destructure props in the function signature, not in the body.

## Database access

### Always through the typed client

```typescript
// In a Server Component or Server Action
import { createClient } from '@/lib/supabase/server';

export async function getLanguages() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('languages')
    .select('*')
    .order('english_name');

  if (error) throw error;
  return data;
}
```

### Never expose service role key to client

The `service_role` key bypasses RLS. It must only be used in:
- Server Components
- Server Actions
- Route Handlers
- Background scripts

Never in `'use client'` files. Never in code that runs in the browser.

### Use database views for complex queries

If you find yourself writing a complex query in application code, create a database view in a new migration. Application code should be simple `.from('view_name').select('*')` queries against pre-shaped views.

## Styling

### Tailwind for everything

Use Tailwind utility classes. No CSS modules, no styled-components, no inline styles (except dynamic values that can't be expressed in Tailwind).

### shadcn/ui for components

Use shadcn/ui as the component library. Customize via Tailwind classes, not by ejecting components.

### Color scheme

Match the warm, earthy palette from the strategic documents:
- Background: paper-warm (`#FAF6EC`)
- Text: ink (`#1A1614`)
- Accent: moss green (`#2D5F3F`)
- Critical: rust (`#B85C2E`)

Configure these in `tailwind.config.ts` as CSS variables.

## State management

### Prefer URL state

For lists with filters, search, pagination — encode state in URL parameters. Bookmarkable URLs are good UX.

### Local component state for UI

`useState` for form inputs, dialog open/closed, etc.

### Don't add a state library

No Redux, Zustand, Jotai, etc. for the first build. Server Components + URL state + local state cover everything we need. Add a state library only when there's a specific need that these can't address.

## Error handling

### Throw, don't return errors

For unexpected errors (database connection failure, etc.):

```typescript
const { data, error } = await supabase.from('languages').select();
if (error) throw new Error(`Failed to load languages: ${error.message}`);
return data;
```

### Handle expected errors gracefully

For expected errors (validation, "not found"):

```typescript
const { data, error } = await supabase.from('languages').select().eq('id', id).single();
if (error?.code === 'PGRST116') return null; // Not found is expected
if (error) throw error;
return data;
```

### Error boundaries

Wrap routes in error boundaries. Show user-friendly errors, log details to console.

## Database conventions

### Migrations

- File naming: `migration-NNN-descriptive-name.sql`
- Increment NNN by 1 each time
- Never modify existing migrations — create new ones
- Include reasoning in SQL comments

### Tables

- Names: `snake_case`, plural (`languages`, `organizations`)
- Primary keys: `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
- Timestamps: `created_at`, `updated_at` (both `timestamptz`)
- Foreign keys: `<table>_id` (singular)

### Columns

- Names: `snake_case`
- Booleans: `is_*` or `has_*` prefix
- Dates without time: `*_date`
- Times: `*_at`

## Commits

### Conventional commits format

```
<type>: <description>

[optional body]

[optional footer]
```

Types:
- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — maintenance, no functional change
- `docs:` — documentation only
- `refactor:` — code change with no functional impact
- `style:` — formatting only
- `test:` — adding or updating tests

Example:
```
feat: add languages list page with search

Implements task 05 (Languages CRUD). List page shows all languages
with sortable columns and search by name/glottocode. Edit and delete
deferred to next session.
```

### Commit frequency

Commit often. Each commit should be a logical unit of change. Don't accumulate days of work into one commit.

## Testing

### For the first phase: manual

Build with care, test in browser, document any flows that need verification. No automated testing infrastructure for the first build.

### When tests become valuable

Add tests when:
- A bug is found and fixed (write a test that would have caught it)
- A function has complex logic worth pinning down
- Data shape transformations are tricky

Use Vitest when you're ready. Start with unit tests for `src/lib/` utilities, integration tests for Server Actions.

## Performance

### Don't optimize prematurely

Build it working first. Optimize only when:
- Page loads feel slow (>1 second)
- A specific query is identifiably slow
- The Network tab shows actual problems

### Database indexes

The migrations include indexes on commonly-queried columns. If you find a slow query, add an index in a new migration.

### Image optimization

Use Next.js `<Image>` component for any images. Configure remote patterns in `next.config.js` as needed.

## Security

### Never log secrets

Don't `console.log` env vars, tokens, or user data with PII. Use a proper logger that filters sensitive fields.

### Validate on the server

Client-side validation is for UX. Server-side validation is for security. Always validate on the server before writing to the database.

### Use RLS

Supabase Row Level Security policies should be configured to match the `access_control_policies` table. Application code should fail closed if RLS denies access — never bypass with service role key just to make something work.

---

## When to update this file

When a recurring pattern emerges that should be standardized. When a convention causes friction repeatedly. When external tools or libraries change the right way to do something.

Don't update it for every preference. The point is shared discipline, not exhaustive prescription.

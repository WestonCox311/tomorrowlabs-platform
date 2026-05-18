import { signIn } from '@/app/actions/auth';

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-warm">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-ink">TomorrowLabs</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin Platform</p>
        </div>

        <div className="bg-background border border-border rounded-lg p-8 shadow-sm">
          <h2 className="text-base font-medium text-ink mb-6">Sign in</h2>

          <form action={signIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-moss hover:bg-moss-light rounded-md transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

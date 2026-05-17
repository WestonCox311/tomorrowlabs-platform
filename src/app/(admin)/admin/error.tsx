'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-96">
      <h1 className="text-xl font-semibold text-ink mb-2">Something went wrong</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">
        {error.message || 'An unexpected error occurred. Try refreshing, or reset the page below.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 text-sm font-medium text-white bg-moss hover:bg-moss-light rounded-md transition-colors"
        >
          Try again
        </button>
        <a
          href="/admin/dashboard"
          className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted/50 transition-colors"
        >
          Back to dashboard
        </a>
      </div>
      {error.digest && (
        <p className="mt-4 text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>
      )}
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-96">
      <p className="text-6xl font-semibold text-muted-foreground/30 mb-4">404</p>
      <h1 className="text-xl font-semibold text-ink mb-2">Page not found</h1>
      <p className="text-sm text-muted-foreground mb-6">
        That record may have been deleted, or the URL is wrong.
      </p>
      <Link
        href="/admin/dashboard"
        className="px-4 py-2 text-sm font-medium text-white bg-moss hover:bg-moss-light rounded-md transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}

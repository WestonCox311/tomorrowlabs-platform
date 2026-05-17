import Link from 'next/link';
import { signOut } from '@/app/actions/auth';
import { SidebarNav, SidebarUtilityLinks } from '@/components/sidebar-nav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-paper-warm">
      <aside className="w-64 shrink-0 flex flex-col border-r border-border bg-background">
        <div className="px-6 py-5 border-b border-border">
          <Link href="/admin/dashboard" className="block">
            <span className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
              TomorrowLabs
            </span>
            <p className="text-xs mt-0.5 text-muted-foreground">Admin</p>
          </Link>
        </div>

        <div className="px-3 pt-3 pb-1">
          <Link
            href="/admin/search"
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md text-muted-foreground border border-border hover:border-moss/50 hover:text-ink transition-colors w-full"
          >
            <span className="text-xs">⌕</span>
            <span>Search…</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          <SidebarNav />
        </nav>

        <SidebarUtilityLinks />

        <div className="px-3 py-4 border-t border-border">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center px-3 py-2 text-sm rounded-md text-muted-foreground transition-colors hover:bg-rust/10 hover:text-rust"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

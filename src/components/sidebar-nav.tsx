'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin/languages', label: 'Languages' },
  { href: '/admin/places', label: 'Places' },
  { href: '/admin/organizations', label: 'Organizations' },
  { href: '/admin/communities', label: 'Communities' },
  { href: '/admin/babagigi', label: 'Babagigi' },
  { href: '/admin/tech-readiness', label: 'Tech Readiness' },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <ul className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                isActive
                  ? 'bg-moss/15 text-moss font-medium'
                  : 'text-ink hover:bg-moss/10 hover:text-moss'
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

import Link from 'next/link';

interface SortHeaderProps {
  href: string;
  label: string;
  isActive: boolean;
  isAsc: boolean;
}

export function SortHeader({ href, label, isActive, isAsc }: SortHeaderProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 group hover:text-ink transition-colors ${isActive ? 'text-ink' : ''}`}
    >
      {label}
      <span
        className={`text-[10px] leading-none transition-opacity ${
          isActive ? 'opacity-70' : 'opacity-0 group-hover:opacity-40'
        }`}
      >
        {isActive ? (isAsc ? '↑' : '↓') : '↑'}
      </span>
    </Link>
  );
}

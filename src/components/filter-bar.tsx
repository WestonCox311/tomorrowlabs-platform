'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  param: string;
  label: string;
  defaultLabel: string;
  options: FilterOption[];
}

interface FilterBarProps {
  basePath: string;
  searchPlaceholder?: string;
  searchParam?: string; // set to undefined to hide the text search input
  filters: FilterField[];
}

export function FilterBar({
  basePath,
  searchPlaceholder = 'Search…',
  searchParam = 'q',
  filters,
}: FilterBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchValue, setSearchValue] = useState(
    searchParam ? (searchParams.get(searchParam) ?? '') : '',
  );

  function buildUrl(overrides: Record<string, string | null>): string {
    const params = new URLSearchParams();
    // Always preserve sort/dir
    const sort = searchParams.get('sort');
    const dir = searchParams.get('dir');
    if (sort) params.set('sort', sort);
    if (dir) params.set('dir', dir);
    // Preserve existing search value
    if (searchParam) {
      const cur = searchParams.get(searchParam);
      if (cur) params.set(searchParam, cur);
    }
    // Preserve existing filter values
    for (const f of filters) {
      const cur = searchParams.get(f.param);
      if (cur) params.set(f.param, cur);
    }
    // Apply overrides on top
    for (const [key, val] of Object.entries(overrides)) {
      if (val === null || val === '') params.delete(key);
      else params.set(key, val);
    }
    // Always reset to page 1 on filter/search change
    params.delete('page');
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  function handleSelectChange(param: string, value: string) {
    router.push(buildUrl({ [param]: value || null }));
  }

  function handleSearch() {
    if (!searchParam) return;
    router.push(buildUrl({ [searchParam]: searchValue || null }));
  }

  function removeFilter(param: string) {
    router.push(buildUrl({ [param]: null }));
    if (param === searchParam) setSearchValue('');
  }

  function clearAll() {
    const params = new URLSearchParams();
    const sort = searchParams.get('sort');
    const dir = searchParams.get('dir');
    if (sort) params.set('sort', sort);
    if (dir) params.set('dir', dir);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
    setSearchValue('');
  }

  // Build active filter chips
  const activeFilters: { param: string; label: string; value: string }[] = [];
  if (searchParam) {
    const v = searchParams.get(searchParam);
    if (v) activeFilters.push({ param: searchParam, label: 'Search', value: v });
  }
  for (const f of filters) {
    const v = searchParams.get(f.param);
    if (v) {
      const optLabel = f.options.find((o) => o.value === v)?.label ?? v;
      activeFilters.push({ param: f.param, label: f.label, value: optLabel });
    }
  }

  const hasActive = activeFilters.length > 0;

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-3">
        {searchParam && (
          <>
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={searchPlaceholder}
              className="flex-1 min-w-48 px-3 py-2 text-sm border border-border rounded-md bg-background text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-moss focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-moss/10 transition-colors"
            >
              Search
            </button>
          </>
        )}
        {filters.map((f) => (
          <select
            key={f.param}
            value={searchParams.get(f.param) ?? ''}
            onChange={(e) => handleSelectChange(f.param, e.target.value)}
            className="px-3 py-2 text-sm border border-border rounded-md bg-background text-ink focus:outline-none focus:ring-2 focus:ring-moss"
          >
            <option value="">{f.defaultLabel}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
        {hasActive && (
          <button
            onClick={clearAll}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-ink transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {hasActive && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters.map((af) => (
            <button
              key={af.param}
              onClick={() => removeFilter(af.param)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-moss/10 text-moss border border-moss/20 hover:bg-moss/20 transition-colors"
            >
              <span className="font-medium">{af.label}:</span>
              <span>{af.value}</span>
              <span className="ml-0.5 opacity-70">×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

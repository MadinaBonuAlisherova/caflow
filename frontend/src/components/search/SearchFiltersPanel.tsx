import { useState } from 'react';
import { MapPin, CalendarDays, Users, Banknote, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchFilters } from '@/lib/types';

const EVENT_OPTIONS = [
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'BIRTHDAY', label: 'Birthday' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'OFFICE_MEALS', label: 'Office meals' },
  { value: 'TEAM_BUILDING', label: 'Team building' },
  { value: 'CEREMONY', label: 'Ceremony' },
] as const;

const CUISINE_PILLS = [
  { label: '4.5+', key: 'minRating', value: '4.5' },
  { label: 'Italian', key: 'cuisine', value: 'Italian' },
  { label: 'BBQ', key: 'cuisine', value: 'BBQ' },
  { label: 'Asian', key: 'cuisine', value: 'Asian Fusion' },
  { label: 'European', key: 'cuisine', value: 'European' },
  { label: 'Uzbek', key: 'cuisine', value: 'Uzbek' },
] as const;

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended', sort: 'rating' as const, sortTab: 'recommended' },
  { id: 'rated', label: 'Top rated', sort: 'rating' as const, sortTab: 'rated' },
  { id: 'price', label: 'Price ↑', sort: 'price' as const, sortTab: 'price' },
];

export interface SearchFiltersPanelProps {
  filters: SearchFilters;
  areas: string[];
  sortTab: string;
  resultCount?: number;
  isLoading?: boolean;
  params: URLSearchParams;
  onPatch: (updates: Record<string, string | null>, resetPage?: boolean) => void;
  onTogglePill: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export function SearchFiltersPanel({
  filters,
  areas,
  sortTab,
  resultCount,
  isLoading,
  params,
  onPatch,
  onTogglePill,
  onClearFilters,
}: SearchFiltersPanelProps) {
  const [showCuisine, setShowCuisine] = useState(false);
  const activeChips = buildActiveChips(filters);
  const sortValue = SORT_OPTIONS.find((o) => o.sortTab === sortTab)?.sortTab ?? 'recommended';

  return (
    <div className="sticky top-14 z-30 rounded-xl border border-line/80 bg-white shadow-sm">
      {/* Primary toolbar — one compact row on desktop */}
      <div className="flex flex-wrap items-center gap-1.5 px-2 py-2 sm:gap-2 sm:px-3">
        <ToolbarSelect
          icon={<MapPin size={13} className="text-gold-600" />}
          value={filters.area ?? ''}
          onChange={(v) => onPatch({ area: v || null })}
          aria-label="Area"
        >
          <option value="">Area</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </ToolbarSelect>

        <ToolbarSelect
          icon={<CalendarDays size={13} />}
          value={filters.event ?? ''}
          onChange={(v) => onPatch({ event: v || null })}
          aria-label="Event"
        >
          <option value="">Event</option>
          {EVENT_OPTIONS.map((ev) => (
            <option key={ev.value} value={ev.value}>
              {ev.label}
            </option>
          ))}
        </ToolbarSelect>

        <label className="inline-flex min-w-[4.5rem] items-center gap-1 rounded-lg border border-line/70 bg-cream/40 px-2 py-1">
          <Users size={13} className="shrink-0 text-muted" aria-hidden />
          <input
            type="number"
            min={1}
            className="w-12 bg-transparent text-xs font-medium text-ink outline-none sm:w-14 sm:text-sm"
            placeholder="Guests"
            value={filters.guests ?? ''}
            onChange={(e) => onPatch({ guests: e.target.value || null })}
            aria-label="Guests"
          />
        </label>

        <label className="inline-flex min-w-[5rem] items-center gap-1 rounded-lg border border-line/70 bg-cream/40 px-2 py-1">
          <Banknote size={13} className="shrink-0 text-muted" aria-hidden />
          <input
            type="number"
            min={0}
            className="w-16 bg-transparent text-xs font-medium text-ink outline-none sm:w-20 sm:text-sm"
            placeholder="Max/person"
            value={filters.maxPrice ?? ''}
            onChange={(e) => onPatch({ maxPrice: e.target.value || null })}
            aria-label="Max price per person"
          />
        </label>

        <ToolbarSelect
          value={sortValue}
          onChange={(v) => {
            const opt = SORT_OPTIONS.find((o) => o.sortTab === v) ?? SORT_OPTIONS[0]!;
            onPatch({ sort: opt.sort, sortTab: opt.sortTab });
          }}
          aria-label="Sort"
          className="ml-auto sm:ml-0"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.id} value={o.sortTab}>
              {o.label}
            </option>
          ))}
        </ToolbarSelect>

        {!isLoading && resultCount != null ? (
          <span className="hidden text-xs text-muted sm:inline">
            {resultCount.toLocaleString()} result{resultCount === 1 ? '' : 's'}
          </span>
        ) : null}

        {activeChips.length > 0 ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-[11px] font-semibold text-gold-700 hover:text-gold-900"
          >
            Reset
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setShowCuisine((v) => !v)}
          className="inline-flex items-center gap-0.5 rounded-lg border border-line/70 px-2 py-1 text-[11px] font-semibold text-muted hover:text-ink sm:hidden"
        >
          Cuisine
          <ChevronDown size={12} className={cn('transition-transform', showCuisine && 'rotate-180')} />
        </button>
      </div>

      {/* Cuisine pills — always on sm+, toggle on mobile */}
      <div
        className={cn(
          'flex flex-wrap items-center gap-1 border-t border-line/40 px-2 py-1.5 sm:px-3',
          showCuisine ? 'flex' : 'hidden sm:flex',
        )}
      >
        {CUISINE_PILLS.map((pill) => {
          const active = params.get(pill.key) === pill.value;
          return (
            <button
              key={pill.label}
              type="button"
              onClick={() => onTogglePill(pill.key, pill.value)}
              className={cn(
                'rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors',
                active
                  ? 'border-gold bg-gold text-ink'
                  : 'border-line/80 bg-cream/50 text-muted hover:border-gold/40 hover:text-ink',
              )}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1 border-t border-line/30 bg-gold-50/30 px-2 py-1 sm:px-3">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onPatch({ [chip.key]: null })}
              className="inline-flex items-center gap-0.5 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-ink shadow-sm"
            >
              {chip.label}
              <X size={10} className="text-muted" aria-hidden />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function buildActiveChips(filters: SearchFilters): { key: string; label: string }[] {
  const chips: { key: string; label: string }[] = [];
  if (filters.event) {
    const label = EVENT_OPTIONS.find((e) => e.value === filters.event)?.label ?? filters.event;
    chips.push({ key: 'event', label });
  }
  if (filters.guests) chips.push({ key: 'guests', label: `${filters.guests} guests` });
  if (filters.maxPrice) chips.push({ key: 'maxPrice', label: `≤ ${filters.maxPrice.toLocaleString()}` });
  if (filters.cuisine) chips.push({ key: 'cuisine', label: filters.cuisine });
  if (filters.minRating) chips.push({ key: 'minRating', label: `${filters.minRating}+★` });
  return chips;
}

function ToolbarSelect({
  icon,
  value,
  onChange,
  children,
  className,
  ...props
}: {
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'>) {
  return (
    <label className={cn('inline-flex items-center gap-1 rounded-lg border border-line/70 bg-cream/40 px-2 py-1', className)}>
      {icon}
      <select
        className="max-w-[6.5rem] bg-transparent text-xs font-medium text-ink outline-none sm:max-w-none sm:text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

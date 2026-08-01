import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Store, UtensilsCrossed } from 'lucide-react';
import { useSolutions } from '@/hooks/useSolutions';
import { VendorBrowseCard } from '@/components/vendors/VendorBrowseCard';
import { Skeleton } from '@/components/ui';
import { SectionHeader } from '@/components/landing/SectionHeader';
import { BROWSE_THEMES } from '@/lib/browseThemes';
import { cn } from '@/lib/utils';
import type { VendorType } from '@/lib/types';

const TYPE_TABS: { id: VendorType; label: string; icon: typeof Store }[] = [
  { id: 'RESTAURANT', label: 'Restaurants', icon: Store },
  { id: 'CATERER', label: 'Caterers', icon: UtensilsCrossed },
  { id: 'CHEF', label: 'Chefs', icon: ChefHat },
];

export function FeaturedCaterers() {
  const [vendorType, setVendorType] = useState<VendorType>('RESTAURANT');
  const theme = BROWSE_THEMES[vendorType];

  const { data, isLoading } = useSolutions({
    area: 'Tashkent',
    vendorType,
    size: 6,
    minRating: 4,
    sort: 'rating',
  });

  const vendors = (data?.content ?? []).slice(0, 3);

  return (
    <section className="bg-cream/60 py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Marketplace"
          title="Popular in Tashkent"
          description={theme.subtitle}
          href={`/search?type=${vendorType}&area=Tashkent`}
        />

        <div className="mb-6 inline-flex rounded-full border border-line/80 bg-white p-1 shadow-sm">
          {TYPE_TABS.map(({ id, label, icon: Icon }) => {
            const active = vendorType === id;
            const tabTheme = BROWSE_THEMES[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => setVendorType(id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm',
                  active ? tabTheme.activeTab : tabTheme.inactiveTab,
                )}
              >
                <Icon size={14} aria-hidden />
                {label}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : vendors.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => (
              <VendorBrowseCard
                key={vendor.id}
                vendor={vendor}
                variant={vendorType === 'CHEF' ? 'chef' : 'default'}
              />
            ))}
          </div>
        ) : (
          <div className={cn('rounded-2xl border border-dashed bg-white/80 px-6 py-12 text-center', theme.accentBorder)}>
            <p className="text-sm text-muted">
              No featured {theme.plural} in Tashkent yet — be the first to browse.
            </p>
            <Link
              to={`/search?type=${vendorType}&area=Tashkent`}
              className={cn('mt-3 inline-flex items-center gap-1 text-sm font-semibold hover:underline', theme.accentText)}
            >
              Browse all {theme.plural}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

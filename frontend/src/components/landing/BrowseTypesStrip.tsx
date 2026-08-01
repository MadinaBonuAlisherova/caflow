import { Link } from 'react-router-dom';
import { ArrowRight, ChefHat, LayoutGrid, Store, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/landing/SectionHeader';
import { BROWSE_THEMES } from '@/lib/browseThemes';

const STRIP_ITEMS = [
  { themeKey: 'ALL' as const, icon: LayoutGrid, href: '/search?area=Tashkent' },
  { themeKey: 'RESTAURANT' as const, icon: Store, href: '/search?type=RESTAURANT&area=Tashkent' },
  { themeKey: 'CATERER' as const, icon: UtensilsCrossed, href: '/search?type=CATERER&area=Tashkent' },
  { themeKey: 'CHEF' as const, icon: ChefHat, href: '/search?type=CHEF&area=Tashkent' },
] as const;

export function BrowseTypesStrip() {
  return (
    <section className="border-b border-line/60 bg-white py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Browse marketplace"
          title="Find the right partner"
          description="Restaurants for scale, caterers for events, private chefs for intimate dining."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STRIP_ITEMS.map(({ themeKey, icon: Icon, href }) => {
            const theme = BROWSE_THEMES[themeKey];
            return (
              <Link
                key={href}
                to={href}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border border-line/70 bg-gradient-to-br p-5 transition-all duration-200',
                  'hover:-translate-y-0.5 hover:border-gold/35 hover:shadow-card',
                  theme.cardTint,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={cn('grid h-11 w-11 place-items-center rounded-xl', theme.iconBg)}>
                    <Icon size={20} aria-hidden />
                  </span>
                  <ArrowRight
                    size={16}
                    className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gold-700"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-ink">{theme.label}</h3>
                <p className="mt-1 text-sm leading-snug text-muted">{theme.exploreDesc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

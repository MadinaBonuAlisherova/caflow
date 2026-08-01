import { Link } from 'react-router-dom';
import { Cake, Briefcase, Heart, PartyPopper, Users, UtensilsCrossed } from 'lucide-react';
import { SectionHeader } from '@/components/landing/SectionHeader';
import { cn } from '@/lib/utils';

/** Brand palette only — gold, plum, sage, apricot, cream */
const CATEGORIES = [
  { name: 'Weddings', event: 'WEDDING', icon: Heart, tint: 'border-plum/20 bg-plum-50/50', iconBg: 'bg-plum-50 text-plum' },
  { name: 'Corporate', event: 'CORPORATE', icon: Briefcase, tint: 'border-gold/30 bg-gold-50/70', iconBg: 'bg-gold-100 text-gold-700' },
  { name: 'Birthdays', event: 'BIRTHDAY', icon: Cake, tint: 'border-apricot/25 bg-apricot-50/60', iconBg: 'bg-apricot-50 text-apricot-600' },
  { name: 'Office meals', event: 'OFFICE_MEALS', icon: Users, tint: 'border-sage/25 bg-sage-50/80', iconBg: 'bg-sage-50 text-sage' },
  { name: 'Team events', event: 'TEAM_BUILDING', icon: PartyPopper, tint: 'border-gold/25 bg-gold-50/50', iconBg: 'bg-gold-100 text-gold-700' },
  { name: 'Private dining', event: 'CEREMONY', icon: UtensilsCrossed, tint: 'border-plum/15 bg-plum-50/35', iconBg: 'bg-plum-50 text-plum' },
] as const;

export function CategoriesSection() {
  return (
    <section className="border-y border-line/60 bg-white py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="By occasion"
          title="What are you celebrating?"
          description="Jump straight to partners that specialize in your event type."
          href="/search?type=RESTAURANT&area=Tashkent"
          linkLabel="Browse all"
        />
        <div className="flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-6 [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/search?type=RESTAURANT&area=Tashkent&event=${encodeURIComponent(cat.event)}`}
                className={cn(
                  'group flex min-w-[7.75rem] shrink-0 flex-col items-center rounded-2xl border px-3 py-4 text-center transition-all duration-200',
                  'hover:-translate-y-0.5 hover:shadow-card motion-reduce:transition-none sm:min-w-0',
                  cat.tint,
                )}
              >
                <span
                  className={cn(
                    'mb-2.5 grid h-11 w-11 place-items-center rounded-xl shadow-sm transition-transform group-hover:scale-105 motion-reduce:transition-none',
                    cat.iconBg,
                  )}
                >
                  <Icon size={18} aria-hidden />
                </span>
                <span className="text-xs font-semibold text-ink sm:text-sm">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

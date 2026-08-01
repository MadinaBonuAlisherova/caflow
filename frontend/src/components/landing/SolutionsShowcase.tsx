import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  Building2,
  CalendarHeart,
  ChefHat,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/landing/SectionHeader';

const SOLUTIONS = [
  {
    id: 'caterai',
    label: 'CaterAi',
    icon: Bot,
    title: 'Instantly plan menus from a single chat',
    description:
      'Describe headcount, budget, dietary needs, and cuisine — CaterAi matches vetted partners and collects tailored offers within 24 hours.',
    tags: ['AI matching', '24h offers', 'Any budget'],
    href: '/#caterai',
    linkLabel: 'Try CaterAi',
    accent: 'from-gold-50/80 via-white to-honey-50/60',
    iconBg: 'bg-gold-100 text-gold-700',
  },
  {
    id: 'events',
    label: 'Event catering',
    icon: CalendarHeart,
    title: 'Weddings, celebrations & large gatherings',
    description:
      'Buffet and plated menus from restaurants and caterers — compare quotes, dietary coverage, and delivery or full-service options.',
    tags: ['Buffet', 'Plated', 'On-site staff'],
    href: '/search?type=CATERER&area=Tashkent&event=WEDDING',
    linkLabel: 'Browse events',
    accent: 'from-plum-50/50 via-white to-apricot-50/40',
    iconBg: 'bg-plum-50 text-plum',
  },
  {
    id: 'corporate',
    label: 'Corporate',
    icon: Building2,
    title: 'Office lunches & team catering',
    description:
      'Recurring or one-off corporate meals with transparent pricing — boxed lunches, buffet spreads, and halal or dietary-friendly menus.',
    tags: ['Boxed meals', 'Buffet', 'Recurring'],
    href: '/search?type=RESTAURANT&area=Tashkent&event=CORPORATE',
    linkLabel: 'Corporate catering',
    accent: 'from-sage-50/70 via-white to-gold-50/50',
    iconBg: 'bg-sage-50 text-sage',
  },
  {
    id: 'chefs',
    label: 'Private chefs',
    icon: ChefHat,
    title: 'Intimate dining & bespoke menus',
    description:
      'Book vetted private chefs for home dinners, small celebrations, and tasting menus — personalized to your guests and space.',
    tags: ['Private dining', 'Custom menu', 'At home'],
    href: '/search?type=CHEF&area=Tashkent',
    linkLabel: 'Find a chef',
    accent: 'from-apricot-50/60 via-white to-gold-50/40',
    iconBg: 'bg-apricot-50 text-apricot-600',
  },
] as const;

type SolutionId = (typeof SOLUTIONS)[number]['id'];

/** ZeroCater-style tabbed product showcase */
export function SolutionsShowcase() {
  const [active, setActive] = useState<SolutionId>('caterai');
  const current = SOLUTIONS.find((s) => s.id === active) ?? SOLUTIONS[0]!;
  const Icon = current.icon;

  return (
    <section className="bg-cream/40 py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Solutions"
          title="Personalized catering for every occasion"
          description="Buffet and boxed meals for teams, families, and events of any size — powered by CaterAi or structured browse."
        />

        <div className="mb-5 flex gap-1 overflow-x-auto rounded-full border border-line/70 bg-white p-1 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] sm:inline-flex [&::-webkit-scrollbar]:hidden">
          {SOLUTIONS.map(({ id, label, icon: TabIcon }) => {
            const selected = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all sm:px-4 sm:text-sm',
                  selected
                    ? 'bg-gradient-to-r from-honey to-gold text-ink shadow-warm'
                    : 'text-muted hover:bg-gold-50/80 hover:text-ink',
                )}
              >
                <TabIcon size={14} aria-hidden />
                {label}
              </button>
            );
          })}
        </div>

        <article
          className={cn(
            'overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br shadow-card ring-1 ring-gold/10',
            current.accent,
          )}
        >
          <div className="h-1 bg-gradient-to-r from-gold-400 via-gold to-apricot/80" aria-hidden />
          <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto] sm:items-start sm:p-7 md:gap-8">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-white/90 px-3 py-1 text-[11px] font-semibold text-gold-700">
                <Sparkles size={12} aria-hidden />
                {current.label}
              </div>
              <h3 className="font-display text-xl font-semibold text-ink sm:text-2xl">{current.title}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{current.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {current.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-white/90 px-3 py-1 text-xs font-medium text-gold-800"
                  >
                    <UtensilsCrossed size={11} className="text-gold-600" aria-hidden />
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                to={current.href}
                className="btn-lux-gold mt-5 inline-flex border-0 px-5 py-2.5 text-sm"
              >
                {current.linkLabel}
                <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
            <span
              className={cn(
                'mx-auto grid h-20 w-20 place-items-center rounded-2xl border border-gold/20 shadow-sm sm:mx-0 sm:h-24 sm:w-24',
                current.iconBg,
              )}
              aria-hidden
            >
              <Icon size={36} />
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}

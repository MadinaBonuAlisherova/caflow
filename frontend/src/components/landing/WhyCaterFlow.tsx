import { Link } from 'react-router-dom';
import { ArrowRight, ChefHat, LayoutDashboard, Sparkles } from 'lucide-react';
import { SectionHeader } from '@/components/landing/SectionHeader';

const REASONS = [
  {
    icon: ChefHat,
    title: 'Vetted partners, one request',
    text: 'Restaurants, caterers, and private chefs — pre-screened for quality. Submit once and compare tailored offers instead of cold-calling vendors.',
    href: '/#caterai',
    linkLabel: 'Get offers',
  },
  {
    icon: Sparkles,
    title: 'Menus built around your event',
    text: 'Headcount, budget, halal, vegan, or EU cuisine — partners respond with menus matched to your brief, not generic PDFs.',
    href: '/search?area=Tashkent',
    linkLabel: 'Browse menus',
  },
  {
    icon: LayoutDashboard,
    title: 'Track everything in one place',
    text: 'From first quote to deposit and delivery day — manage requests, compare offers, and message vendors in your CaterFlow account.',
    href: '/register',
    linkLabel: 'Create free account',
  },
] as const;

/** ZeroCater-style “Why companies love us” pillars */
export function WhyCaterFlow() {
  return (
    <section className="border-y border-line/60 bg-white py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Why CaterFlow"
          title="Why hosts love working with us"
          description="Less coordination, better menus, and clear pricing — whether you cater weekly or once a year."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {REASONS.map(({ icon: Icon, title, text, href, linkLabel }) => (
            <article
              key={title}
              className="group flex h-full flex-col rounded-2xl border border-line/60 bg-gradient-to-b from-white to-cream/50 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-warm"
            >
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gold-100 text-gold-700">
                <Icon size={20} aria-hidden />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{text}</p>
              <Link
                to={href}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-700 transition-colors group-hover:text-gold-600"
              >
                {linkLabel}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

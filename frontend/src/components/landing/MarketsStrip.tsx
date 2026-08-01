import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { SectionHeader } from '@/components/landing/SectionHeader';

const MARKETS = [
  { name: 'Tashkent', blurb: 'Corporate hubs, weddings & private chefs', live: true },
  { name: 'Samarkand', blurb: 'Heritage venues & destination events', live: true },
  { name: 'Bukhara', blurb: 'Boutique caterers & intimate dining', live: false },
  { name: 'Namangan', blurb: 'Family events & regional cuisine', live: false },
  { name: 'Fergana', blurb: 'Valley gatherings & office catering', live: false },
  { name: 'Andijan', blurb: 'Growing corporate & social scene', live: false },
] as const;

/** ZeroCater-style city / market exploration grid */
export function MarketsStrip() {
  return (
    <section className="border-t border-line/60 bg-white py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Coverage"
          title="Explore catering across Uzbekistan"
          description="Starting in Tashkent and Samarkand — more cities opening soon."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MARKETS.map(({ name, blurb, live }) => (
            <Link
              key={name}
              to={live ? `/search?area=${encodeURIComponent(name)}` : '/#caterai'}
              className="group flex items-start gap-3 rounded-2xl border border-line/70 bg-gradient-to-br from-white to-cream/40 p-4 transition-all hover:-translate-y-0.5 hover:border-gold/35 hover:shadow-card"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-50 text-gold-700">
                <MapPin size={18} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-semibold text-ink group-hover:text-gold-700">{name}</h3>
                  {live ? (
                    <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold-700">
                      Live
                    </span>
                  ) : (
                    <span className="rounded-full bg-line/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted">
                      Soon
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">{blurb}</p>
                <span className="mt-2 inline-flex items-center gap-0.5 text-xs font-semibold text-gold-700 opacity-0 transition-opacity group-hover:opacity-100">
                  {live ? 'Explore menus' : 'Join waitlist'}
                  <ArrowRight size={12} aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

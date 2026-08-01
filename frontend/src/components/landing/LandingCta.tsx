import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

/** ZeroCater-style closing hero CTA */
export function LandingCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-10 md:pb-14">
      <div className="overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-gold-50/90 via-honey-50/70 to-apricot-50/50 shadow-warm ring-1 ring-gold/15">
        <div className="h-1 bg-gradient-to-r from-gold via-gold-400 to-apricot" aria-hidden />
        <div className="px-6 py-8 text-center sm:px-10 sm:py-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-700">
            <Sparkles size={12} aria-hidden />
            Start today
          </p>
          <h2 className="mx-auto mt-4 max-w-xl font-display text-2xl font-semibold text-ink sm:text-3xl">
            Make your next event effortless with CaterFlow
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            Describe your event once — get matched offers from vetted partners, or browse caterers instantly.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/#caterai" className="btn-lux-gold inline-flex border-0 px-6 py-2.5 text-sm">
              Get started
            </Link>
            <Link to="/search?area=Tashkent" className="btn-lux-outline inline-flex bg-white/90 px-6 py-2.5 text-sm">
              Browse caterers
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

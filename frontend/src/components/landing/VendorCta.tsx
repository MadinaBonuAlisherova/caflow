import { Link } from 'react-router-dom';
import { CheckCircle2, ChefHat } from 'lucide-react';

const BENEFITS = ['Qualified event leads', 'Transparent pricing tools', 'No upfront listing fee'] as const;

export function VendorCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-ink text-cream shadow-lift">
        <div className="grid sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="px-5 py-6 sm:px-7 sm:py-7">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
              <ChefHat size={14} aria-hidden /> For vendors
            </div>
            <h2 className="font-display text-xl font-semibold sm:text-2xl">Grow your catering business</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-cream/75">
              Join CaterFlow&apos;s marketplace — reach corporate clients and event hosts across Uzbekistan.
            </p>
            <ul className="mt-4 space-y-2">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-cream/90">
                  <CheckCircle2 size={15} className="shrink-0 text-gold" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-white/10 bg-white/5 px-5 py-5 sm:border-l sm:border-t-0 sm:px-7">
            <Link
              to="/register"
              className="btn flex w-full justify-center bg-gold px-6 py-3 text-sm font-semibold text-ink hover:bg-gold-600 hover:text-white sm:w-auto"
            >
              Partner with us
            </Link>
            <p className="mt-2 text-center text-[11px] text-cream/50 sm:text-left">Early access · Tashkent first</p>
          </div>
        </div>
      </div>
    </section>
  );
}

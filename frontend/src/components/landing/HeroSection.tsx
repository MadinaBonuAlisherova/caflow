import { Clock3, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';

const TRUST_PILLS = [
  { icon: ShieldCheck, label: 'Vetted partners' },
  { icon: Clock3, label: 'Offers in 24h' },
  { icon: CreditCard, label: 'Deposit to confirm' },
] as const;

export function HeroSection() {
  return (
    <div className="relative mx-auto max-w-3xl px-4 pt-5 text-center md:pt-7">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-36 overflow-hidden rounded-3xl md:h-40"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gold-100/80 via-white/90 to-cream" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(242,183,5,0.22),transparent_62%)]" />
      </div>

      <p className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-700 shadow-sm">
        <Sparkles size={12} aria-hidden />
        Uzbekistan&apos;s catering marketplace
      </p>

      <h1 className="mx-auto mt-4 max-w-2xl font-display text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-ink sm:text-4xl">
        Make catering effortless with{' '}
        <span className="bg-gradient-to-r from-gold-600 via-gold to-apricot bg-clip-text text-transparent">
          CaterAi
        </span>
      </h1>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
        Over <span className="font-semibold text-gold-700">100+ vetted partners</span> — chat below to describe
        your event, or browse restaurants, caterers, and chefs by location.
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        {TRUST_PILLS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gradient-to-r from-gold-50/90 to-white px-2.5 py-1 text-[11px] font-medium text-gold-800 shadow-sm"
          >
            <Icon size={12} className="text-gold-600" aria-hidden />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

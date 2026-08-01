import { Quote, Star } from 'lucide-react';
import { SectionHeader } from '@/components/landing/SectionHeader';

const REVIEWS = [
  {
    quote: 'Submitted our corporate lunch request and had three options the same day. Smooth from start to finish.',
    name: 'Dilnoza K.',
    role: 'Office manager',
    event: 'Corporate · 60 guests',
    accent: 'border-gold/20 bg-gradient-to-br from-gold-50/40 to-white',
  },
  {
    quote: 'CaterAi took two minutes. Support matched us with a perfect wedding menu without chasing vendors.',
    name: 'Jasur M.',
    role: 'Event host',
    event: 'Wedding · 120 guests',
    accent: 'border-plum/15 bg-gradient-to-br from-plum-50/50 to-white',
  },
  {
    quote: 'Found a private chef for our anniversary dinner — browsed, compared, and booked in one afternoon.',
    name: 'Nigora A.',
    role: 'Home host',
    event: 'Private dining · 12 guests',
    accent: 'border-sage/20 bg-gradient-to-br from-sage-50/60 to-white',
  },
] as const;

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden border-t border-line/60 bg-cream py-10 md:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 10% 20%, rgba(242,183,5,0.08), transparent 40%), radial-gradient(circle at 90% 80%, rgba(91,42,78,0.06), transparent 35%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Social proof"
          title="Loved by event hosts"
          description="Real feedback from teams and families who booked through CaterFlow."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <article
              key={r.name}
              className={`relative rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card ${r.accent}`}
            >
              <Quote size={22} className="absolute right-4 top-4 text-gold/20" aria-hidden />
              <div className="mb-3 flex gap-0.5 text-gold" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className="fill-current" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-ink">&ldquo;{r.quote}&rdquo;</p>
              <div className="mt-5 border-t border-line/50 pt-4">
                <p className="text-sm font-semibold text-ink">{r.name}</p>
                <p className="mt-0.5 text-[11px] text-muted">
                  {r.role} · {r.event}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

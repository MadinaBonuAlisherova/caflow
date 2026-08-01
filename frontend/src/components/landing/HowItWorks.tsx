import { ArrowRight, MessageSquareText, Sparkles, UtensilsCrossed } from 'lucide-react';
import { SectionHeader } from '@/components/landing/SectionHeader';

const STEPS = [
  {
    icon: MessageSquareText,
    title: 'Describe your event',
    text: 'Tell CaterAi your date, headcount, budget, and cuisine — or browse by location.',
  },
  {
    icon: Sparkles,
    title: 'Compare offers',
    text: 'Vetted restaurants, caterers, and chefs send tailored menus within 24 hours.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Book with confidence',
    text: 'Pick your favorite, pay a deposit, and track delivery through to your event day.',
  },
] as const;

export function HowItWorks() {
  return (
    <section className="bg-white py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          eyebrow="Simple process"
          title="How CaterFlow works"
          description="From first message to final delivery — fewer steps than calling around."
        />
        <div className="relative grid gap-3 sm:grid-cols-3 sm:gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                {i < STEPS.length - 1 ? (
                  <ArrowRight
                    size={18}
                    className="absolute -right-1 top-10 z-10 hidden text-gold/35 sm:block"
                    aria-hidden
                  />
                ) : null}
                <article className="h-full rounded-2xl border border-line/60 bg-cream/40 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-card">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-100 text-gold-700">
                      <Icon size={18} aria-hidden />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-600">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  ShieldCheck,
  Clock,
  BadgeCheck,
  MessageSquareText,
  UtensilsCrossed,
  PartyPopper,
  Store,
  ChefHat,
  Quote,
  Building2,
  Cake,
  Users,
} from 'lucide-react';
import { CateringMenuSections } from '@/components/catering/CateringMenuSections';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { SectionHeader } from '@/components/landing/SectionHeader';
import type { VendorType } from '@/lib/types';

export interface SearchResultsFooterProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  areaLabel: string;
  typeLabel: string;
  vendorType?: VendorType;
  onPageChange: (page: number) => void;
}

const TRUST_STATS = [
  { value: '24h', label: 'First offer' },
  { value: '100+', label: 'Vetted partners' },
  { value: '4.8★', label: 'Host rating' },
  { value: '0%', label: 'Browse fee' },
] as const;

const HOW_IT_WORKS = [
  {
    icon: MessageSquareText,
    title: 'Describe your event',
    text: 'Share date, headcount, budget, and cuisine — or keep browsing by location.',
  },
  {
    icon: Sparkles,
    title: 'Compare tailored offers',
    text: 'Vetted restaurants and caterers respond with menus and pricing within 24 hours.',
  },
  {
    icon: PartyPopper,
    title: 'Book with confidence',
    text: 'Choose your favorite, confirm online, and track delivery through event day.',
  },
] as const;

const EVENT_LINKS = [
  { event: 'WEDDING', label: 'Weddings', icon: Cake },
  { event: 'CORPORATE', label: 'Corporate', icon: Building2 },
  { event: 'BIRTHDAY', label: 'Birthdays', icon: PartyPopper },
  { event: 'OFFICE_MEALS', label: 'Office meals', icon: Users },
] as const;

export function SearchResultsFooter({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  areaLabel,
  typeLabel,
  vendorType,
  onPageChange,
}: SearchResultsFooterProps) {
  const start = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalElements);
  const pages = buildPageList(currentPage, totalPages);
  const areaParam = encodeURIComponent(areaLabel);
  const typeParam = vendorType ? `&type=${vendorType}` : '';

  const browseCards = [
    {
      to: `/search?type=RESTAURANT&area=${areaParam}`,
      label: 'Restaurants',
      desc: 'Full-service menus for any headcount',
      icon: Store,
      tint: 'from-gold-50/80 to-white',
      iconBg: 'bg-gold-100 text-gold-700',
      active: vendorType === 'RESTAURANT',
    },
    {
      to: `/search?type=CATERER&area=${areaParam}`,
      label: 'Caterers',
      desc: 'Drop-off trays to on-site service',
      icon: UtensilsCrossed,
      tint: 'from-sage-50/90 to-white',
      iconBg: 'bg-sage-50 text-sage',
      active: vendorType === 'CATERER',
    },
    {
      to: `/search?type=CHEF&area=${areaParam}`,
      label: 'Private chefs',
      desc: 'Intimate dining and bespoke menus',
      icon: ChefHat,
      tint: 'from-plum-50/80 to-white',
      iconBg: 'bg-plum-50 text-plum',
      active: vendorType === 'CHEF',
    },
  ] as const;

  return (
    <footer className="mt-10 border-t border-line/80">
      {/* Pagination — stays readable, minimal chrome */}
      <div className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-center text-sm text-muted sm:text-left">
              {totalElements > 0 ? (
                <>
                  Showing{' '}
                  <span className="font-semibold tabular-nums text-ink">
                    {start.toLocaleString()}–{end.toLocaleString()}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold tabular-nums text-ink">
                    {totalElements.toLocaleString()}
                  </span>{' '}
                  {typeLabel} in{' '}
                  <span className="font-semibold text-ink">{areaLabel}</span>
                </>
              ) : (
                <>
                  No {typeLabel} match in <span className="font-semibold text-ink">{areaLabel}</span> yet
                </>
              )}
            </p>

            {totalPages > 1 ? (
              <nav
                className="inline-flex items-center gap-1 rounded-full border border-line/80 bg-white p-1 shadow-sm"
                aria-label="Pagination"
              >
                <PaginationBtn
                  disabled={currentPage <= 0}
                  onClick={() => onPageChange(0)}
                  aria-label="First page"
                >
                  <ChevronsLeft size={15} />
                </PaginationBtn>
                <PaginationBtn
                  disabled={currentPage <= 0}
                  onClick={() => onPageChange(currentPage - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={15} />
                </PaginationBtn>

                <div className="flex items-center gap-0.5 px-0.5">
                  {pages.map((p, i) =>
                    p === 'ellipsis' ? (
                      <span key={`e-${i}`} className="px-1.5 text-sm text-muted">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        aria-current={p === currentPage ? 'page' : undefined}
                        className={cn(
                          'grid h-8 min-w-[2rem] place-items-center rounded-full text-xs font-semibold tabular-nums transition-colors sm:text-sm',
                          p === currentPage
                            ? 'bg-gold text-ink shadow-sm'
                            : 'text-muted hover:bg-cream hover:text-ink',
                        )}
                      >
                        {p + 1}
                      </button>
                    ),
                  )}
                </div>

                <PaginationBtn
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => onPageChange(currentPage + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight size={15} />
                </PaginationBtn>
                <PaginationBtn
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => onPageChange(totalPages - 1)}
                  aria-label="Last page"
                >
                  <ChevronsRight size={15} />
                </PaginationBtn>
              </nav>
            ) : null}
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="border-y border-line/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line/50 bg-line/40 sm:grid-cols-4">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="bg-white px-4 py-4 text-center sm:py-5">
                <p className="font-display text-xl font-semibold text-ink sm:text-2xl">{s.value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted sm:text-[11px]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <section className="bg-cream/60 py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            eyebrow="Simple process"
            title="From browse to booked"
            description="Everything you need after picking a restaurant — without the back-and-forth."
          />
          <div className="relative grid gap-3 sm:grid-cols-3 sm:gap-4">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative">
                  {i < HOW_IT_WORKS.length - 1 ? (
                    <ArrowRight
                      size={18}
                      className="absolute -right-1 top-10 z-10 hidden text-gold/40 sm:block"
                      aria-hidden
                    />
                  ) : null}
                  <article className="h-full rounded-2xl border border-line/60 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-card">
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

      {/* Explore + event shortcuts */}
      <section className="border-t border-line/60 bg-white py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            eyebrow={`More in ${areaLabel}`}
            title="Keep exploring"
            description="Switch vendor type or jump straight to an event category."
          />

          <div className="grid gap-3 sm:grid-cols-3">
            {browseCards.map(({ to, label, desc, icon: Icon, tint, iconBg, active }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border p-5 transition-all duration-200',
                  'hover:-translate-y-0.5 hover:shadow-card',
                  active
                    ? 'border-gold/50 bg-gradient-to-br shadow-sm ring-1 ring-gold/20'
                    : 'border-line/70 bg-gradient-to-br hover:border-gold/35',
                  tint,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={cn('grid h-11 w-11 place-items-center rounded-xl', iconBg)}>
                    <Icon size={20} aria-hidden />
                  </span>
                  <ArrowRight
                    size={16}
                    className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gold-700"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-ink">{label}</h3>
                <p className="mt-1 text-sm text-muted">{desc}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {EVENT_LINKS.map(({ event, label, icon: Icon }) => (
              <Link
                key={event}
                to={`/search?area=${areaParam}&event=${event}${typeParam}`}
                className="inline-flex items-center gap-2 rounded-full border border-line/80 bg-cream/50 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-gold/40 hover:bg-gold-50/80 hover:text-gold-800"
              >
                <Icon size={15} className="text-gold-600" aria-hidden />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CaterAi CTA — ink panel like homepage vendor CTA */}
      <section className="relative overflow-hidden bg-ink py-10 md:py-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, #F2B705 0%, transparent 45%), radial-gradient(circle at 80% 70%, #5B2A4E 0%, transparent 40%)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,22rem)] lg:items-center lg:gap-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gold">
                <Sparkles size={13} aria-hidden />
                CaterAi
              </p>
              <h2 className="mt-4 font-display text-2xl font-semibold text-cream sm:text-3xl">
                Not sure which {vendorType === 'CHEF' ? 'chef' : 'restaurant'} fits?
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/75 sm:text-base">
                Send one request and let vetted partners compete for your event. Free, no commitment —
                replies in 24 hours.
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                <TrustPill icon={<ShieldCheck size={14} />} label="Vetted partners" />
                <TrustPill icon={<Clock size={14} />} label="24h response" />
                <TrustPill icon={<BadgeCheck size={14} />} label="Zero browse fee" />
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm">
              <div className="mb-4 flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <Quote size={18} className="shrink-0 text-gold/80" aria-hidden />
                <div>
                  <p className="text-sm leading-relaxed text-cream/90">
                    &ldquo;We posted once and had three quotes by the next morning. Saved us a week of
                    calls.&rdquo;
                  </p>
                  <p className="mt-2 text-xs font-medium text-cream/50">— Corporate host, Tashkent</p>
                </div>
              </div>
              <Link to="/#caterai" className="block">
                <Button
                  type="button"
                  variant="accent"
                  className="w-full px-6 py-3 text-sm font-semibold shadow-lift"
                >
                  Get free quotes
                </Button>
              </Link>
              <p className="mt-2.5 text-center text-[11px] text-cream/45">
                No credit card · Cancel anytime before booking
              </p>
            </div>
          </div>
        </div>
      </section>

      <CateringMenuSections />
    </footer>
  );
}

function TrustPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-cream/85 sm:text-sm">
      <span className="text-gold">{icon}</span>
      {label}
    </span>
  );
}

function PaginationBtn({
  children,
  disabled,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-full text-ink transition-colors hover:bg-cream disabled:opacity-30"
      {...props}
    >
      {children}
    </button>
  );
}

function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 1) return [];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const pages: (number | 'ellipsis')[] = [0];
  if (current > 2) pages.push('ellipsis');

  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 3) pages.push('ellipsis');
  pages.push(total - 1);

  return pages;
}

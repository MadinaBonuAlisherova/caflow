import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { useSolutions } from '@/hooks/useSolutions';
import { cn } from '@/lib/utils';

const FALLBACK_PARTNERS = [
  { name: 'Silk Road Kitchen', area: 'Tashkent', cuisine: 'Uzbek', rating: 4.9 },
  { name: 'Samarkand Feast', area: 'Tashkent', cuisine: 'Central Asian', rating: 4.8 },
  { name: 'Bazaar Bites', area: 'Tashkent', cuisine: 'Mediterranean', rating: 4.7 },
  { name: 'Chorsu Chef Co.', area: 'Tashkent', cuisine: 'Private chef', rating: 5.0 },
  { name: 'Registan Catering', area: 'Samarkand', cuisine: 'Event catering', rating: 4.9 },
  { name: 'Plov House', area: 'Tashkent', cuisine: 'Uzbek', rating: 4.8 },
  { name: 'Tashkent Table', area: 'Tashkent', cuisine: 'European', rating: 4.6 },
  { name: 'Nomad Kitchen', area: 'Tashkent', cuisine: 'Fusion', rating: 4.7 },
] as const;

function PartnerChip({
  name,
  area,
  cuisine,
  rating,
  className,
}: {
  name: string;
  area: string;
  cuisine: string;
  rating?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center gap-3 rounded-xl border border-gold/20 bg-white px-4 py-2.5 shadow-sm',
        className,
      )}
    >
      <div className="min-w-0 text-left">
        <p className="truncate text-sm font-semibold text-ink">{name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
          <MapPin size={10} className="shrink-0 text-gold-600" aria-hidden />
          <span className="truncate">{area}</span>
          <span aria-hidden>·</span>
          <span className="truncate">{cuisine}</span>
        </p>
      </div>
      {rating != null ? (
        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-bold text-gold-700">
          <Star size={10} className="fill-gold text-gold" aria-hidden />
          {rating.toFixed(1)}
        </span>
      ) : null}
    </div>
  );
}

/** ZeroCater-style scrolling partner strip */
export function PartnerMarquee() {
  const { data } = useSolutions({ area: 'Tashkent', size: 12, sort: 'rating', minRating: 4 });

  const fromApi =
    data?.content?.map((v) => ({
      name: v.name,
      area: v.serviceAreas?.[0] ?? 'Tashkent',
      cuisine: v.cuisines?.[0] ?? v.vendorType?.toLowerCase() ?? 'Catering',
      rating: v.rating,
    })) ?? [];

  const partners = fromApi.length >= 4 ? fromApi : [...FALLBACK_PARTNERS];
  const loop = [...partners, ...partners];

  return (
    <section className="border-b border-line/50 bg-white py-6 md:py-8" aria-label="Catering partners">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gold-600">Marketplace</p>
            <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">
              100+ restaurants, caterers &amp; chefs for any occasion
            </h2>
          </div>
          <Link
            to="/search?area=Tashkent"
            className="text-sm font-semibold text-gold-700 hover:text-gold-600 hover:underline"
          >
            See more partners
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent sm:w-20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent sm:w-20"
          aria-hidden
        />
        <div className="marquee-track flex w-max gap-3 px-4">
          {loop.map((p, i) => (
            <PartnerChip key={`${p.name}-${i}`} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}

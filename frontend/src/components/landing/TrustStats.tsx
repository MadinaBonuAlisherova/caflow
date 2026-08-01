import { cn } from '@/lib/utils';

export const TRUST_STATS = [
  { value: '24h', label: 'Avg. first offer' },
  { value: '100+', label: 'Vetted partners' },
  { value: '4.8★', label: 'Host rating' },
  { value: '0%', label: 'Browse fee' },
] as const;

export interface TrustStatsProps {
  className?: string;
}

/** Standalone trust strip — separate from the CaterAi intake card */
export function TrustStats({ className }: TrustStatsProps) {
  return (
    <div
      className={cn('mx-auto max-w-3xl px-4 pt-3 md:pt-4', className)}
      role="region"
      aria-label="Platform highlights"
    >
      <div className="overflow-hidden rounded-xl border border-gold/25 bg-gradient-to-r from-gold-50/80 via-white to-honey-50/70 shadow-warm ring-1 ring-gold/10">
        <div className="h-0.5 bg-gradient-to-r from-gold via-gold-400 to-apricot/80" aria-hidden />
        <div className="grid grid-cols-2 divide-x divide-gold/15 sm:grid-cols-4">
          {TRUST_STATS.map((s) => (
            <div key={s.label} className="px-3 py-3 text-center sm:py-3.5">
              <p className="font-display text-lg font-semibold tabular-nums text-gold-700 sm:text-xl">
                {s.value}
              </p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-widest text-muted sm:text-[10px]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import type { CateringSearchCriteria } from '@/lib/cateringSearch';
import { formatCriteriaSummary } from '@/lib/cateringSearch';

export function CriteriaPreview({
  criteria,
  provider,
  processingMs,
  fallbackUsed,
}: {
  criteria: CateringSearchCriteria;
  provider?: string;
  processingMs?: number;
  fallbackUsed?: boolean;
}) {
  const summary = formatCriteriaSummary(criteria);
  if (!summary.length) return null;

  return (
    <div className="border-b border-gold/25 bg-gold-50/50 px-3 py-2.5 sm:px-4">
      <p className="text-[11px] font-semibold text-gold-800">We understood:</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {summary.map((item) => (
          <span
            key={item}
            className="rounded-full border border-gold/30 bg-white px-2.5 py-0.5 text-[11px] font-medium text-ink"
          >
            {item}
          </span>
        ))}
      </div>
      {provider ? (
        <p className="mt-1.5 text-[10px] text-muted">
          Parsed by {provider}
          {processingMs != null ? ` · ${processingMs}ms` : ''}
          {fallbackUsed ? ' · fallback' : ''}
        </p>
      ) : null}
    </div>
  );
}

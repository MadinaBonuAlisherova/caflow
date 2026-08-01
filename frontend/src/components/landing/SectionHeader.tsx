import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = 'See all',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
      <div className="max-w-xl">
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gold-600">{eyebrow}</p>
        ) : null}
        <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {href ? (
        <Link
          to={href}
          className="inline-flex items-center gap-0.5 text-sm font-semibold text-gold-600 transition-colors hover:text-gold-700"
        >
          {linkLabel} <ChevronRight size={16} aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}

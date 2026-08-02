import { CalendarDays, MapPin, Navigation, PartyPopper, Search, Send, Users } from 'lucide-react';

const HINTS = ['Date & time', 'Headcount', 'Budget', 'Dietary needs'] as const;

const EVENT_TYPES = [
  { value: '', label: 'Event type' },
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'BIRTHDAY', label: 'Birthday' },
] as const;

const PROMPT_PLACEHOLDER =
  'Corporate lunch for 40 people in Yunusabad next Friday, delivery catering, halal options.';

/** UI showcase — intake box layout & styling (no API wiring in this public sample). */
export function CaterAiHub() {
  return (
    <section id="caterai" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-1 pt-2 md:pt-3">
      <div className="overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-white via-honey-50/35 to-gold-50/40 shadow-warm ring-1 ring-gold/15">
        <div className="h-1 bg-gradient-to-r from-gold-400 via-gold to-apricot/90" aria-hidden />

        <div className="flex items-stretch border-b border-gold/20 bg-gradient-to-r from-gold-50/70 via-honey-50/50 to-white">
          <label className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 sm:px-4">
            <MapPin size={16} className="shrink-0 text-gold-600" aria-hidden />
            <select className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink outline-none" defaultValue="Tashkent" aria-label="Delivery area">
              <option value="">Enter your delivery area</option>
              <option value="Tashkent">Tashkent</option>
              <option value="Samarkand">Samarkand</option>
            </select>
          </label>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 border-l border-gold/20 bg-gold-50/40 px-3 py-2.5 text-[11px] font-semibold text-gold-700 sm:text-xs"
          >
            <Navigation size={14} className="text-gold-600" aria-hidden />
            <span className="hidden sm:inline">Use my location</span>
            <span className="sm:hidden">Tashkent</span>
          </button>
        </div>

        <div className="grid grid-cols-3 divide-x divide-gold/15 border-b border-gold/20 bg-gradient-to-b from-white/90 to-gold-50/30">
          <HubCell label="Event date" icon={<CalendarDays size={12} className="text-gold-600" />}>
            <input type="date" className="hub-input w-full" defaultValue="2026-07-30" aria-label="Event date" />
          </HubCell>
          <HubCell label="Guests" icon={<Users size={12} className="text-gold-600" />}>
            <input type="number" className="hub-input w-full" defaultValue={60} aria-label="Guest count" />
          </HubCell>
          <HubCell label="Occasion" icon={<PartyPopper size={12} className="text-gold-600" />}>
            <select className="hub-input w-full" defaultValue="" aria-label="Event type">
              {EVENT_TYPES.map(({ value, label }) => (
                <option key={value || 'any'} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </HubCell>
        </div>

        <div className="border-b border-gold/15 bg-gradient-to-b from-gold-50/25 to-transparent px-3 py-2.5 sm:px-4">
          <div className="rounded-lg border border-gold/30 bg-gradient-to-br from-white via-honey-50/60 to-gold-50/50 px-3 py-2.5 shadow-sm ring-1 ring-gold/10">
            <textarea
              className="hub-prompt max-h-20 min-h-[2.75rem] w-full resize-none bg-transparent text-[13px] leading-snug text-ink focus:outline-none"
              rows={2}
              placeholder={PROMPT_PLACEHOLDER}
              aria-label="Describe your catering event"
            />
          </div>
        </div>

        <div className="bg-gradient-to-b from-gold-50/50 via-honey-50/40 to-gold-100/30 px-3 py-3 sm:px-4">
          <div className="mb-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-gold-700">Include:</span>
            {HINTS.map((label) => (
              <span
                key={label}
                className="inline-flex items-center rounded-full border border-gold/25 bg-white/80 px-2 py-0.5 text-[10px] font-medium text-gold-800 shadow-sm"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-lux-gold flex flex-1 items-center justify-center gap-2 border-0 py-2.5 text-sm sm:flex-[1.2]">
              <Send size={15} aria-hidden />
              Get offers
            </button>
            <button type="button" className="btn-lux-outline flex flex-1 items-center justify-center gap-2 bg-white/90 py-2.5 text-sm">
              <Search size={15} aria-hidden />
              Browse caterers
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] font-medium text-gold-700/80">Free · No commitment · Replies in 24h</p>
        </div>
      </div>
    </section>
  );
}

function HubCell({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="hub-cell flex min-w-0 flex-col gap-0.5 px-2 py-2 sm:px-3 sm:py-2.5">
      <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-gold-700 sm:text-[10px]">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

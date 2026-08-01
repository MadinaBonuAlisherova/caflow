import { addDays, format, parse, parseISO } from 'date-fns';
import type { CateringSearchCriteria } from '@/lib/cateringSearch';
import type { RequestCaptureValues } from '@/lib/requestCapture';
import { RFQ_EVENT_TYPES } from '@/lib/requestCapture';

export const CATER_AI_EXAMPLE_PROMPTS = [
  'Wedding dinner for 150 guests in Tashkent on July 29, Uzbek and European cuisine, budget 45,000 som per person.',
  'Corporate lunch for 40 people in Yunusabad next Friday, delivery catering, halal options.',
  'Birthday party for 30 guests in Mirzo Ulugbek — need buffet and cake table, around 500,000 som total.',
  'Team building lunch for 25 in Chilanzar, office delivery, Asian fusion menu.',
] as const;

const EVENT_KEYWORDS: Record<(typeof RFQ_EVENT_TYPES)[number], RegExp[]> = {
  WEDDING: [/\bwedding\b/i, /\bmarriage\b/i, /\bto['']?y\b/i],
  BIRTHDAY: [/\bbirthday\b/i, /\bb-day\b/i],
  CORPORATE: [/\bcorporate\b/i, /\bbusiness\b/i, /\bconference\b/i],
  OFFICE_MEALS: [/\boffice\b/i, /\blunch\b/i, /\bmeals?\b/i],
  TEAM_BUILDING: [/\bteam[\s-]?building\b/i, /\boffsite\b/i],
  CEREMONY: [/\bceremony\b/i, /\bcelebration\b/i],
};

const CUISINE_KEYWORDS: Record<string, RegExp> = {
  Uzbek: /\buzbek\b/i,
  Italian: /\bitalian\b/i,
  Chinese: /\bchinese\b/i,
  Indian: /\bindian\b/i,
  Japanese: /\bjapanese\b/i,
  BBQ: /\bbbq\b|\bbarbecue\b/i,
  'Asian Fusion': /\basian\b/i,
  European: /\beuropean\b/i,
  Halal: /\bhalal\b/i,
};

export interface CaterAiParseResult {
  values: Partial<RequestCaptureValues>;
  missing: Array<'eventDate' | 'guestCount' | 'location' | 'eventType' | 'contactName' | 'contactPhone' | 'contactEmail'>;
  browseQuery: { area?: string; event?: string; guests?: number; cuisine?: string };
}

function matchArea(text: string, areas: string[], fallback?: string): string | undefined {
  const lower = text.toLowerCase();
  for (const area of areas) {
    if (lower.includes(area.toLowerCase())) return area;
  }
  return fallback?.trim() || undefined;
}

function parseGuestCount(text: string): number | undefined {
  const patterns = [
    /(\d{1,4})\s*guests?/i,
    /for\s+(\d{1,4})\s*(?:people|persons|pax|guests?)/i,
    /(\d{1,4})\s*(?:people|persons|pax)\b/i,
    /headcount[:\s]+(\d{1,4})/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const n = Number(m[1]);
      if (n >= 1 && n <= 5000) return n;
    }
  }
  return undefined;
}

function parseEventType(text: string): (typeof RFQ_EVENT_TYPES)[number] | undefined {
  for (const type of RFQ_EVENT_TYPES) {
    if (EVENT_KEYWORDS[type].some((re) => re.test(text))) return type;
  }
  return undefined;
}

function parseDate(text: string): string | undefined {
  const iso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];

  const slash = text.match(/\b(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?\b/);
  if (slash) {
    const year = slash[3] ? (slash[3].length === 2 ? `20${slash[3]}` : slash[3]) : String(new Date().getFullYear());
    const raw = `${slash[1]}/${slash[2]}/${year}`;
    const formats = ['M/d/yyyy', 'd/M/yyyy', 'MM/dd/yyyy', 'dd/MM/yyyy'];
    for (const f of formats) {
      try {
        const d = parse(raw, f, new Date());
        if (!Number.isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
      } catch {
        /* try next */
      }
    }
  }

  if (/\btoday\b/i.test(text)) return format(new Date(), 'yyyy-MM-dd');
  if (/\btomorrow\b/i.test(text)) return format(addDays(new Date(), 1), 'yyyy-MM-dd');
  if (/\bnext week\b/i.test(text)) return format(addDays(new Date(), 7), 'yyyy-MM-dd');
  if (/\bnext friday\b/i.test(text)) {
    const d = addDays(new Date(), ((5 - new Date().getDay() + 7) % 7) || 7);
    return format(d, 'yyyy-MM-dd');
  }

  const monthNames =
    'january|february|march|april|may|june|july|jly|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec';
  const monthDay = text.match(new RegExp(`\\bon\\s+(${monthNames})\\s+(\\d{1,2})(?:\\s+(20\\d{2}))?`, 'i'));
  if (monthDay) {
    const monthLabel = monthDay[1]!.replace(/^jly$/i, 'july');
    try {
      const d = parse(`${monthDay[2]} ${monthLabel} ${monthDay[3] ?? new Date().getFullYear()}`, 'd MMMM yyyy', new Date());
      if (!Number.isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
    } catch {
      /* ignore */
    }
  }

  const monthMatch = text.match(new RegExp(`\\b(\\d{1,2})\\s+(${monthNames})(?:\\s+(20\\d{2}))?`, 'i'));
  if (monthMatch) {
    try {
      const d = parse(`${monthMatch[1]} ${monthMatch[2]} ${monthMatch[3] ?? new Date().getFullYear()}`, 'd MMMM yyyy', new Date());
      if (!Number.isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
    } catch {
      /* ignore */
    }
  }

  return undefined;
}

function parseBudgetSom(text: string, guestCount?: number): number | undefined {
  const perPerson = text.match(/(\d[\d\s,]*)\s*(?:som|uzs|uz\b).{0,20}(?:per\s*(?:person|guest|head)|\/\s*(?:person|guest|head))/i);
  if (perPerson) {
    const n = Number(perPerson[1].replace(/\s|,/g, ''));
    if (n > 0) return n;
  }

  const total = text.match(/(?:budget|total)[:\s]*(\d[\d\s,]*)\s*(?:som|uzs|uz\b)/i);
  if (total && guestCount && guestCount > 0) {
    const n = Number(total[1].replace(/\s|,/g, ''));
    if (n > 0) return Math.round(n / guestCount);
  }

  const dollar = text.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
  if (dollar) {
    const usd = Number(dollar[1].replace(/,/g, ''));
    if (usd > 0) return Math.round((usd * 12_500) / Math.max(guestCount ?? 1, 1));
  }

  return undefined;
}

function parseCuisines(text: string): string[] {
  const found = new Set<string>();
  for (const [label, re] of Object.entries(CUISINE_KEYWORDS)) {
    if (re.test(text)) found.add(label);
  }
  return [...found];
}

function parseFulfillment(text: string): RequestCaptureValues['fulfillmentType'] {
  if (/\bdine[\s-]?out\b|\bon[\s-]?site dining\b/i.test(text)) return 'DINEOUT';
  if (/\bdelivery\b|\bdeliver\b|\bcater(?:ing)? to\b/i.test(text)) return 'DELIVERY';
  if (/\bon[\s-]?site\b|\bat venue\b|\bvenue service\b/i.test(text)) return 'ONSITE';
  return 'DELIVERY';
}

export function parseCaterAiPrompt(
  prompt: string,
  options: { areas: string[]; location?: string; contact?: Partial<Pick<RequestCaptureValues, 'contactName' | 'contactPhone' | 'contactEmail'>> },
): CaterAiParseResult {
  const text = prompt.trim();
  const guestCount = parseGuestCount(text);
  const eventType = parseEventType(text) ?? (/\blunch\b/i.test(text) ? 'OFFICE_MEALS' : undefined);
  const eventDate = parseDate(text);
  const location = matchArea(text, options.areas, options.location);
  const cuisinePrefs = parseCuisines(text);
  const budgetPerPersonSom = parseBudgetSom(text, guestCount);
  const fulfillmentType = parseFulfillment(text);

  const notes = text.length > 20 ? text : undefined;

  const values: Partial<RequestCaptureValues> = {
    eventType,
    fulfillmentType,
    eventDate,
    guestCount,
    location,
    cuisinePrefs,
    budgetPerPersonSom,
    notes,
    contactName: options.contact?.contactName,
    contactPhone: options.contact?.contactPhone,
    contactEmail: options.contact?.contactEmail,
  };

  const missing: CaterAiParseResult['missing'] = [];
  if (!eventDate) missing.push('eventDate');
  if (!guestCount) missing.push('guestCount');
  if (!location) missing.push('location');
  if (!eventType) missing.push('eventType');
  if (!options.contact?.contactName) missing.push('contactName');
  if (!options.contact?.contactPhone) missing.push('contactPhone');
  if (!options.contact?.contactEmail) missing.push('contactEmail');

  return {
    values,
    missing,
    browseQuery: {
      area: location,
      event: eventType,
      guests: guestCount,
      cuisine: cuisinePrefs[0],
    },
  };
}

export function buildLocalCriteriaFromPrompt(
  prompt: string,
  options: {
    areas: string[];
    location?: string;
    manualEventDate?: string;
    manualGuests?: number | '';
  },
): CateringSearchCriteria {
  const local = parseCaterAiPrompt(prompt, {
    areas: options.areas,
    location: options.location,
  });
  return {
    eventType: local.values.eventType,
    location: local.values.location || options.location || undefined,
    eventDate: local.values.eventDate || options.manualEventDate || undefined,
    guestCount:
      local.values.guestCount ??
      (options.manualGuests === '' || options.manualGuests === undefined
        ? undefined
        : Number(options.manualGuests)),
    cuisines: local.values.cuisinePrefs,
    budgetAmount: local.values.budgetPerPersonSom,
    budgetType: 'PER_PERSON',
    fulfillmentType: local.values.fulfillmentType,
  };
}

export function buildBrowseSearchUrl(query: CaterAiParseResult['browseQuery'], vendorType?: 'RESTAURANT' | 'CATERER' | 'CHEF') {
  const params = new URLSearchParams();
  if (vendorType) params.set('type', vendorType);
  if (query.area) params.set('area', query.area);
  if (query.event) params.set('event', query.event);
  if (query.guests) params.set('guests', String(query.guests));
  if (query.cuisine) params.set('cuisine', query.cuisine);
  return `/search?${params.toString()}`;
}

/** Safe date check aligned with requestCapture schema. */
export function isFutureDateString(isoDate: string): boolean {
  try {
    const d = parseISO(isoDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  } catch {
    return false;
  }
}

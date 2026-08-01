import type { Vendor } from '@/types';

export type BudgetType = 'PER_PERSON' | 'TOTAL';

export interface CateringSearchCriteria {
  eventType?: string;
  vendorType?: string;
  location?: string;
  eventDate?: string;
  guestCount?: number;
  cuisines?: string[];
  budgetAmount?: number;
  budgetCurrency?: string;
  budgetType?: BudgetType;
  fulfillmentType?: string;
  dietaryRequirements?: string[];
  requiredServices?: string[];
  minRating?: number;
}

export interface VendorSearchMatch {
  vendor: Vendor;
  matchScore: number;
  locationScore: number;
}

export interface CateringSearchResponse {
  criteria: CateringSearchCriteria;
  vendors: VendorSearchMatch[];
  totalMatches: number;
  aiUsed: boolean;
}

export interface ParseCateringSearchResponse {
  criteria: CateringSearchCriteria;
  provider: string;
  processingMs: number;
  fallbackUsed: boolean;
}

export interface AiCateringSearchExecuteResponse {
  parse: ParseCateringSearchResponse;
  search: CateringSearchResponse;
}

export function buildSearchUrlFromCriteria(
  criteria: CateringSearchCriteria,
  vendorType?: string,
): string {
  const params = new URLSearchParams();
  const type = criteria.vendorType ?? vendorType;
  if (type) params.set('type', type);
  if (criteria.location) params.set('area', criteria.location);
  if (criteria.eventType) params.set('event', criteria.eventType);
  if (criteria.guestCount) params.set('guests', String(criteria.guestCount));
  if (criteria.cuisines?.[0]) params.set('cuisine', criteria.cuisines[0]);
  if (criteria.budgetAmount && criteria.budgetType === 'PER_PERSON') {
    params.set('maxPrice', String(criteria.budgetAmount));
  }
  if (criteria.minRating) params.set('minRating', String(criteria.minRating));
  return `/search?${params.toString()}`;
}

export function formatCriteriaSummary(c: CateringSearchCriteria): string[] {
  const lines: string[] = [];
  if (c.eventType) lines.push(c.eventType.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (x) => x.toUpperCase()));
  if (c.guestCount) lines.push(`${c.guestCount} guests`);
  if (c.location) lines.push(c.location);
  if (c.eventDate) lines.push(c.eventDate);
  if (c.cuisines?.length) lines.push(c.cuisines.join(' + '));
  if (c.budgetAmount) {
    const unit = c.budgetType === 'TOTAL' ? ' total' : '/person';
    lines.push(`${c.budgetAmount.toLocaleString()} ${c.budgetCurrency ?? 'UZS'}${unit}`);
  }
  if (c.fulfillmentType) lines.push(c.fulfillmentType.toLowerCase().replace(/_/g, ' '));
  return lines;
}

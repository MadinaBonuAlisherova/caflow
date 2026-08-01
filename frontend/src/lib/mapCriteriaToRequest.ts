import type { RequestCaptureValues, RFQ_EVENT_TYPES, RFQ_FULFILLMENT_TYPES } from '@/lib/requestCapture';
import type { CateringSearchCriteria } from '@/lib/cateringSearch';

export function mapCriteriaToRequestValues(
  criteria: CateringSearchCriteria,
  prompt: string,
  contact: { contactName: string; contactPhone: string; contactEmail: string },
): Partial<RequestCaptureValues> {
  const eventType = criteria.eventType as (typeof RFQ_EVENT_TYPES)[number] | undefined;
  const fulfillment = (criteria.fulfillmentType ?? 'DELIVERY') as (typeof RFQ_FULFILLMENT_TYPES)[number];

  let budgetPerPersonSom: number | undefined;
  if (criteria.budgetAmount) {
    if (criteria.budgetType === 'TOTAL' && criteria.guestCount && criteria.guestCount > 0) {
      budgetPerPersonSom = Math.round(criteria.budgetAmount / criteria.guestCount);
    } else {
      budgetPerPersonSom = criteria.budgetAmount;
    }
  }

  return {
    eventType,
    fulfillmentType: fulfillment,
    eventDate: criteria.eventDate,
    guestCount: criteria.guestCount,
    location: criteria.location,
    cuisinePrefs: criteria.cuisines ?? [],
    budgetPerPersonSom,
    notes: prompt.length > 20 ? prompt : undefined,
    contactName: contact.contactName,
    contactPhone: contact.contactPhone,
    contactEmail: contact.contactEmail,
  };
}

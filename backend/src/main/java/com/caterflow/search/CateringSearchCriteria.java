package com.caterflow.search;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Normalized catering search input — produced by structured forms or AI interpretation.
 * Unknown fields remain null; never invent values not supplied by the customer.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CateringSearchCriteria(
    String eventType,
    String vendorType,
    String location,
    LocalDate eventDate,
    Integer guestCount,
    List<String> cuisines,
    Integer budgetAmount,
    String budgetCurrency,
    BudgetType budgetType,
    String fulfillmentType,
    List<String> dietaryRequirements,
    List<String> requiredServices,
    BigDecimal minRating
) {
    public static CateringSearchCriteria empty() {
        return new CateringSearchCriteria(
            null, null, null, null, null, null, null, null, null, null, null, null, null);
    }
}

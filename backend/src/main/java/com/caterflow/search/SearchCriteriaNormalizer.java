package com.caterflow.search;

import com.caterflow.platform.MetaController;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Validates and normalizes {@link CateringSearchCriteria} before search.
 * Rejects or clears invalid enum values; never invents missing data.
 */
@Component
public class SearchCriteriaNormalizer {

    private static final Set<String> EVENT_TYPES = Set.of(
        "WEDDING", "BIRTHDAY", "CORPORATE", "OFFICE_MEALS", "TEAM_BUILDING", "CEREMONY");

    private static final Set<String> VENDOR_TYPES = Set.of("RESTAURANT", "CATERER", "CHEF");

    private static final Set<String> FULFILLMENT_TYPES = Set.of("DELIVERY", "ONSITE", "DINEOUT");

    private static final Set<String> KNOWN_CUISINES = Set.of(
        "Uzbek", "Italian", "Chinese", "Indian", "Japanese", "BBQ", "Asian Fusion",
        "European", "Halal", "Mediterranean", "American");

    public CateringSearchCriteria normalize(CateringSearchCriteria raw) {
        if (raw == null) return CateringSearchCriteria.empty();

        String eventType = normalizeEnum(raw.eventType(), EVENT_TYPES);
        String vendorType = normalizeEnum(raw.vendorType(), VENDOR_TYPES);
        String location = normalizeLocation(raw.location());
        String fulfillment = normalizeEnum(raw.fulfillmentType(), FULFILLMENT_TYPES);

        List<String> cuisines = normalizeCuisines(raw.cuisines());
        List<String> dietary = normalizeList(raw.dietaryRequirements());
        List<String> services = normalizeList(raw.requiredServices());

        BudgetType budgetType = raw.budgetType();
        Integer budgetAmount = raw.budgetAmount();
        if (budgetAmount != null && budgetAmount < 0) budgetAmount = null;

        BigDecimal minRating = raw.minRating();
        if (minRating != null && minRating.doubleValue() < 0) minRating = null;

        Integer guests = raw.guestCount();
        if (guests != null && guests < 1) guests = null;

        return new CateringSearchCriteria(
            eventType,
            vendorType,
            location,
            raw.eventDate(),
            guests,
            cuisines.isEmpty() ? null : cuisines,
            budgetAmount,
            blankToNull(raw.budgetCurrency()),
            budgetType,
            fulfillment,
            dietary.isEmpty() ? null : dietary,
            services.isEmpty() ? null : services,
            minRating);
    }

    private String normalizeEnum(String value, Set<String> allowed) {
        if (value == null || value.isBlank()) return null;
        String normalized = value.trim().toUpperCase(Locale.ROOT).replace(' ', '_');
        return allowed.contains(normalized) ? normalized : null;
    }

    private String normalizeLocation(String location) {
        if (location == null || location.isBlank()) return null;
        String trimmed = location.trim();
        for (String area : MetaController.SERVICE_AREAS) {
            if (area.equalsIgnoreCase(trimmed)) return area;
        }
        String lower = trimmed.toLowerCase(Locale.ROOT);
        for (String area : MetaController.SERVICE_AREAS) {
            if (area.toLowerCase(Locale.ROOT).equals(lower)) return area;
        }
        if (lower.contains("tashkent")) return "Tashkent";
        return trimmed;
    }

    private List<String> normalizeCuisines(List<String> cuisines) {
        if (cuisines == null || cuisines.isEmpty()) return List.of();
        return cuisines.stream()
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(this::matchKnownCuisine)
            .filter(Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());
    }

    private String matchKnownCuisine(String raw) {
        String lower = raw.toLowerCase(Locale.ROOT);
        for (String known : KNOWN_CUISINES) {
            if (known.toLowerCase(Locale.ROOT).equals(lower)) return known;
        }
        if (lower.contains("uzbek")) return "Uzbek";
        if (lower.contains("italian")) return "Italian";
        if (lower.contains("bbq") || lower.contains("barbecue")) return "BBQ";
        if (lower.contains("asian")) return "Asian Fusion";
        if (lower.contains("european")) return "European";
        if (lower.contains("halal")) return "Halal";
        return null;
    }

    private List<String> normalizeList(List<String> values) {
        if (values == null || values.isEmpty()) return List.of();
        return values.stream()
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .distinct()
            .collect(Collectors.toList());
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}

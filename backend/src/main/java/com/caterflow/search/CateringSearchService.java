package com.caterflow.search;

import com.caterflow.matching.VendorCatalogFilter;
import com.caterflow.matching.VendorFilterCriteria;
import com.caterflow.matching.VendorMatch;
import com.caterflow.search.dto.CateringSearchResponse;
import com.caterflow.search.dto.VendorSearchMatchResponse;
import com.caterflow.vendor.Vendor;
import com.caterflow.vendor.VendorCuisineRepository;
import com.caterflow.vendor.VendorDiscoveryMapper;
import com.caterflow.vendor.VendorServiceAreaRepository;
import com.caterflow.vendor.dto.VendorSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Unified catering search — NO LLM. Converts {@link CateringSearchCriteria}
 * into {@link VendorFilterCriteria} and delegates to {@link VendorCatalogFilter}.
 */
@Service
@RequiredArgsConstructor
public class CateringSearchService {

    private final SearchCriteriaNormalizer normalizer;
    private final VendorCatalogFilter catalogFilter;
    private final VendorDiscoveryMapper mapper;
    private final VendorCuisineRepository cuisineRepository;
    private final VendorServiceAreaRepository areaRepository;

    @Value("${app.search.max-results:10}")
    private int maxResults;

    @Transactional(readOnly = true)
    public CateringSearchResponse search(CateringSearchCriteria rawCriteria, boolean aiUsed) {
        CateringSearchCriteria criteria = normalizer.normalize(rawCriteria);

        if (criteria.location() == null || criteria.location().isBlank()) {
            return new CateringSearchResponse(criteria, List.of(), 0, aiUsed);
        }

        VendorFilterCriteria filter = toFilterCriteria(criteria);
        String[] cuisinePrefs = cuisineArray(criteria);

        List<VendorMatch> matches = catalogFilter.findEligible(filter, cuisinePrefs);
        int total = matches.size();
        List<VendorMatch> top = matches.stream().limit(maxResults).toList();

        List<VendorSearchMatchResponse> vendors = enrichSummaries(top);
        return new CateringSearchResponse(criteria, vendors, total, aiUsed);
    }

    private VendorFilterCriteria toFilterCriteria(CateringSearchCriteria c) {
        Integer maxPriceCents = resolveMaxPriceCents(c);
        BigDecimal minRating = c.minRating() != null
            ? c.minRating()
            : BigDecimal.valueOf(VendorCatalogFilter.DEFAULT_MIN_RATING);

        String singleCuisine = (c.cuisines() != null && c.cuisines().size() == 1)
            ? c.cuisines().getFirst()
            : null;

        return new VendorFilterCriteria(
            c.eventType(),
            c.location(),
            c.guestCount(),
            singleCuisine,
            minRating,
            maxPriceCents,
            c.vendorType());
    }

    private Integer resolveMaxPriceCents(CateringSearchCriteria c) {
        if (c.budgetAmount() == null || c.budgetAmount() <= 0) return null;
        int amountCents = c.budgetAmount() * 100;
        if (c.budgetType() == BudgetType.TOTAL && c.guestCount() != null && c.guestCount() > 0) {
            return amountCents / c.guestCount();
        }
        if (c.budgetType() == BudgetType.PER_PERSON || c.budgetType() == null) {
            return amountCents;
        }
        return amountCents;
    }

    private String[] cuisineArray(CateringSearchCriteria c) {
        if (c.cuisines() == null || c.cuisines().isEmpty()) return null;
        return c.cuisines().toArray(String[]::new);
    }

    private List<VendorSearchMatchResponse> enrichSummaries(List<VendorMatch> matches) {
        if (matches.isEmpty()) return List.of();

        List<Vendor> vendors = matches.stream().map(VendorMatch::vendor).toList();
        List<UUID> ids = vendors.stream().map(Vendor::getId).toList();

        Map<UUID, List<String>> cuisinesByVendor = cuisineRepository.findByIdVendorIdIn(ids).stream()
            .collect(Collectors.groupingBy(
                c -> c.getId().getVendorId(),
                Collectors.mapping(c -> c.getId().getCuisine(), Collectors.toList())));

        Map<UUID, List<String>> areasByVendor = areaRepository.findByIdVendorIdIn(ids).stream()
            .collect(Collectors.groupingBy(
                a -> a.getId().getVendorId(),
                Collectors.mapping(a -> a.getId().getArea(), Collectors.toList())));

        return matches.stream()
            .map(m -> {
                Vendor v = m.vendor();
                VendorSummaryResponse base = mapper.toSummary(v);
                VendorSummaryResponse enriched = new VendorSummaryResponse(
                    base.id(), base.slug(), base.name(), base.vendorType(), base.description(),
                    base.logoUrl(), base.rating(), base.reviewCount(), base.basePricePerPersonCents(),
                    base.minGuests(), base.maxGuests(),
                    cuisinesByVendor.getOrDefault(v.getId(), List.of()),
                    areasByVendor.getOrDefault(v.getId(), List.of()));
                return new VendorSearchMatchResponse(
                    enriched,
                    BigDecimal.valueOf(m.score()).setScale(2, RoundingMode.HALF_UP),
                    BigDecimal.valueOf(m.locationScore()).setScale(2, RoundingMode.HALF_UP));
            })
            .toList();
    }
}

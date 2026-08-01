package com.caterflow.vendor;

import com.caterflow.exception.ResourceNotFoundException;
import com.caterflow.matching.VendorCatalogFilter;
import com.caterflow.matching.VendorFilterCriteria;
import com.caterflow.matching.VendorMatch;
import com.caterflow.review.ReviewRepository;
import com.caterflow.vendor.dto.*;
import com.caterflow.vendor.enums.VendorStatus;
import com.caterflow.vendor.enums.VendorType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Flow B — location-first vendor discovery.
 * <p>
 * Browse without event filter uses DB-level {@link VendorRepository#searchPublicBrowse}
 * (pageable — safe at scale). Event-specific browse uses in-memory ranking via
 * {@link VendorCatalogFilter} (RFQ parity); switch to DB event filter when volume grows.
 */
@Service
@RequiredArgsConstructor
public class VendorDiscoveryService {

    private final VendorRepository vendorRepository;
    private final VendorCuisineRepository cuisineRepository;
    private final VendorServiceAreaRepository areaRepository;
    private final VendorGalleryRepository galleryRepository;
    private final VendorPackageRepository packageRepository;
    private final ReviewRepository reviewRepository;
    private final VendorDiscoveryMapper mapper;
    private final VendorMapper vendorMapper;
    private final VendorCatalogFilter catalogFilter;

    @Transactional(readOnly = true)
    public Page<VendorSummaryResponse> search(
            String eventType,
            String cuisine,
            String area,
            Integer guests,
            BigDecimal minRating,
            Integer maxPrice,
            String vendorType,
            String sort,
            Pageable pageable) {
        if (blankToNull(area) == null) {
            return Page.empty(pageable);
        }

        if (blankToNull(eventType) != null) {
            return searchWithEventFilter(eventType, cuisine, area, guests, minRating, maxPrice, vendorType, pageable);
        }

        return searchFromDatabase(cuisine, area, guests, minRating, maxPrice, vendorType, sort, pageable);
    }

    private Page<VendorSummaryResponse> searchFromDatabase(
            String cuisine,
            String area,
            Integer guests,
            BigDecimal minRating,
            Integer maxPrice,
            String vendorType,
            String sort,
            Pageable pageable) {
        VendorType type = parseVendorType(vendorType);
        BigDecimal ratingFloor = minRating == null
            ? BigDecimal.valueOf(VendorCatalogFilter.DEFAULT_MIN_RATING)
            : minRating;

        Sort order = "price".equalsIgnoreCase(sort)
            ? Sort.by(Sort.Order.asc("basePricePerPersonCents").nullsLast(), Sort.Order.desc("rating"))
            : Sort.by(Sort.Direction.DESC, "rating");

        Pageable ordered = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), order);

        Page<Vendor> vendorPage = vendorRepository.searchPublicBrowse(
            VendorStatus.APPROVED,
            type,
            guests,
            blankToNull(cuisine),
            area.trim(),
            ratingFloor,
            maxPrice,
            ordered);

        return mapVendorPage(vendorPage);
    }

    private Page<VendorSummaryResponse> searchWithEventFilter(
            String eventType,
            String cuisine,
            String area,
            Integer guests,
            BigDecimal minRating,
            Integer maxPrice,
            String vendorType,
            Pageable pageable) {
        VendorFilterCriteria criteria = new VendorFilterCriteria(
            eventType.trim(),
            area.trim(),
            guests,
            blankToNull(cuisine),
            minRating == null ? BigDecimal.valueOf(VendorCatalogFilter.DEFAULT_MIN_RATING) : minRating,
            maxPrice,
            blankToNull(vendorType));

        List<VendorMatch> matches = catalogFilter.findEligible(criteria);
        int total = matches.size();
        int start = (int) pageable.getOffset();
        if (start >= total) {
            return new PageImpl<>(List.of(), pageable, total);
        }
        int end = Math.min(start + pageable.getPageSize(), total);
        List<Vendor> pageVendors = matches.subList(start, end).stream()
            .map(VendorMatch::vendor)
            .toList();

        return new PageImpl<>(mapVendors(pageVendors), pageable, total);
    }

    private Page<VendorSummaryResponse> mapVendorPage(Page<Vendor> vendorPage) {
        List<VendorSummaryResponse> content = mapVendors(vendorPage.getContent());
        return new PageImpl<>(content, vendorPage.getPageable(), vendorPage.getTotalElements());
    }

    private List<VendorSummaryResponse> mapVendors(List<Vendor> pageVendors) {
        List<UUID> vendorIds = pageVendors.stream().map(Vendor::getId).toList();
        Map<UUID, List<String>> cuisinesByVendor = groupCuisines(vendorIds);
        Map<UUID, List<String>> areasByVendor = groupAreas(vendorIds);

        return pageVendors.stream()
            .map(v -> {
                VendorSummaryResponse base = mapper.toSummary(v);
                return new VendorSummaryResponse(
                    base.id(), base.slug(), base.name(), base.vendorType(), base.description(),
                    base.logoUrl(), base.rating(), base.reviewCount(), base.basePricePerPersonCents(),
                    base.minGuests(), base.maxGuests(),
                    cuisinesByVendor.getOrDefault(v.getId(), List.of()),
                    areasByVendor.getOrDefault(v.getId(), List.of()));
            })
            .toList();
    }

    @Transactional(readOnly = true)
    public VendorPublicResponse getBySlug(String slug) {
        Vendor vendor = vendorRepository.findBySlugAndStatus(slug, VendorStatus.APPROVED)
            .orElseThrow(() -> new ResourceNotFoundException("Vendor", slug));

        UUID id = vendor.getId();
        VendorPublicResponse base = mapper.toPublicProfile(vendor);
        List<String> areas = areaRepository.findByIdVendorId(id).stream()
            .map(a -> a.getId().getArea()).toList();
        List<String> cuisines = cuisineRepository.findByIdVendorId(id).stream()
            .map(c -> c.getId().getCuisine()).toList();
        List<String> gallery = galleryRepository.findByVendor_IdOrderBySortOrderAsc(id).stream()
            .map(VendorGallery::getImageUrl).toList();
        List<PackageResponse> packages = packageRepository.findByVendor_IdAndActiveTrueOrderBySortOrderAsc(id).stream()
            .map(vendorMapper::toPackageResponse).toList();
        List<PublicReviewResponse> reviews = reviewRepository.findByVendor_IdOrderByCreatedAtDesc(id).stream()
            .map(mapper::toReviewResponse).toList();

        return new VendorPublicResponse(
            base.id(), base.slug(), base.name(), base.vendorType(), base.description(),
            base.logoUrl(), base.coverUrl(), base.rating(), base.reviewCount(), base.minGuests(), base.maxGuests(),
            base.basePricePerPersonCents(), areas, cuisines, gallery, packages, reviews);
    }

    private Map<UUID, List<String>> groupCuisines(List<UUID> vendorIds) {
        if (vendorIds.isEmpty()) return Map.of();
        return cuisineRepository.findByIdVendorIdIn(vendorIds).stream()
            .collect(Collectors.groupingBy(
                c -> c.getId().getVendorId(),
                Collectors.mapping(c -> c.getId().getCuisine(), Collectors.toList())));
    }

    private Map<UUID, List<String>> groupAreas(List<UUID> vendorIds) {
        if (vendorIds.isEmpty()) return Map.of();
        return areaRepository.findByIdVendorIdIn(vendorIds).stream()
            .collect(Collectors.groupingBy(
                a -> a.getId().getVendorId(),
                Collectors.mapping(a -> a.getId().getArea(), Collectors.toList())));
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private VendorType parseVendorType(String vendorType) {
        String normalized = blankToNull(vendorType);
        if (normalized == null) {
            return null;
        }
        try {
            return VendorType.valueOf(normalized.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}

package com.caterflow.vendor;

import com.caterflow.vendor.dto.VendorPublicResponse;
import com.caterflow.vendor.dto.VendorSummaryResponse;
import com.caterflow.review.ReviewService;
import com.caterflow.vendor.dto.PublicReviewResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class PublicVendorController {

    private final VendorDiscoveryService discoveryService;
    private final ReviewService reviewService;

    @GetMapping
    public Page<VendorSummaryResponse> search(
            @RequestParam(required = false) String event,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String cuisine,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) String vendorType,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        String resolvedEvent = firstNonBlank(eventType, event);
        String resolvedType = firstNonBlank(vendorType, type);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Pageable pageable = PageRequest.of(Math.max(page, 0), safeSize);
        return discoveryService.search(
            resolvedEvent, cuisine, area, guests, minRating, maxPrice, resolvedType, sort, pageable);
    }

    @GetMapping("/{slug}")
    public VendorPublicResponse getBySlug(@PathVariable String slug) {
        return discoveryService.getBySlug(slug);
    }

    @GetMapping("/{slug}/reviews")
    public List<PublicReviewResponse> listReviews(@PathVariable String slug) {
        return reviewService.listByVendorSlug(slug);
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }
}

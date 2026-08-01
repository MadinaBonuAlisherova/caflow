package com.caterflow.vendor;

import com.caterflow.vendor.enums.VendorStatus;
import com.caterflow.vendor.enums.VendorType;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.*;

public interface VendorRepository extends JpaRepository<Vendor, UUID> {
    Optional<Vendor> findBySlug(String slug);
    Optional<Vendor> findByOwnerId(UUID ownerId);

    @Query("SELECT v FROM Vendor v JOIN FETCH v.owner WHERE v.id = :id")
    Optional<Vendor> findByIdWithOwner(@Param("id") UUID id);

    Page<Vendor> findByStatus(VendorStatus status, Pageable pageable);

    Optional<Vendor> findBySlugAndStatus(String slug, VendorStatus status);

    @Query("""
        SELECT v FROM Vendor v
        WHERE v.status = :status
        AND (:vendorType IS NULL OR v.vendorType = :vendorType)
        AND (:guests IS NULL OR (v.minGuests <= :guests AND v.maxGuests >= :guests))
        AND (:cuisine IS NULL OR EXISTS (
            SELECT 1 FROM VendorCuisine vc
            WHERE vc.vendor = v AND LOWER(vc.id.cuisine) = LOWER(:cuisine)))
        AND (:area IS NULL OR EXISTS (
            SELECT 1 FROM VendorServiceArea va
            WHERE va.vendor = v AND LOWER(va.id.area) = LOWER(:area)))
        AND (:minRating IS NULL OR v.rating >= :minRating)
        AND (:maxPrice IS NULL OR v.basePricePerPersonCents <= :maxPrice)
        """)
    Page<Vendor> searchPublicBrowse(
        @Param("status") VendorStatus status,
        @Param("vendorType") VendorType vendorType,
        @Param("guests") Integer guests,
        @Param("cuisine") String cuisine,
        @Param("area") String area,
        @Param("minRating") BigDecimal minRating,
        @Param("maxPrice") Integer maxPrice,
        Pageable pageable);

    @Query("""
        SELECT v FROM Vendor v
        WHERE v.status = :status
        AND (:cuisine IS NULL OR EXISTS (
            SELECT 1 FROM VendorCuisine vc
            WHERE vc.vendor = v AND LOWER(vc.id.cuisine) = :cuisine))
        AND (:area IS NULL OR EXISTS (
            SELECT 1 FROM VendorServiceArea va
            WHERE va.vendor = v AND LOWER(va.id.area) = :area))
        AND (:minRating IS NULL OR v.rating >= :minRating)
        AND (:maxPrice IS NULL OR v.basePricePerPersonCents <= :maxPrice)
        """)
    Page<Vendor> searchPublic(
        @Param("status") VendorStatus status,
        @Param("cuisine") String cuisine,
        @Param("area") String area,
        @Param("minRating") BigDecimal minRating,
        @Param("maxPrice") Integer maxPrice,
        Pageable pageable);
}

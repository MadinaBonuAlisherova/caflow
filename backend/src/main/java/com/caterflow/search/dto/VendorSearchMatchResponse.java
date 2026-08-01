package com.caterflow.search.dto;

import com.caterflow.vendor.dto.VendorSummaryResponse;

import java.math.BigDecimal;

public record VendorSearchMatchResponse(
    VendorSummaryResponse vendor,
    BigDecimal matchScore,
    BigDecimal locationScore
) {}

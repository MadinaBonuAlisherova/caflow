package com.caterflow.search.dto;

import com.caterflow.search.CateringSearchCriteria;

import java.util.List;

public record CateringSearchResponse(
    CateringSearchCriteria criteria,
    List<VendorSearchMatchResponse> vendors,
    int totalMatches,
    boolean aiUsed
) {}

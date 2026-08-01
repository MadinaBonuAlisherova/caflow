package com.caterflow.ai.dto;

import com.caterflow.search.CateringSearchCriteria;

public record ParseCateringSearchResponse(
    CateringSearchCriteria criteria,
    String provider,
    long processingMs,
    boolean fallbackUsed
) {}

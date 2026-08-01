package com.caterflow.ai.dto;

import com.caterflow.search.dto.CateringSearchResponse;

public record AiCateringSearchExecuteResponse(
    ParseCateringSearchResponse parse,
    CateringSearchResponse search
) {}

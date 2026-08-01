package com.caterflow.ai.dto;

import com.caterflow.search.CateringSearchCriteria;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ParseCateringSearchRequest(
    @NotBlank @Size(max = 4000) String text,
    String locationHint
) {}

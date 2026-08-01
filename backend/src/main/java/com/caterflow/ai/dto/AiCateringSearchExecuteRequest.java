package com.caterflow.ai.dto;

import com.caterflow.search.dto.CateringSearchResponse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiCateringSearchExecuteRequest(
    @NotBlank @Size(max = 4000) String text,
    String locationHint,
    String vendorType
) {}

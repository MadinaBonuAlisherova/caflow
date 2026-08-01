package com.caterflow.media.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record MediaAssetResponse(
    UUID id,
    String ownerType,
    UUID ownerId,
    String objectKey,
    String contentType,
    Long sizeBytes,
    String purpose,
    UUID createdBy,
    LocalDateTime createdAt,
    String publicUrl
) {}

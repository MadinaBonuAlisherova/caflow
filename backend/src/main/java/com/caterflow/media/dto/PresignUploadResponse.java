package com.caterflow.media.dto;

public record PresignUploadResponse(
    String uploadUrl,
    String objectKey,
    String publicUrl
) {}

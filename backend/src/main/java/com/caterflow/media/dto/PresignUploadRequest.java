package com.caterflow.media.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record PresignUploadRequest(
    @NotBlank @Size(max = 32) String ownerType,
    @NotNull UUID ownerId,
    @NotBlank @Size(max = 32) String purpose,
    @NotBlank @Size(max = 255) String filename,
    @NotBlank @Size(max = 128) String contentType
) {}

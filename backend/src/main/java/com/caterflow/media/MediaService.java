package com.caterflow.media;

import com.caterflow.exception.BadRequestException;
import com.caterflow.exception.ForbiddenException;
import com.caterflow.exception.ResourceNotFoundException;
import com.caterflow.media.dto.ConfirmUploadRequest;
import com.caterflow.media.dto.MediaAssetResponse;
import com.caterflow.media.dto.PresignUploadRequest;
import com.caterflow.media.dto.PresignUploadResponse;
import com.caterflow.request.EventRequest;
import com.caterflow.request.EventRequestRepository;
import com.caterflow.security.PermissionCodes;
import com.caterflow.security.PermissionService;
import com.caterflow.user.User;
import com.caterflow.user.UserRepository;
import com.caterflow.vendor.Vendor;
import com.caterflow.vendor.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.time.Duration;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {

    private static final Duration PRESIGN_TTL = Duration.ofMinutes(5);
    private static final long MAX_UPLOAD_BYTES = 10L * 1024 * 1024;

    private final MediaR2Properties r2;
    private final MediaAssetRepository mediaAssetRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final EventRequestRepository eventRequestRepository;
    private final PermissionService permissionService;

    public PresignUploadResponse presignUpload(String actorEmail, PresignUploadRequest req) {
        requireR2Configured();
        User actor = requireUser(actorEmail);
        String ownerType = normalizeOwnerType(req.ownerType());
        MediaPurpose purpose = parsePurpose(req.purpose());
        assertCanUpload(actor, ownerType, req.ownerId());

        String safeName = sanitizeFilename(req.filename());
        String objectKey = buildObjectKey(ownerType, req.ownerId(), purpose, safeName);

        String uploadUrl = presignPut(objectKey, req.contentType().trim());
        return new PresignUploadResponse(uploadUrl, objectKey, publicUrlFor(objectKey));
    }

    /**
     * Server-side upload — avoids browser CORS to R2 (presigned PUT requires bucket CORS rules).
     */
    @Transactional
    public MediaAssetResponse uploadDirect(
            String actorEmail,
            MultipartFile file,
            String ownerType,
            UUID ownerId,
            String purpose) {
        requireR2Configured();
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }
        if (file.getSize() > MAX_UPLOAD_BYTES) {
            throw new BadRequestException("File exceeds 10MB limit");
        }

        User actor = requireUser(actorEmail);
        String normalizedOwnerType = normalizeOwnerType(ownerType);
        MediaPurpose mediaPurpose = parsePurpose(purpose);
        assertCanUpload(actor, normalizedOwnerType, ownerId);

        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        String safeName = sanitizeFilename(file.getOriginalFilename());
        String objectKey = buildObjectKey(normalizedOwnerType, ownerId, mediaPurpose, safeName);

        try (InputStream inputStream = file.getInputStream()) {
            putObject(objectKey, inputStream, file.getSize(), contentType);
        } catch (IOException e) {
            throw new BadRequestException("Could not read uploaded file");
        }

        MediaAsset saved = mediaAssetRepository.save(MediaAsset.builder()
            .ownerType(normalizedOwnerType)
            .ownerId(ownerId)
            .objectKey(objectKey)
            .contentType(contentType.trim())
            .sizeBytes(file.getSize())
            .purpose(mediaPurpose)
            .createdBy(actor.getId())
            .build());

        return toResponse(saved);
    }

    @Transactional
    public MediaAssetResponse confirmUpload(String actorEmail, ConfirmUploadRequest req) {
        User actor = requireUser(actorEmail);
        String ownerType = normalizeOwnerType(req.ownerType());
        MediaPurpose purpose = parsePurpose(req.purpose());
        assertCanUpload(actor, ownerType, req.ownerId());

        String objectKey = req.objectKey().trim();
        if (!objectKey.startsWith(ownerType.toLowerCase(Locale.ROOT) + "/" + req.ownerId() + "/")) {
            throw new BadRequestException("objectKey does not match ownerType/ownerId");
        }
        if (mediaAssetRepository.findByObjectKey(objectKey).isPresent()) {
            throw new BadRequestException("This upload was already confirmed");
        }

        MediaAsset saved = mediaAssetRepository.save(MediaAsset.builder()
            .ownerType(ownerType)
            .ownerId(req.ownerId())
            .objectKey(objectKey)
            .contentType(req.contentType().trim())
            .sizeBytes(req.sizeBytes())
            .purpose(purpose)
            .createdBy(actor.getId())
            .build());

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public MediaAsset requireOwnedAsset(UUID mediaAssetId, String expectedOwnerType, UUID expectedOwnerId) {
        MediaAsset asset = mediaAssetRepository.findById(mediaAssetId)
            .orElseThrow(() -> new ResourceNotFoundException("MediaAsset", mediaAssetId.toString()));
        if (!expectedOwnerType.equalsIgnoreCase(asset.getOwnerType())
            || !expectedOwnerId.equals(asset.getOwnerId())) {
            throw new ForbiddenException("Media asset does not belong to this resource");
        }
        return asset;
    }

    public String publicUrlFor(String objectKey) {
        String base = r2.publicBaseUrl() == null ? "" : r2.publicBaseUrl().replaceAll("/$", "");
        if (base.isBlank()) {
            return r2.normalizedEndpoint() + "/" + r2.bucket() + "/" + objectKey;
        }
        return base + "/" + objectKey;
    }

    public MediaAssetResponse toResponse(MediaAsset asset) {
        return new MediaAssetResponse(
            asset.getId(),
            asset.getOwnerType(),
            asset.getOwnerId(),
            asset.getObjectKey(),
            asset.getContentType(),
            asset.getSizeBytes(),
            asset.getPurpose() == null ? null : asset.getPurpose().name(),
            asset.getCreatedBy(),
            asset.getCreatedAt(),
            publicUrlFor(asset.getObjectKey())
        );
    }

    private String presignPut(String objectKey, String contentType) {
        try (S3Presigner presigner = buildPresigner()) {
            PutObjectRequest objectRequest = PutObjectRequest.builder()
                .bucket(r2.bucket())
                .key(objectKey)
                .contentType(contentType)
                .build();
            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(PRESIGN_TTL)
                .putObjectRequest(objectRequest)
                .build();
            PresignedPutObjectRequest signed = presigner.presignPutObject(presignRequest);
            return signed.url().toString();
        }
    }

    private void putObject(String objectKey, InputStream inputStream, long sizeBytes, String contentType) {
        try (S3Client client = buildS3Client()) {
            client.putObject(
                PutObjectRequest.builder()
                    .bucket(r2.bucket())
                    .key(objectKey)
                    .contentType(contentType)
                    .build(),
                RequestBody.fromInputStream(inputStream, sizeBytes));
        }
    }

    private static String buildObjectKey(String ownerType, UUID ownerId, MediaPurpose purpose, String safeName) {
        return "%s/%s/%s/%s-%s".formatted(
            ownerType.toLowerCase(Locale.ROOT),
            ownerId,
            purpose.name().toLowerCase(Locale.ROOT),
            UUID.randomUUID(),
            safeName
        );
    }

    private S3Presigner buildPresigner() {
        return S3Presigner.builder()
            .endpointOverride(URI.create(r2.normalizedEndpoint()))
            .credentialsProvider(credentialsProvider())
            .region(Region.of("auto"))
            .serviceConfiguration(s3Configuration())
            .build();
    }

    private S3Client buildS3Client() {
        return S3Client.builder()
            .endpointOverride(URI.create(r2.normalizedEndpoint()))
            .credentialsProvider(credentialsProvider())
            .region(Region.of("auto"))
            .serviceConfiguration(s3Configuration())
            .build();
    }

    private StaticCredentialsProvider credentialsProvider() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(r2.accessKey(), r2.secretKey());
        return StaticCredentialsProvider.create(credentials);
    }

    private static S3Configuration s3Configuration() {
        return S3Configuration.builder()
            .pathStyleAccessEnabled(true)
            .build();
    }

    /**
     * Owner OR holder of {@link PermissionCodes#MEDIA_UPLOAD_ANY} may upload.
     * ownerId is always required and must exist — admin-on-behalf still binds the asset to a real vendor.
     * created_by is set to the acting user (audit trail).
     */
    private void assertCanUpload(User actor, String ownerType, UUID ownerId) {
        requireOwnerExists(ownerType, ownerId);
        if (permissionService.hasPermission(actor, PermissionCodes.MEDIA_UPLOAD_ANY)) {
            return;
        }
        switch (ownerType) {
            case "VENDOR" -> {
                Vendor vendor = vendorRepository.findByIdWithOwner(ownerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vendor", ownerId.toString()));
                if (vendor.getOwner() == null || !vendor.getOwner().getId().equals(actor.getId())) {
                    throw new ForbiddenException("You can only upload media for your own vendor profile");
                }
            }
            case "USER" -> {
                if (!actor.getId().equals(ownerId)) {
                    throw new ForbiddenException("You can only upload media for your own user");
                }
            }
            case "REQUEST" -> {
                EventRequest request = eventRequestRepository.findByIdWithCustomer(ownerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Request", ownerId.toString()));
                if (request.getCustomer() == null || !request.getCustomer().getId().equals(actor.getId())) {
                    throw new ForbiddenException("You can only upload media for your own request");
                }
            }
            default -> throw new BadRequestException("Unsupported ownerType: " + ownerType);
        }
    }

    private void requireOwnerExists(String ownerType, UUID ownerId) {
        switch (ownerType) {
            case "VENDOR" -> vendorRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", ownerId.toString()));
            case "USER" -> userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", ownerId.toString()));
            case "REQUEST" -> eventRequestRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Request", ownerId.toString()));
            default -> throw new BadRequestException("Unsupported ownerType: " + ownerType);
        }
    }

    private void requireR2Configured() {
        if (!r2.isConfigured()) {
            throw new BadRequestException(
                "Media uploads are not configured. Set R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY, and R2_BUCKET.");
        }
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
            .orElseThrow(() -> new ResourceNotFoundException("User", email));
    }

    private static String normalizeOwnerType(String ownerType) {
        String value = ownerType == null ? "" : ownerType.trim().toUpperCase(Locale.ROOT);
        if (!SetOfOwnerTypes.ALLOWED.contains(value)) {
            throw new BadRequestException("ownerType must be one of " + SetOfOwnerTypes.ALLOWED);
        }
        return value;
    }

    private static MediaPurpose parsePurpose(String purpose) {
        try {
            return MediaPurpose.from(purpose);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(
                "purpose must be a known MediaPurpose (e.g. PROFILE_LOGO, GALLERY, OFFER_TEMPLATE)");
        }
    }

    private static String sanitizeFilename(String filename) {
        String base = filename.replace('\\', '/');
        int slash = base.lastIndexOf('/');
        if (slash >= 0) {
            base = base.substring(slash + 1);
        }
        String cleaned = base.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (cleaned.isBlank()) {
            return "file";
        }
        return cleaned.length() > 180 ? cleaned.substring(cleaned.length() - 180) : cleaned;
    }

    private static final class SetOfOwnerTypes {
        static final java.util.Set<String> ALLOWED = java.util.Set.of("VENDOR", "REQUEST", "USER");
    }
}

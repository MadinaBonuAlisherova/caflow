package com.caterflow.media;

import com.caterflow.media.dto.ConfirmUploadRequest;
import com.caterflow.media.dto.MediaAssetResponse;
import com.caterflow.media.dto.PresignUploadRequest;
import com.caterflow.media.dto.PresignUploadResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/presign-upload")
    public ResponseEntity<PresignUploadResponse> presignUpload(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody PresignUploadRequest req) {
        return ResponseEntity.ok(mediaService.presignUpload(user.getUsername(), req));
    }

    @PostMapping("/confirm-upload")
    public ResponseEntity<MediaAssetResponse> confirmUpload(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody ConfirmUploadRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(mediaService.confirmUpload(user.getUsername(), req));
    }

    /** Browser uploads through API — no R2 bucket CORS required on the client. */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MediaAssetResponse> upload(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam("file") MultipartFile file,
            @RequestParam("ownerType") String ownerType,
            @RequestParam("ownerId") UUID ownerId,
            @RequestParam("purpose") String purpose) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(mediaService.uploadDirect(user.getUsername(), file, ownerType, ownerId, purpose));
    }
}

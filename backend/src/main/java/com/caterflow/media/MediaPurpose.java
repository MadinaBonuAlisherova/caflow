package com.caterflow.media;

/**
 * Canonical media purposes for R2 uploads (media_assets.purpose).
 * Legacy aliases (LOGO, COVER, VIDEO) normalize via {@link #from(String)}.
 */
public enum MediaPurpose {
    PROFILE_LOGO,
    PROFILE_COVER,
    GALLERY,
    INTRO_VIDEO,
    MENU_FILE,
    SERVICE_BROCHURE,
    DOCUMENT,
    OFFER_TEMPLATE,
    REQUEST_ATTACHMENT,
    /** Primary image on a vendor package / menu item (ezCater-style). */
    PACKAGE_IMAGE,
    DROPOFF_PHOTO;

    public static MediaPurpose from(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("purpose is required");
        }
        String key = raw.trim().toUpperCase().replace('-', '_');
        return switch (key) {
            case "LOGO" -> PROFILE_LOGO;
            case "COVER" -> PROFILE_COVER;
            case "VIDEO" -> INTRO_VIDEO;
            default -> MediaPurpose.valueOf(key);
        };
    }

    public boolean isOneOf(MediaPurpose... allowed) {
        for (MediaPurpose p : allowed) {
            if (this == p) return true;
        }
        return false;
    }
}

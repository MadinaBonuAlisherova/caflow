package com.caterflow.media;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "media.r2")
public record MediaR2Properties(
    String endpoint,
    String accessKey,
    String secretKey,
    String bucket,
    String publicBaseUrl
) {
    public boolean isConfigured() {
        return endpoint != null && !endpoint.isBlank()
            && accessKey != null && !accessKey.isBlank()
            && secretKey != null && !secretKey.isBlank()
            && bucket != null && !bucket.isBlank();
    }

    /**
     * Cloudflare R2 S3 API host only. Strips a mistaken {@code /bucket} suffix
     * (common misconfig) so path-style requests do not double the bucket name.
     */
    public String normalizedEndpoint() {
        if (endpoint == null || endpoint.isBlank()) {
            return "";
        }
        String ep = endpoint.trim().replaceAll("/$", "");
        String b = bucket == null ? "" : bucket.trim();
        if (!b.isBlank() && ep.endsWith("/" + b)) {
            ep = ep.substring(0, ep.length() - b.length() - 1);
        }
        return ep;
    }
}

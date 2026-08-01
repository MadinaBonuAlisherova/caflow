package com.caterflow.ai;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_search_audits")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiSearchAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "original_text", nullable = false, columnDefinition = "text")
    private String originalText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "normalized_json", columnDefinition = "jsonb")
    private String normalizedJson;

    @Column(nullable = false, length = 32)
    private String provider;

    @Column(length = 64)
    private String model;

    @Column(nullable = false)
    private boolean success;

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "processing_ms")
    private Integer processingMs;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}

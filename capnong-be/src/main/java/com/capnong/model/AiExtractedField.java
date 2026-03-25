package com.capnong.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_extracted_fields")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiExtractedField {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "voice_input_id", nullable = false)
    private UUID voiceInputId;

    @Column(name = "extracted_name")
    private String extractedName;

    @Column(name = "extracted_description", columnDefinition = "TEXT")
    private String extractedDescription;

    @Column(name = "extracted_category", length = 50)
    private String extractedCategory;

    @Column(name = "extracted_price", precision = 15, scale = 2)
    private BigDecimal extractedPrice;

    @Column(name = "extracted_quantity", precision = 12, scale = 3)
    private BigDecimal extractedQuantity;

    @Column(name = "extracted_unit_code", length = 10)
    private String extractedUnitCode;

    @Column(name = "raw_unit_text", length = 50)
    private String rawUnitText;

    @Column(name = "extracted_harvest_note", columnDefinition = "TEXT")
    private String extractedHarvestNote;

    @Column(name = "confidence_name", precision = 4, scale = 3)
    private BigDecimal confidenceName;

    @Column(name = "confidence_price", precision = 4, scale = 3)
    private BigDecimal confidencePrice;

    @Column(name = "confidence_quantity", precision = 4, scale = 3)
    private BigDecimal confidenceQuantity;

    @Column(name = "confidence_unit", precision = 4, scale = 3)
    private BigDecimal confidenceUnit;

    @Column(name = "confidence_category", precision = 4, scale = 3)
    private BigDecimal confidenceCategory;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}

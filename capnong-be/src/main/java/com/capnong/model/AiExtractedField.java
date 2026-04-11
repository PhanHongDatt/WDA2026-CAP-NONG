package com.capnong.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

@Entity
@Table(name = "ai_extracted_fields")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
@SQLRestriction("deleted = false")
public class AiExtractedField extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AiListingSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voice_input_id", nullable = false)
    private AiVoiceInput voiceInput;

    @Column(length = 255)
    private String extractedName;

    @Column(columnDefinition = "TEXT")
    private String extractedDescription;

    @Column(length = 50)
    private String extractedCategory;

    @Column(precision = 15, scale = 2)
    private BigDecimal extractedPrice;

    @Column(precision = 12, scale = 3)
    private BigDecimal extractedQuantity;

    @Column(length = 10)
    private String extractedUnitCode;

    @Column(length = 50)
    private String rawUnitText;

    @Column(columnDefinition = "TEXT")
    private String extractedHarvestNote;

    @Column(precision = 4, scale = 3)
    private BigDecimal confidenceName;

    @Column(precision = 4, scale = 3)
    private BigDecimal confidencePrice;

    @Column(precision = 4, scale = 3)
    private BigDecimal confidenceQuantity;

    @Column(precision = 4, scale = 3)
    private BigDecimal confidenceUnit;

    @Column(precision = 4, scale = 3)
    private BigDecimal confidenceCategory;
}

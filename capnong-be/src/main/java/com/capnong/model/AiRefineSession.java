package com.capnong.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "ai_refine_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
@SQLRestriction("deleted = false")
public class AiRefineSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AiListingSession session;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String rawText;

    @Column(length = 255)
    private String productNameHint;

    @Column(columnDefinition = "TEXT")
    private String refinedText;

    @Column(columnDefinition = "TEXT")
    private String changesSummary;

    private Boolean userConfirmed;
}

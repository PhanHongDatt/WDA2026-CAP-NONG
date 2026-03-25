package com.capnong.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_refine_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiRefineSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "raw_text", nullable = false, columnDefinition = "TEXT")
    private String rawText;

    @Column(name = "product_name_hint")
    private String productNameHint;

    @Column(name = "refined_text", columnDefinition = "TEXT")
    private String refinedText;

    @Column(name = "changes_summary", columnDefinition = "TEXT")
    private String changesSummary;

    @Column(name = "user_confirmed")
    private Boolean userConfirmed;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}

package com.capnong.model;

import com.capnong.model.enums.CaptionStyle;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_caption_results")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiCaptionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "description_input", nullable = false, columnDefinition = "TEXT")
    private String descriptionInput;

    @Column(length = 100)
    private String province;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CaptionStyle style;

    @Column(name = "caption_text", nullable = false, columnDefinition = "TEXT")
    private String captionText;

    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.ARRAY)
    @Column(columnDefinition = "text[]")
    private java.util.List<String> hashtags;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}

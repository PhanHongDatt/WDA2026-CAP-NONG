package com.capnong.model;

import com.capnong.model.enums.PosterTemplate;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_poster_results")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiPosterResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_id", nullable = false, length = 20)
    private PosterTemplate templateId;

    @Column(nullable = false)
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String tagline;

    @Column(name = "price_display", nullable = false, length = 100)
    private String priceDisplay;

    @Column(name = "badge_texts", columnDefinition = "TEXT[]")
    private String badgeTexts;

    @Column(name = "color_scheme", columnDefinition = "jsonb")
    private String colorScheme;

    @Column(name = "bg_removed_image_url", columnDefinition = "TEXT")
    private String bgRemovedImageUrl;

    @Column(name = "final_poster_url", columnDefinition = "TEXT")
    private String finalPosterUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}

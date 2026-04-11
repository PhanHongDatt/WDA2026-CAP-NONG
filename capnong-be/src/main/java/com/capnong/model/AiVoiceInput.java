package com.capnong.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "ai_voice_inputs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
@SQLRestriction("deleted = false")
public class AiVoiceInput extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AiListingSession session;

    @Column(columnDefinition = "TEXT")
    private String audioFileUrl;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String rawTranscript;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String languageCode = "vi-VN";
}

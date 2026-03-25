package com.capnong.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_voice_inputs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiVoiceInput {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "audio_file_url", columnDefinition = "TEXT")
    private String audioFileUrl;

    @Column(name = "raw_transcript", nullable = false, columnDefinition = "TEXT")
    private String rawTranscript;

    @Column(name = "language_code", nullable = false, length = 10)
    @Builder.Default
    private String languageCode = "vi-VN";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}

package com.capnong.kafka;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Kafka message payload cho Voice Extraction request.
 * Serialized dưới dạng JSON string.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoiceExtractionMessage {
    private String sessionId;
    private String voiceInputId;
    private String transcript;
    private String language;
}

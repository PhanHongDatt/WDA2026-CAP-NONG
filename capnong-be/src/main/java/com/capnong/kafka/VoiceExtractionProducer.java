package com.capnong.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

/**
 * Kafka Producer cho AI voice extraction pipeline.
 * Gửi VoiceExtractionMessage vào topic để consumer xử lý bất đồng bộ.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class VoiceExtractionProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Publish message yêu cầu trích xuất voice.
     * @param message payload chứa sessionId, voiceInputId, transcript, language
     */
    public void sendExtractionRequest(VoiceExtractionMessage message) {
        try {
            String json = objectMapper.writeValueAsString(message);
            kafkaTemplate.send(KafkaTopics.AI_VOICE_EXTRACTION_REQUEST, message.getSessionId(), json);
            log.info("Published voice extraction request: sessionId={}", message.getSessionId());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize voice extraction message: {}", e.getMessage(), e);
        }
    }
}

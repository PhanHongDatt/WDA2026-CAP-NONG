package com.capnong.kafka;

import com.capnong.dto.request.VoiceTranscriptRequest;
import com.capnong.dto.response.VoiceProductExtractionResponse;
import com.capnong.model.AiExtractedField;
import com.capnong.model.AiListingSession;
import com.capnong.model.AiVoiceInput;
import com.capnong.model.enums.AiSessionStatus;
import com.capnong.repository.AiExtractedFieldRepository;
import com.capnong.repository.AiListingSessionRepository;
import com.capnong.repository.AiVoiceInputRepository;
import com.capnong.service.VoiceProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Kafka Consumer cho AI voice extraction.
 *
 * Flow:
 * 1. Nhận message từ topic ai.voice.extraction.request
 * 2. Gọi VoiceProductService (WebClient → AI microservice)
 * 3. Lưu kết quả trích xuất vào AiExtractedField
 * 4. Cập nhật session status → COMPLETED
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class VoiceExtractionConsumer {

    private final VoiceProductService voiceProductService;
    private final AiListingSessionRepository sessionRepository;
    private final AiVoiceInputRepository voiceInputRepository;
    private final AiExtractedFieldRepository extractedFieldRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = KafkaTopics.AI_VOICE_EXTRACTION_REQUEST, groupId = "capnong-ai-group")
    @Transactional
    public void consumeVoiceExtraction(String messageJson) {
        try {
            VoiceExtractionMessage message = objectMapper.readValue(messageJson, VoiceExtractionMessage.class);
            log.info("Received voice extraction request: sessionId={}", message.getSessionId());

            UUID sessionId = UUID.fromString(message.getSessionId());
            UUID voiceInputId = UUID.fromString(message.getVoiceInputId());

            // 1. Gọi AI service (thông qua WebClient đã có)
            VoiceTranscriptRequest request = new VoiceTranscriptRequest();
            request.setTranscript(message.getTranscript());
            request.setLanguage(message.getLanguage());

            VoiceProductExtractionResponse response = voiceProductService.extractProductFromVoice(request);

            // 2. Lưu kết quả vào AiExtractedField
            AiListingSession session = sessionRepository.findById(sessionId).orElse(null);
            AiVoiceInput voiceInput = voiceInputRepository.findById(voiceInputId).orElse(null);

            if (session == null || voiceInput == null) {
                log.error("Session or VoiceInput not found: sessionId={}, voiceInputId={}", sessionId, voiceInputId);
                return;
            }

            AiExtractedField extractedField = AiExtractedField.builder()
                    .session(session)
                    .voiceInput(voiceInput)
                    .extractedName(getFieldValue(response.getProductName()))
                    .extractedDescription(getFieldValue(response.getDescription()))
                    .extractedCategory(getFieldValue(response.getFarmingMethod()))
                    .extractedPrice(getFieldBigDecimal(response.getPricePerUnit()))
                    .extractedQuantity(getFieldBigDecimal(response.getQuantity()))
                    .extractedUnitCode(getFieldValue(response.getQuantityUnit()))
                    .rawUnitText(getFieldValue(response.getPriceUnit()))
                    .extractedHarvestNote(getFieldValue(response.getHarvestDate()))
                    .confidenceName(getFieldConfidence(response.getProductName()))
                    .confidencePrice(getFieldConfidence(response.getPricePerUnit()))
                    .confidenceQuantity(getFieldConfidence(response.getQuantity()))
                    .confidenceUnit(getFieldConfidence(response.getQuantityUnit()))
                    .confidenceCategory(getFieldConfidence(response.getFarmingMethod()))
                    .build();

            extractedFieldRepository.save(extractedField);

            // 3. Cập nhật session status
            session.setStatus(AiSessionStatus.COMPLETED);
            session.setCompletedAt(LocalDateTime.now());
            sessionRepository.save(session);

            log.info("Voice extraction completed: sessionId={}, productName={}",
                    sessionId, extractedField.getExtractedName());

        } catch (Exception e) {
            log.error("Error processing voice extraction: {}", e.getMessage(), e);
            // Cập nhật session status → ABANDONED nếu lỗi
            handleExtractionError(messageJson, e);
        }
    }

    // ─── Helpers ────────────────────────────────────────

    private String getFieldValue(com.capnong.dto.response.FieldWithConfidence field) {
        if (field == null || field.getValue() == null) return null;
        return String.valueOf(field.getValue());
    }

    private BigDecimal getFieldBigDecimal(com.capnong.dto.response.FieldWithConfidence field) {
        if (field == null || field.getValue() == null) return null;
        try {
            return new BigDecimal(String.valueOf(field.getValue()));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private BigDecimal getFieldConfidence(com.capnong.dto.response.FieldWithConfidence field) {
        if (field == null || field.getConfidence() == null) return null;
        return BigDecimal.valueOf(field.getConfidence());
    }

    private void handleExtractionError(String messageJson, Exception error) {
        try {
            VoiceExtractionMessage message = objectMapper.readValue(messageJson, VoiceExtractionMessage.class);
            UUID sessionId = UUID.fromString(message.getSessionId());
            sessionRepository.findById(sessionId).ifPresent(session -> {
                session.setStatus(AiSessionStatus.ABANDONED);
                session.setCompletedAt(LocalDateTime.now());
                sessionRepository.save(session);
            });
        } catch (Exception e) {
            log.error("Failed to update session status after error: {}", e.getMessage());
        }
    }
}

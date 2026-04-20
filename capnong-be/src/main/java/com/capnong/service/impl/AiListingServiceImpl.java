package com.capnong.service.impl;

import com.capnong.dto.request.AiRefineRequest;
import com.capnong.dto.response.AiRefineResponse;
import com.capnong.exception.AppException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.kafka.VoiceExtractionMessage;
import com.capnong.kafka.VoiceExtractionProducer;
import com.capnong.model.*;
import com.capnong.model.enums.AiSessionStatus;
import com.capnong.model.enums.AiSessionType;
import com.capnong.repository.*;
import com.capnong.service.AiListingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiListingServiceImpl implements AiListingService {

    private final AiListingSessionRepository sessionRepository;
    private final AiVoiceInputRepository voiceInputRepository;
    private final AiRefineSessionRepository refineSessionRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final VoiceExtractionProducer voiceExtractionProducer;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @org.springframework.beans.factory.annotation.Value("${app.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    /**
     * Tạo session Voice-to-Product, lưu voice input, publish Kafka message.
     * Trả về sessionId cho FE poll kết quả.
     */
    @Override
    @Transactional
    public UUID startVoiceExtractionSession(String username, String transcript, String language, String audioFileUrl) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Shop shop = shopRepository.findByOwnerUsername(username)
                .orElseThrow(() -> new AppException("Bạn chưa có gian hàng.", HttpStatus.BAD_REQUEST));

        // 1. Tạo session
        AiListingSession session = AiListingSession.builder()
                .user(user)
                .shop(shop)
                .sessionType(AiSessionType.VOICE_TO_PRODUCT)
                .status(AiSessionStatus.IN_PROGRESS)
                .build();
        session = sessionRepository.save(session);

        // 2. Lưu voice input
        AiVoiceInput voiceInput = AiVoiceInput.builder()
                .session(session)
                .rawTranscript(transcript)
                .languageCode(language != null ? language : "vi-VN")
                .audioFileUrl(audioFileUrl)
                .build();
        voiceInput = voiceInputRepository.save(voiceInput);

        // 3. Publish Kafka message cho consumer xử lý bất đồng bộ
        VoiceExtractionMessage message = VoiceExtractionMessage.builder()
                .sessionId(session.getId().toString())
                .voiceInputId(voiceInput.getId().toString())
                .transcript(transcript)
                .language(language != null ? language : "vi-VN")
                .build();
        voiceExtractionProducer.sendExtractionRequest(message);

        log.info("Voice extraction session started (async): sessionId={}, userId={}", session.getId(), user.getId());

        return session.getId();
    }

    /**
     * AI Input Refiner — gọi Gemini để trau chuốt văn bản mô tả sản phẩm.
     * Thực hiện đồng bộ (Gemini API nhanh đủ cho text refinement).
     */
    @Override
    @Transactional
    public AiRefineResponse refineDescription(AiRefineRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Shop shop = shopRepository.findByOwnerUsername(username)
                .orElseThrow(() -> new AppException("Bạn chưa có gian hàng.", HttpStatus.BAD_REQUEST));

        // 1. Tạo session
        AiListingSession session = AiListingSession.builder()
                .user(user)
                .shop(shop)
                .sessionType(AiSessionType.REFINE_DESCRIPTION)
                .status(AiSessionStatus.IN_PROGRESS)
                .build();
        session = sessionRepository.save(session);

        // 2. Gọi AI Service bằng REST API (đã thiết lập AI service url là http://localhost:8000)
        String url = aiServiceUrl + "/ai/refine-description";
        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("raw_description", request.getRawText());
        if (request.getProductNameHint() != null && !request.getProductNameHint().isBlank()) {
            body.put("product_name", request.getProductNameHint());
        }

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        org.springframework.http.HttpEntity<java.util.Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(body, headers);

        String refinedText = request.getRawText();
        String changesSummary = "AI không thể chỉnh sửa.";
        try {
            org.springframework.http.ResponseEntity<String> apiResponse = restTemplate.exchange(url, org.springframework.http.HttpMethod.POST, entity, String.class);
            com.fasterxml.jackson.databind.JsonNode rootNode = objectMapper.readTree(apiResponse.getBody());
            
            refinedText = rootNode.has("refined_description") ? rootNode.get("refined_description").asText() : request.getRawText();
            if (rootNode.has("changes_summary") && rootNode.get("changes_summary").isArray()) {
                StringBuilder sb = new StringBuilder();
                for (com.fasterxml.jackson.databind.JsonNode change : rootNode.get("changes_summary")) {
                    sb.append("- ").append(change.asText()).append("\n");
                }
                changesSummary = sb.toString().trim();
            }
        } catch (Exception e) {
            log.error("Failed to call capnong-ai-service for refine-description: {}", e.getMessage());
            // Fallback content in case of AI service failure
        }

        // 3. Lưu refine session
        AiRefineSession refineSession = AiRefineSession.builder()
                .session(session)
                .rawText(request.getRawText())
                .productNameHint(request.getProductNameHint())
                .refinedText(refinedText)
                .changesSummary(changesSummary)
                .build();
        refineSessionRepository.save(refineSession);

        // 4. Update session status
        session.setStatus(AiSessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        sessionRepository.save(session);

        return AiRefineResponse.builder()
                .sessionId(session.getId())
                .rawText(request.getRawText())
                .refinedText(refinedText)
                .changesSummary(changesSummary)
                .build();
    }



    @Override
    public com.capnong.dto.response.PriceAdviceResponse getPriceAdvice(com.capnong.dto.request.PriceAdviceRequest request) {
        String url = aiServiceUrl + "/ai/price-advice";
        
        // Build Map with snake_case keys matching Python Pydantic schema
        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("product_name", request.getProductName());
        if (request.getCategory() != null) body.put("category", request.getCategory());
        if (request.getProvince() != null) body.put("province", request.getProvince());
        if (request.getCurrentPrice() != null) body.put("current_price", request.getCurrentPrice());
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        org.springframework.http.HttpEntity<java.util.Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(body, headers);
                
        try {
            org.springframework.http.ResponseEntity<String> apiResponse = restTemplate.exchange(
                    url, org.springframework.http.HttpMethod.POST, entity, String.class);
            com.fasterxml.jackson.databind.JsonNode rootNode = objectMapper.readTree(apiResponse.getBody());
            
            Long suggestedPrice = null;
            if (rootNode.has("suggested_price")) {
                suggestedPrice = rootNode.get("suggested_price").asLong();
            }
            
            java.util.Map<String, Long> priceRange = new java.util.HashMap<>();
            com.fasterxml.jackson.databind.JsonNode rangeNode = rootNode.get("price_range");
            if (rangeNode != null && !rangeNode.isNull()) {
                priceRange.put("min", rangeNode.has("min") ? rangeNode.get("min").asLong() : 0L);
                priceRange.put("max", rangeNode.has("max") ? rangeNode.get("max").asLong() : 0L);
            }
            
            String marketTrend = rootNode.has("market_trend") ? rootNode.get("market_trend").asText() : "Ổn định";
            String reasoning = rootNode.has("reasoning") ? rootNode.get("reasoning").asText() : "";
            
            return com.capnong.dto.response.PriceAdviceResponse.builder()
                    .suggestedPrice(suggestedPrice)
                    .priceRange(priceRange)
                    .marketTrend(marketTrend)
                    .reasoning(reasoning)
                    .build();
        } catch (Exception e) {
            log.error("Failed to call capnong-ai-service for price-advice: {}", e.getMessage());
            throw new AppException("Dịch vụ phân tích giá tạm thời không khả dụng", org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}

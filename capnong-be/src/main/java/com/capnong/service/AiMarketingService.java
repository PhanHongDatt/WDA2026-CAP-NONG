package com.capnong.service;

import com.capnong.dto.request.CaptionGenerateRequest;
import com.capnong.dto.request.PosterGenerateRequest;
import com.capnong.dto.response.AiSessionResultDto;
import com.capnong.exception.AppException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.model.AiListingSession;
import com.capnong.model.Shop;
import com.capnong.model.User;
import com.capnong.model.enums.AiSessionStatus;
import com.capnong.model.enums.AiSessionType;
import com.capnong.repository.AiListingSessionRepository;
import com.capnong.repository.ShopRepository;
import com.capnong.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AI Marketing Lab Service.
 *
 * Flow bất đồng bộ:
 * 1. FE POST /api/ai/caption → tạo session IN_PROGRESS, trả sessionId
 * 2. @Async gọi capnong-ai-service → lưu result → update session COMPLETED
 * 3. FE GET /api/ai/sessions/{id} → poll kết quả
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiMarketingService {

    @Value("${app.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final AiListingSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    // ═══════════════════════════════════════════════════════════════
    //  CAPTION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Tạo caption session (sync) + trigger async processing.
     */
    @Transactional
    public UUID startCaptionSession(CaptionGenerateRequest request, String username) {
        User user = findUser(username);
        Shop shop = findShop(username);

        AiListingSession session = AiListingSession.builder()
                .user(user)
                .shop(shop)
                .sessionType(AiSessionType.CAPTION)
                .status(AiSessionStatus.IN_PROGRESS)
                .build();
        session = sessionRepository.save(session);

        UUID sessionId = session.getId();

        // Trigger async processing
        processCaptionAsync(sessionId, request);

        log.info("Caption session started: {}", sessionId);
        return sessionId;
    }

    @Async
    public void processCaptionAsync(UUID sessionId, CaptionGenerateRequest request) {
        try {
            // Build request for ai-service
            Map<String, Object> body = new HashMap<>();
            body.put("product_name", request.getProductName());
            body.put("description", request.getDescription());
            if (request.getProvince() != null) body.put("province", request.getProvince());
            if (request.getStyle() != null) body.put("style", request.getStyle().name());

            // Call ai-service
            String url = aiServiceUrl + "/ai/generate-caption";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            // Parse response and save result
            String resultJson = response.getBody();

            AiListingSession session = sessionRepository.findById(sessionId).orElse(null);
            if (session == null) return;

            // Store result as JSON in session metadata
            session.setResultJson(resultJson);
            session.setStatus(AiSessionStatus.COMPLETED);
            session.setCompletedAt(LocalDateTime.now());
            sessionRepository.save(session);

            log.info("Caption session {} completed", sessionId);

        } catch (Exception e) {
            log.error("Caption processing failed for session {}: {}", sessionId, e.getMessage());
            markFailed(sessionId, e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  POSTER
    // ═══════════════════════════════════════════════════════════════

    @Transactional
    public UUID startPosterSession(PosterGenerateRequest request, String username) {
        User user = findUser(username);
        Shop shop = findShop(username);

        AiListingSession session = AiListingSession.builder()
                .user(user)
                .shop(shop)
                .sessionType(AiSessionType.POSTER)
                .status(AiSessionStatus.IN_PROGRESS)
                .build();
        session = sessionRepository.save(session);

        UUID sessionId = session.getId();

        // Store request mode for later
        String mode = request.getMode() != null ? request.getMode() : "HTML";

        processPosterAsync(sessionId, request, mode);

        log.info("Poster session started: {} (mode: {})", sessionId, mode);
        return sessionId;
    }

    @Async
    public void processPosterAsync(UUID sessionId, PosterGenerateRequest request, String mode) {
        try {
            Map<String, Object> result = new HashMap<>();
            result.put("mode", mode);

            if ("AI_IMAGE".equalsIgnoreCase(mode)) {
                // ─── Mode 2: AI sinh ảnh poster ───
                Map<String, Object> body = new HashMap<>();
                body.put("product_name", request.getProductName());
                if (request.getDescription() != null) body.put("description", request.getDescription());
                if (request.getProvince() != null) body.put("province", request.getProvince());
                if (request.getPriceDisplay() != null) body.put("price_display", request.getPriceDisplay());
                if (request.getShopName() != null) body.put("shop_name", request.getShopName());

                String url = aiServiceUrl + "/ai/poster-image";
                String imageResult = callAiService(url, body);
                result.put("imageResult", objectMapper.readValue(imageResult,
                        new TypeReference<Map<String, Object>>() {}));

            } else {
                // ─── Mode 1: HTML template (text content) ───
                // Step 1: Remove background (nếu có ảnh)
                if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
                    try {
                        String removeBgResult = callAiService(
                                aiServiceUrl + "/ai/remove-bg",
                                Map.of("image_url", request.getImageUrl())
                        );
                        result.put("removeBg", objectMapper.readValue(removeBgResult,
                                new TypeReference<Map<String, Object>>() {}));
                    } catch (Exception e) {
                        log.warn("Remove-bg failed, using original image: {}", e.getMessage());
                        result.put("removeBg", Map.of("original_url", request.getImageUrl(), "fallback", true));
                    }
                }

                // Step 2: Generate poster content
                Map<String, Object> body = new HashMap<>();
                body.put("product_name", request.getProductName());
                if (request.getDescription() != null) body.put("description", request.getDescription());
                if (request.getProvince() != null) body.put("province", request.getProvince());
                if (request.getPriceDisplay() != null) body.put("price_display", request.getPriceDisplay());
                if (request.getShopName() != null) body.put("shop_name", request.getShopName());
                body.put("template", request.getTemplate() != null
                        ? request.getTemplate().name() : "FRESH_GREEN");

                String contentResult = callAiService(aiServiceUrl + "/ai/poster-content", body);
                result.put("posterContent", objectMapper.readValue(contentResult,
                        new TypeReference<Map<String, Object>>() {}));
            }

            // Save result
            String resultJson = objectMapper.writeValueAsString(result);
            AiListingSession session = sessionRepository.findById(sessionId).orElse(null);
            if (session == null) return;

            session.setResultJson(resultJson);
            session.setStatus(AiSessionStatus.COMPLETED);
            session.setCompletedAt(LocalDateTime.now());
            sessionRepository.save(session);

            log.info("Poster session {} completed (mode: {})", sessionId, mode);

        } catch (Exception e) {
            log.error("Poster processing failed for session {}: {}", sessionId, e.getMessage());
            markFailed(sessionId, e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  POLLING
    // ═══════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public AiSessionResultDto getSessionResult(UUID sessionId) {
        AiListingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("AiSession", "id", sessionId.toString()));

        AiSessionResultDto.AiSessionResultDtoBuilder builder = AiSessionResultDto.builder()
                .sessionId(session.getId())
                .sessionType(session.getSessionType().name())
                .status(session.getStatus().name());

        if (session.getStatus() == AiSessionStatus.FAILED) {
            builder.errorMessage(session.getErrorMessage());
            return builder.build();
        }

        if (session.getStatus() != AiSessionStatus.COMPLETED || session.getResultJson() == null) {
            return builder.build();
        }

        try {
            // Parse result JSON based on session type
            if (session.getSessionType() == AiSessionType.CAPTION) {
                builder.caption(parseCaptionResult(session.getResultJson()));
            } else if (session.getSessionType() == AiSessionType.POSTER) {
                builder.poster(parsePosterResult(session.getResultJson()));
            }
        } catch (Exception e) {
            log.error("Failed to parse session result: {}", e.getMessage());
            builder.errorMessage("Lỗi parse kết quả: " + e.getMessage());
        }

        return builder.build();
    }

    // ═══════════════════════════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════════════════════════

    private String callAiService(String url, Map<String, Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        return response.getBody();
    }

    private void markFailed(UUID sessionId, String error) {
        try {
            AiListingSession session = sessionRepository.findById(sessionId).orElse(null);
            if (session != null) {
                session.setStatus(AiSessionStatus.FAILED);
                session.setErrorMessage(error);
                session.setCompletedAt(LocalDateTime.now());
                sessionRepository.save(session);
            }
        } catch (Exception e2) {
            log.error("Failed to mark session as failed: {}", e2.getMessage());
        }
    }

    private AiSessionResultDto.CaptionResultData parseCaptionResult(String json) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        List<AiSessionResultDto.CaptionItem> captions = new ArrayList<>();

        JsonNode captionsNode = root.path("captions");
        if (captionsNode.isArray()) {
            for (JsonNode c : captionsNode) {
                captions.add(AiSessionResultDto.CaptionItem.builder()
                        .style(c.path("style").asText())
                        .text(c.path("text").asText())
                        .build());
            }
        }

        List<String> hashtags = new ArrayList<>();
        JsonNode hashtagsNode = root.path("hashtags");
        if (hashtagsNode.isArray()) {
            for (JsonNode h : hashtagsNode) {
                hashtags.add(h.asText());
            }
        }

        return AiSessionResultDto.CaptionResultData.builder()
                .captions(captions)
                .hashtags(hashtags)
                .build();
    }

    @SuppressWarnings("unchecked")
    private AiSessionResultDto.PosterResultData parsePosterResult(String json) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        String mode = root.path("mode").asText("HTML");

        AiSessionResultDto.PosterResultData.PosterResultDataBuilder builder =
                AiSessionResultDto.PosterResultData.builder().mode(mode);

        if ("AI_IMAGE".equalsIgnoreCase(mode)) {
            JsonNode imageResult = root.path("imageResult");
            builder.imageBase64(imageResult.path("image_base64").asText(null));
            builder.mimeType(imageResult.path("mime_type").asText("image/png"));
        } else {
            // HTML mode
            JsonNode content = root.path("posterContent");
            builder.template(content.path("template").asText());
            builder.headline(content.path("headline").asText());
            builder.tagline(content.path("tagline").asText());
            builder.priceDisplay(content.path("price_display").asText());
            builder.shopDisplay(content.path("shop_display").asText());
            builder.ctaText(content.path("cta_text").asText());

            List<String> badges = new ArrayList<>();
            JsonNode badgeNode = content.path("badge_texts");
            if (badgeNode.isArray()) {
                for (JsonNode b : badgeNode) badges.add(b.asText());
            }
            builder.badgeTexts(badges);

            JsonNode cs = content.path("color_scheme");
            if (!cs.isMissingNode()) {
                builder.colorScheme(AiSessionResultDto.ColorScheme.builder()
                        .primary(cs.path("primary").asText("#2d6a4f"))
                        .accent(cs.path("accent").asText("#95d5b2"))
                        .textOnPrimary(cs.path("text_on_primary").asText("#ffffff"))
                        .background(cs.path("background").asText("#f0f7f4"))
                        .build());
            }

            // Remove-bg result
            JsonNode removeBg = root.path("removeBg");
            if (!removeBg.isMissingNode()) {
                String noBgUrl = removeBg.path("no_bg_url").asText(null);
                if (noBgUrl == null) noBgUrl = removeBg.path("original_url").asText(null);
                builder.noBgImageUrl(noBgUrl);
            }
        }

        return builder.build();
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }

    private Shop findShop(String username) {
        return shopRepository.findByOwnerUsername(username)
                .orElseThrow(() -> new AppException("Bạn chưa có gian hàng.", org.springframework.http.HttpStatus.BAD_REQUEST));
    }
}

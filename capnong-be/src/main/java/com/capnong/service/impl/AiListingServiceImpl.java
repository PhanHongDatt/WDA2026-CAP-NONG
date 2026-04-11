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
import com.capnong.service.GeminiService;
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
    private final GeminiService geminiService;
    private final VoiceExtractionProducer voiceExtractionProducer;

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

        // 2. Gọi Gemini AI để refine
        String prompt = buildRefinePrompt(request.getRawText(), request.getProductNameHint());
        String aiResponse = geminiService.generateContent(prompt);

        // Parse AI response
        String refinedText = aiResponse;
        String changesSummary = "AI đã chỉnh sửa văn bản.";

        if (aiResponse.contains("---CHANGES---")) {
            String[] parts = aiResponse.split("---CHANGES---", 2);
            refinedText = parts[0].trim();
            changesSummary = parts.length > 1 ? parts[1].trim() : changesSummary;
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

    private String buildRefinePrompt(String rawText, String productNameHint) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Bạn là trợ lý viết mô tả sản phẩm nông sản cho nông dân Việt Nam.\n\n");
        prompt.append("Nhiệm vụ: Chỉnh sửa mô tả sản phẩm sau đây. Sửa lỗi chính tả, ");
        prompt.append("chuyển từ địa phương sang tiếng Việt chuẩn, và làm câu văn mượt hơn.\n");
        prompt.append("KHÔNG thêm thông tin giả. Chỉ cải thiện cách diễn đạt.\n\n");

        if (productNameHint != null && !productNameHint.isBlank()) {
            prompt.append("Tên sản phẩm: ").append(productNameHint).append("\n");
        }

        prompt.append("Mô tả gốc:\n\"").append(rawText).append("\"\n\n");
        prompt.append("Trả về theo format sau (CHÍNH XÁC, không thêm markdown):\n");
        prompt.append("[Mô tả đã chỉnh sửa]\n");
        prompt.append("---CHANGES---\n");
        prompt.append("[Tóm tắt những gì đã sửa, mỗi thay đổi 1 dòng]");

        return prompt.toString();
    }
}

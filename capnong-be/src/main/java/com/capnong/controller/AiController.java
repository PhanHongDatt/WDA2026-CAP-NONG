package com.capnong.controller;

import com.capnong.dto.request.AiRefineRequest;
import com.capnong.dto.request.CaptionGenerateRequest;
import com.capnong.dto.request.PosterGenerateRequest;
import com.capnong.dto.response.AiRefineResponse;
import com.capnong.dto.response.AiSessionResultDto;
import com.capnong.dto.response.ApiResponse;
import com.capnong.service.AiListingService;
import com.capnong.service.AiMarketingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Assistant", description = "Trợ lý AI Marketing & Listing")
public class AiController {

    private final AiListingService aiListingService;
    private final AiMarketingService aiMarketingService;

    // ═══════════════════════════════════════════════════════════════
    //  Voice-to-Product (existing)
    // ═══════════════════════════════════════════════════════════════

    @PostMapping("/voice-session")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Tạo phiên Voice-to-Product",
            description = "Tạo session AI và đẩy transcript vào hàng đợi Kafka để xử lý bất đồng bộ.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> startVoiceSession(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String transcript = request.get("transcript");
        String language = request.getOrDefault("language", "vi-VN");
        String audioFileUrl = request.get("audioFileUrl");

        UUID sessionId = aiListingService.startVoiceExtractionSession(
                authentication.getName(), transcript, language, audioFileUrl);

        return ResponseEntity.ok(ApiResponse.success("Phiên AI đã được tạo. Kết quả đang xử lý.",
                Map.of("sessionId", sessionId, "status", "IN_PROGRESS")));
    }

    @PostMapping("/refine-description")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "AI Input Refiner",
            description = "Gửi mô tả thô → AI trau chuốt → trả về preview cho nông dân xác nhận.")
    public ResponseEntity<ApiResponse<AiRefineResponse>> refineDescription(
            @Valid @RequestBody AiRefineRequest request,
            Authentication authentication) {

        AiRefineResponse response = aiListingService.refineDescription(request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("AI đã trau chuốt mô tả thành công", response));
    }

    @PostMapping("/price-advice")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "AI Price Advisor",
            description = "Gợi ý giá thị trường dựa trên tên sản phẩm và phân loại.")
    public ResponseEntity<ApiResponse<com.capnong.dto.response.PriceAdviceResponse>> getPriceAdvice(
            @Valid @RequestBody com.capnong.dto.request.PriceAdviceRequest request) {
        com.capnong.dto.response.PriceAdviceResponse response = aiListingService.getPriceAdvice(request);
        return ResponseEntity.ok(ApiResponse.success("Phân tích giá thị trường thành công", response));
    }

    // ═══════════════════════════════════════════════════════════════
    //  AI Caption Generator
    // ═══════════════════════════════════════════════════════════════

    @PostMapping("/caption")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "AI Caption Generator",
            description = "Tạo 3 caption theo 3 phong cách (FUNNY, RUSTIC, PROFESSIONAL) + hashtags. "
                    + "Trả về sessionId để FE poll kết quả qua GET /api/ai/sessions/{id}.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateCaption(
            @Valid @RequestBody CaptionGenerateRequest request,
            Authentication authentication) {

        UUID sessionId = aiMarketingService.startCaptionSession(request, authentication.getName());

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success("Caption đang được tạo. Poll kết quả qua GET /api/ai/sessions/" + sessionId,
                        Map.of("sessionId", sessionId, "status", "IN_PROGRESS")));
    }

    // ═══════════════════════════════════════════════════════════════
    //  AI Poster Generator
    // ═══════════════════════════════════════════════════════════════

    @PostMapping("/poster")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "AI Poster Generator",
            description = "Tạo poster nông sản. Mode 'HTML' = tạo text content cho FE render template. "
                    + "Mode 'AI_IMAGE' = Gemini sinh ảnh poster hoàn chỉnh. "
                    + "Trả về sessionId để FE poll kết quả.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generatePoster(
            @Valid @RequestBody PosterGenerateRequest request,
            Authentication authentication) {

        UUID sessionId = aiMarketingService.startPosterSession(request, authentication.getName());

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success(
                        "Poster đang được tạo (mode: " + request.getMode() + "). Poll kết quả qua GET /api/ai/sessions/" + sessionId,
                        Map.of("sessionId", sessionId, "status", "IN_PROGRESS", "mode", request.getMode())));
    }

    // ═══════════════════════════════════════════════════════════════
    //  Session Polling (chung cho tất cả AI sessions)
    // ═══════════════════════════════════════════════════════════════

    @GetMapping("/sessions/{sessionId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Poll kết quả AI session",
            description = "FE gọi endpoint này để kiểm tra trạng thái và lấy kết quả AI session. "
                    + "Trả về status IN_PROGRESS/COMPLETED/FAILED + data tương ứng.")
    public ResponseEntity<ApiResponse<AiSessionResultDto>> getSessionResult(
            @PathVariable UUID sessionId) {

        AiSessionResultDto result = aiMarketingService.getSessionResult(sessionId);

        String message = switch (result.getStatus()) {
            case "COMPLETED" -> "Kết quả đã sẵn sàng";
            case "FAILED" -> "Xử lý thất bại";
            default -> "Đang xử lý...";
        };

        return ResponseEntity.ok(ApiResponse.success(message, result));
    }
}

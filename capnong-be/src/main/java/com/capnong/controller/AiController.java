package com.capnong.controller;

import com.capnong.dto.request.AiRefineRequest;
import com.capnong.dto.response.AiRefineResponse;
import com.capnong.dto.response.ApiResponse;
import com.capnong.service.AiListingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Listing Assistant", description = "Trợ lý AI cho việc đăng sản phẩm")
public class AiController {

    private final AiListingService aiListingService;

    @PostMapping("/voice-session")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(summary = "Tạo phiên Voice-to-Product",
            description = "Tạo session AI và đẩy transcript vào hàng đợi Kafka để xử lý bất đồng bộ. Trả về sessionId để FE poll kết quả.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> startVoiceSession(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String transcript = request.get("transcript");
        String language = request.getOrDefault("language", "vi-VN");
        String audioFileUrl = request.get("audioFileUrl"); // nullable

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
}

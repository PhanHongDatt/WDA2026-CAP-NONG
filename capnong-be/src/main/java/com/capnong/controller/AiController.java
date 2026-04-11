package com.capnong.controller;

import com.capnong.dto.response.ApiResponse;
import com.capnong.service.ai.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    /**
     * POST /api/v1/ai/voice-to-product
     * Trích xuất thông tin sản phẩm từ transcript giọng nói.
     */
    @PostMapping("/voice-to-product")
    public ResponseEntity<ApiResponse<Map<String, Object>>> voiceToProduct(
            @RequestBody Map<String, String> body) {
        String transcript = body.get("transcript");
        var result = aiService.voiceToProduct(transcript);
        return ResponseEntity.ok(ApiResponse.success("OK", result));
    }

    /**
     * POST /api/v1/ai/refine-description
     * Cải thiện mô tả sản phẩm.
     */
    @PostMapping("/refine-description")
    public ResponseEntity<ApiResponse<Map<String, Object>>> refineDescription(
            @RequestBody Map<String, String> body) {
        var result = aiService.refineDescription(body.get("raw_text"), body.get("product_name"));
        return ResponseEntity.ok(ApiResponse.success("OK", result));
    }

    /**
     * POST /api/v1/ai/captions
     * Tạo caption cho sản phẩm.
     */
    @PostMapping("/captions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateCaptions(
            @RequestBody Map<String, String> body) {
        var result = aiService.generateCaptions(
                body.get("product_name"),
                body.get("description"),
                body.get("province"),
                body.getOrDefault("style", "PROFESSIONAL"));
        return ResponseEntity.ok(ApiResponse.success("OK", result));
    }

    /**
     * POST /api/v1/ai/poster-content
     * Tạo nội dung poster (text only).
     */
    @PostMapping("/poster-content")
    public ResponseEntity<ApiResponse<Map<String, Object>>> posterContent(
            @RequestBody Map<String, Object> body) {
        var result = aiService.generatePosterContent(body);
        return ResponseEntity.ok(ApiResponse.success("OK", result));
    }

    /**
     * POST /api/v1/ai/crop-health
     * Phân tích sức khỏe cây trồng.
     */
    @PostMapping("/crop-health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cropHealth(
            @RequestBody Map<String, String> body) {
        var result = aiService.cropHealthCheck(body.get("description"), body.get("crop_type"));
        return ResponseEntity.ok(ApiResponse.success("OK", result));
    }

    /**
     * POST /api/v1/ai/price-advice
     * Gợi ý giá bán sản phẩm.
     */
    @PostMapping("/price-advice")
    public ResponseEntity<ApiResponse<Map<String, Object>>> priceAdvice(
            @RequestBody Map<String, Object> body) {
        var result = aiService.priceAdvice(
                (String) body.get("product_name"),
                (String) body.get("province"),
                (String) body.get("category"),
                body.get("current_price") != null ? Double.valueOf(body.get("current_price").toString()) : null);
        return ResponseEntity.ok(ApiResponse.success("OK", result));
    }
}

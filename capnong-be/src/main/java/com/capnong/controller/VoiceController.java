package com.capnong.controller;

import com.capnong.dto.request.VoiceTranscriptRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.VoiceProductExtractionResponse;
import com.capnong.service.VoiceProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Voice-to-Product API — Trích xuất thông tin sản phẩm nông sản từ giọng nói.
 *
 * <p>Flow: FE gửi transcript → BE validate → gọi AI service → validate response → trả về FE.
 *
 * <p>Chỉ cho phép user đã đăng nhập với role FARMER, HTX_MEMBER, hoặc HTX_MANAGER.
 */
@RestController
@RequestMapping("/api/voice")
@Tag(name = "Voice-to-Product", description = "Trích xuất thông tin sản phẩm từ giọng nói bằng AI")
public class VoiceController {

    private final VoiceProductService voiceProductService;

    public VoiceController(VoiceProductService voiceProductService) {
        this.voiceProductService = voiceProductService;
    }

    @PostMapping("/extract")
    @PreAuthorize("hasAnyRole('FARMER', 'HTX_MEMBER', 'HTX_MANAGER')")
    @Operation(
            summary = "Trích xuất thông tin sản phẩm từ transcript giọng nói",
            description = """
                    Nhận text transcript từ Web Speech API, gọi AI service để trích xuất:
                    - Tên sản phẩm, mô tả
                    - Giá, đơn vị giá
                    - Sản lượng, đơn vị (tự động quy đổi về kg nếu là trọng lượng)
                    - Ngày thu hoạch, phương pháp canh tác, vị trí
                    
                    Mỗi field đi kèm confidence score (high/medium/low) để FE hiển thị mức độ tin cậy.
                    """
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Trích xuất thành công"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Transcript không hợp lệ (quá ngắn, quá dài, hoặc trống)"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "401",
                    description = "Chưa đăng nhập"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Không có quyền (role không phù hợp)"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "422",
                    description = "AI không thể nhận diện sản phẩm từ transcript"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "503",
                    description = "Dịch vụ AI tạm thời không khả dụng"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "504",
                    description = "Dịch vụ AI phản hồi quá thời gian"
            )
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            content = @Content(
                    examples = @ExampleObject(
                            name = "Ví dụ transcript giọng nói",
                            value = """
                                    {
                                        "transcript": "tôi có năm tạ xoài cát chu giá hai mươi lăm ngàn một ký thu hoạch tuần sau",
                                        "language": "vi-VN"
                                    }
                                    """
                    )
            )
    )
    public ResponseEntity<ApiResponse<VoiceProductExtractionResponse>> extractProduct(
            @Valid @RequestBody VoiceTranscriptRequest request) {

        VoiceProductExtractionResponse result = voiceProductService.extractProductFromVoice(request);

        return ResponseEntity.ok(
                ApiResponse.success("Trích xuất thông tin sản phẩm thành công", result)
        );
    }
}

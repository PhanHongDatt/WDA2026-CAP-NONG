package com.capnong.dto.request;

import com.capnong.model.enums.PosterTemplate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PosterGenerateRequest {
    @NotBlank private String productName;
    private String description;
    private String province;
    private String priceDisplay;
    private String shopName;
    private String imageUrl;
    private PosterTemplate template;

    /**
     * Mode bắt buộc FE gửi lên:
     * "HTML"     = AI sinh text content → FE render template + html2canvas
     * "AI_IMAGE" = AI sinh ảnh poster hoàn chỉnh (Gemini Nano Banana)
     */
    @NotBlank(message = "mode là bắt buộc: HTML hoặc AI_IMAGE")
    @Pattern(regexp = "HTML|AI_IMAGE", message = "mode chỉ chấp nhận: HTML hoặc AI_IMAGE")
    private String mode;

    /**
     * Model gen ảnh (chỉ dùng cho AI_IMAGE mode).
     * Ví dụ: gemini-2.5-flash-image, gemini-3.1-flash-image-preview, imagen-4.0-generate-001
     */
    private String imageModel;

    // AI Refinement
    private String instruction;
    private Object currentState;
}

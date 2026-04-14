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
}

package com.capnong.dto.request;

import com.capnong.model.enums.PosterTemplate;
import jakarta.validation.constraints.NotBlank;
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

    /** "HTML" = text content cho FE render, "AI_IMAGE" = Gemini sinh ảnh */
    private String mode;
}

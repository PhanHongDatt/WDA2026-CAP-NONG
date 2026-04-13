package com.capnong.dto.request;

import com.capnong.model.enums.CaptionStyle;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CaptionGenerateRequest {
    @NotBlank private String productName;
    @NotBlank private String description;
    private String province;
    private CaptionStyle style;
}

package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ShopCreateRequest {
    @NotBlank private String name;
    @NotBlank @Pattern(regexp = "^[a-z0-9-]+$") private String slug;
    @NotBlank private String province;
    @NotBlank private String district;
    private String bio;
    private Integer yearsExperience;
    private Integer farmAreaM2;
    private String avatarUrl;
    private String coverUrl;
}

package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class HtxCreateRequest {
    @NotBlank private String name;
    @NotBlank @Pattern(regexp = "^\\d{8,12}$") private String officialCode;
    @NotBlank private String province;
    @NotBlank private String district;
    private String description;
    private String documentUrl;
}

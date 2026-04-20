package com.capnong.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AiRefineRequest {
    @JsonProperty("rawText")
    @NotBlank(message = "Văn bản không được để trống")
    @Size(min = 10, max = 5000, message = "Văn bản phải từ 10 đến 5000 ký tự")
    private String rawText;

    @JsonProperty("productNameHint")
    private String productNameHint;
}

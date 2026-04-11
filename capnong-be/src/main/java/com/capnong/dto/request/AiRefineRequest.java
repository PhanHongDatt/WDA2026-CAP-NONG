package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AiRefineRequest {
    @NotBlank(message = "Văn bản không được để trống")
    @Size(min = 10, max = 5000, message = "Văn bản phải từ 10 đến 5000 ký tự")
    private String rawText;

    private String productNameHint;
}

package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "Số điện thoại là bắt buộc")
    private String phone;
}

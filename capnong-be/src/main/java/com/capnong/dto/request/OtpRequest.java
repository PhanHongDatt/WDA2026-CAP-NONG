package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class OtpRequest {

    @NotBlank(message = "Số điện thoại là bắt buộc")
    @Pattern(regexp = "^(0|\\+84)\\d{9}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    // Chỉ dùng cho verify, send không cần
    private String code;
}

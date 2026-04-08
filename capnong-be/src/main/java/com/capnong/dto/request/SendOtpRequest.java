package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendOtpRequest {
    @NotBlank(message = "Thông tin đăng nhập (SĐT/Email) là bắt buộc")
    private String identifier;
}

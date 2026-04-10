package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Thông tin định danh (SĐT hoặc Email) là bắt buộc")
    private String identifier;

    @NotBlank(message = "Mã OTP là bắt buộc")
    private String otp;

    @NotBlank(message = "Mật khẩu mới là bắt buộc")
    @Size(min = 6, max = 100, message = "Mật khẩu phải từ 6-100 ký tự")
    private String newPassword;
}

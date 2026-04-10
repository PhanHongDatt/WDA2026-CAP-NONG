package com.capnong.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Thông tin định danh (SĐT hoặc Email) là bắt buộc")
    private String identifier;

    @NotBlank(message = "Tên tài khoản (username) là bắt buộc")
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be 6-100 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    @Size(max = 100)
    private String fullName;

    @NotBlank(message = "Mã OTP là bắt buộc")
    private String otp;

    private String role;
}

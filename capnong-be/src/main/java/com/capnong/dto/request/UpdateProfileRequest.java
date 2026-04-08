package com.capnong.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    private String username;

    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^(0|\\+84)\\d{9}$", message = "Invalid Vietnamese phone number")
    private String phone;

    private String otp;
}

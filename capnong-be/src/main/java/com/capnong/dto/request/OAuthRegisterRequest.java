package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OAuthRegisterRequest {
    @NotBlank(message = "Supabase access token là bắt buộc")
    private String supabaseToken;

    @NotBlank(message = "Username là bắt buộc")
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    private String username;
}

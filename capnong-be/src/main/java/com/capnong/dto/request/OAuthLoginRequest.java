package com.capnong.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OAuthLoginRequest {
    @NotBlank(message = "Supabase access token là bắt buộc")
    private String supabaseToken;
}

package com.capnong.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;

    private String refreshToken;

    @Builder.Default
    private String type = "Bearer";

    private long expiresIn;

    private String username;
    private String phone;
    private String email;
    private String role;

    /** Slug gian hàng của user (null nếu chưa tạo shop) */
    private String shopSlug;
}

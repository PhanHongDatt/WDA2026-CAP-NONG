package com.capnong.service;

import com.capnong.dto.response.AuthResponse;
import com.capnong.dto.response.OAuthCheckResponse;

import java.util.UUID;

public interface OAuthService {
    OAuthCheckResponse checkGoogleLogin(String supabaseToken);
    AuthResponse registerWithGoogle(String supabaseToken, String username);
    void linkGoogleAccount(UUID userId, String supabaseToken);
    void unlinkGoogleAccount(UUID userId);
}

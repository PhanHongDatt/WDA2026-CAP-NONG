package com.capnong.service;

import com.capnong.dto.request.LoginRequest;
import com.capnong.dto.request.RegisterRequest;
import com.capnong.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
    AuthResponse refreshAccessToken(String refreshTokenStr);
    void logout(String refreshTokenStr);
    void forgotPassword(String identifier);
    void resetPassword(String identifier, String otp, String newPassword);
    void sendRegisterOtp(String identifier);
}

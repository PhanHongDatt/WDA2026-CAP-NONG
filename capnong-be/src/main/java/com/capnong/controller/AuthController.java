package com.capnong.controller;

import com.capnong.dto.request.LoginRequest;
import com.capnong.dto.request.RefreshTokenRequest;
import com.capnong.dto.request.RegisterRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.AuthResponse;
import com.capnong.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Đăng ký, đăng nhập, refresh token, đăng xuất, OAuth")
public class AuthController {

    private final AuthService authService;
    private final com.capnong.service.OAuthService oAuthService;

    public AuthController(AuthService authService, com.capnong.service.OAuthService oAuthService) {
        this.authService = authService;
        this.oAuthService = oAuthService;
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Xác thực bằng username hoặc SĐT + mật khẩu. Trả về access token (1h) + refresh token (7 ngày).")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(
                ApiResponse.success("Đăng nhập thành công", authResponse));
    }

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản", description = "Tạo tài khoản mới. Role chỉ cho phép BUYER hoặc FARMER. Tự động merge đơn hàng guest nếu có.")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký tài khoản thành công", authResponse));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Làm mới access token", description = "Gửi refresh token để nhận access token mới mà không cần đăng nhập lại.")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse authResponse = authService.refreshAccessToken(request.getRefreshToken());
        return ResponseEntity.ok(
                ApiResponse.success("Refresh token thành công", authResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất", description = "Thu hồi tất cả refresh token của user hiện tại.")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(
                ApiResponse.success("Đăng xuất thành công"));
    }

    @PostMapping("/send-register-otp")
    @Operation(summary = "Gửi OTP xác nhận trước khi đăng ký", description = "Gửi OTP qua SĐT hoặc Email.")
    public ResponseEntity<ApiResponse<Void>> sendRegisterOtp(
            @Valid @RequestBody com.capnong.dto.request.SendOtpRequest request) {
        authService.sendRegisterOtp(request.getIdentifier());
        return ResponseEntity.ok(
                ApiResponse.success("Mã OTP đã được gửi đến " + request.getIdentifier()));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Quên mật khẩu (Gửi OTP)", description = "Yêu cầu gửi mã OTP về số điện thoại hoặc email để đặt lại mật khẩu.")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody com.capnong.dto.request.SendOtpRequest request) {
        authService.forgotPassword(request.getIdentifier());
        return ResponseEntity.ok(
                ApiResponse.success("Mã OTP đã được gửi đến " + request.getIdentifier()));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Đặt lại mật khẩu", description = "Xác nhận mã OTP và mật khẩu mới.")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody com.capnong.dto.request.ResetPasswordRequest request) {
        authService.resetPassword(request.getIdentifier(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(
                ApiResponse.success("Đặt lại mật khẩu thành công"));
    }

    // ─── OAuth Google ──────────────────────────────────

    @PostMapping("/oauth/google")
    @Operation(summary = "Đăng nhập bằng Google (Bước 1)", 
               description = "Gửi Supabase token sau khi FE auth với Google. Trả về: LOGIN_SUCCESS (đã liên kết), EMAIL_CONFLICT (email trùng, cần link), NEEDS_REGISTRATION (mới, cần nhập username).")
    public ResponseEntity<ApiResponse<com.capnong.dto.response.OAuthCheckResponse>> googleLogin(
            @Valid @RequestBody com.capnong.dto.request.OAuthLoginRequest request) {
        var result = oAuthService.checkGoogleLogin(request.getSupabaseToken());
        int status = switch (result.getStatus()) {
            case "LOGIN_SUCCESS" -> 200;
            case "NEEDS_REGISTRATION" -> 202;
            case "EMAIL_CONFLICT" -> 409;
            default -> 200;
        };
        return ResponseEntity.status(status)
                .body(ApiResponse.success(result.getStatus(), result));
    }

    @PostMapping("/oauth/google/register")
    @Operation(summary = "Hoàn tất đăng ký Google (Bước 2)", 
               description = "Sau khi nhận NEEDS_REGISTRATION, FE gửi lại supabaseToken + username đã chọn.")
    public ResponseEntity<ApiResponse<AuthResponse>> googleRegister(
            @Valid @RequestBody com.capnong.dto.request.OAuthRegisterRequest request) {
        AuthResponse authResponse = oAuthService.registerWithGoogle(
                request.getSupabaseToken(), request.getUsername());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký bằng Google thành công", authResponse));
    }
}
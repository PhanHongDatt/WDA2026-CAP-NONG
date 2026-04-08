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
@Tag(name = "Authentication", description = "Đăng ký, đăng nhập, refresh token, đăng xuất")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
}
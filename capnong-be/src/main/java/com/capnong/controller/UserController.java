package com.capnong.controller;

import com.capnong.dto.request.UpdateProfileRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.UserResponse;
import com.capnong.security.UserDetailsImpl;
import com.capnong.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "Quản lý thông tin profile người dùng")
public class UserController {

    private final UserService userService;
    private final com.capnong.service.OAuthService oAuthService;

    public UserController(UserService userService, com.capnong.service.OAuthService oAuthService) {
        this.userService = userService;
        this.oAuthService = oAuthService;
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy thông tin profile", description = "Lấy chi tiết thông tin của user đang đăng nhập hiện tại.")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        UserResponse response = userService.getProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin thành công", response));
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cập nhật profile", description = "Cập nhật fullName và email. Nếu email thay đổi sẽ check trùng lặp.")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse response = userService.updateProfile(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", response));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload Avatar", description = "Cập nhật ảnh đại diện người dùng, upload thẳng lên Cloudinary.")
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatar(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Parameter(description = "File ảnh avatar (jpeg/png)", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE))
            @RequestParam("file") MultipartFile file) {
        UserResponse response = userService.uploadAvatar(userDetails.getId(), file);
        return ResponseEntity.ok(ApiResponse.success("Upload avatar thành công", response));
    }

    @PostMapping("/me/send-update-otp")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Gửi OTP xác nhận", description = "Gửi mã OTP về SĐT hoặc Email mới trước khi cập nhật account.")
    public ResponseEntity<ApiResponse<Void>> sendUpdateOtp(
            @Valid @RequestBody com.capnong.dto.request.SendOtpRequest request) {
        userService.sendUpdateOtp(request.getIdentifier());
        return ResponseEntity.ok(
                ApiResponse.success("Mã OTP đã được gửi đến " + request.getIdentifier()));
    }
    @PutMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Đổi mật khẩu", description = "Đổi mật khẩu cho người dùng đang đăng nhập.")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody com.capnong.dto.request.ChangePasswordRequest request) {
        userService.changePassword(userDetails.getId(), request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công"));
    }

    @PostMapping("/me/link-google")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Liên kết tài khoản Google", description = "Gửi Supabase token để liên kết Google vào tài khoản hiện tại. Sau khi liên kết, có thể đăng nhập bằng Google.")
    public ResponseEntity<ApiResponse<Void>> linkGoogle(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody com.capnong.dto.request.OAuthLoginRequest request) {
        oAuthService.linkGoogleAccount(userDetails.getId(), request.getSupabaseToken());
        return ResponseEntity.ok(ApiResponse.success("Liên kết tài khoản Google thành công"));
    }

    @DeleteMapping("/me/unlink-google")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Hủy liên kết Google", description = "Gỡ liên kết tài khoản Google ra khỏi tài khoản hiện tại. Yêu cầu tài khoản đã có mật khẩu.")
    public ResponseEntity<ApiResponse<Void>> unlinkGoogle(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        oAuthService.unlinkGoogleAccount(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Hủy liên kết tài khoản Google thành công"));
    }
}

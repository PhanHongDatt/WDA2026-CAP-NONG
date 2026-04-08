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

    public UserController(UserService userService) {
        this.userService = userService;
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
}

package com.capnong.controller;

import com.capnong.dto.request.ChangeRoleRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.UserResponse;
import com.capnong.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@Tag(name = "Admin Management", description = "Quản lý hệ thống người dùng (chỉ dành cho ADMIN)")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy danh sách người dùng", description = "Lấy tất cả user có phân trang")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<UserResponse> users = adminService.getAllUsers(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách user thành công", users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xem chi tiết user")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long id) {
        UserResponse user = adminService.getUserDetails(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin thành công", user));
    }

    @PatchMapping("/{id}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Khóa tài khoản (Ban)")
    public ResponseEntity<ApiResponse<UserResponse>> banUser(@PathVariable Long id) {
        UserResponse user = adminService.banUser(id);
        return ResponseEntity.ok(ApiResponse.success("Đã khóa tài khoản", user));
    }

    @PatchMapping("/{id}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mở khóa tài khoản (Unban)")
    public ResponseEntity<ApiResponse<UserResponse>> unbanUser(@PathVariable Long id) {
        UserResponse user = adminService.unbanUser(id);
        return ResponseEntity.ok(ApiResponse.success("Đã mở khóa tài khoản", user));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thay đổi Role của user")
    public ResponseEntity<ApiResponse<UserResponse>> changeRole(
            @PathVariable Long id,
            @Valid @RequestBody ChangeRoleRequest request) {
        UserResponse user = adminService.changeUserRole(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật quyền thành công", user));
    }
}

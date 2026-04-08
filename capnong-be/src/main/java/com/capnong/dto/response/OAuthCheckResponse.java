package com.capnong.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response trả về khi user gọi API OAuth check.
 * - status = "LOGIN_SUCCESS": Đã có tài khoản liên kết, trả về AuthResponse.
 * - status = "NEEDS_REGISTRATION": Chưa có tài khoản, FE hiện form chọn username.
 * - status = "EMAIL_CONFLICT": Email đã tồn tại (đăng ký bằng mật khẩu), cần link account.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuthCheckResponse {
    private String status; // LOGIN_SUCCESS | NEEDS_REGISTRATION | EMAIL_CONFLICT
    private AuthResponse authResponse; // Chỉ có khi status = LOGIN_SUCCESS
    private String email; // Luôn trả để FE hiển thị
    private String fullName; // Tên từ Google
    private String avatarUrl; // Avatar từ Google
}

package com.capnong.controller;

import com.capnong.dto.response.ApiResponse;
import com.capnong.model.Notification;
import com.capnong.security.UserDetailsImpl;
import com.capnong.service.NotificationService;
import com.capnong.service.TelegramNotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Notification", description = "Quản lý hộp thư thông báo và tin nhắn qua nền tảng")
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final TelegramNotificationService telegramNotificationService;

    public NotificationController(NotificationService notificationService,
                                   TelegramNotificationService telegramNotificationService) {
        this.notificationService = notificationService;
        this.telegramNotificationService = telegramNotificationService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách thông báo", description = "Lấy danh sách các thông báo tới cá nhân người dùng, có hỗ trợ phân trang.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> list(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {
        var notifications = notificationService.getUserNotifications(
                user.getId(), PageRequest.of(page, limit, Sort.by("createdAt").descending()));
        long unreadCount = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(ApiResponse.success("OK",
                Map.of("notifications", notifications, "unread_count", unreadCount)));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Lấy số lượng thông báo chưa đọc", description = "Đếm số lượng thông báo có trạng thái unread cho badge trên UI.")
    public ResponseEntity<ApiResponse<Map<String, Long>>> unreadCount(
            @AuthenticationPrincipal UserDetailsImpl user) {
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(ApiResponse.success("OK", Map.of("count", count)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Đánh dấu thông báo đã đọc", description = "Cập nhật thay đổi trạng thái của thẻ thông báo thành read.")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable UUID id) {
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã đọc", null));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Đánh dấu tất cả thông báo là đã đọc", description = "Chỉnh sửa trạng thái toàn bộ thông báo trong list unread thành read.")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetailsImpl user) {
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã đọc tất cả", null));
    }

    /**
     * GET /api/v1/notifications/telegram/link
     */
    @GetMapping("/telegram/link")
    @Operation(summary = "Lấy link liên kết Telegram", description = "Trả về URL t.me/{bot}?start={token} để người dùng click mở bot và tự động liên kết.")
    public ResponseEntity<ApiResponse<Map<String, String>>> getTelegramLink(
            @AuthenticationPrincipal UserDetailsImpl user) {
        String link = telegramNotificationService.generateLinkingUrl(user.getId());
        return ResponseEntity.ok(ApiResponse.success("OK", Map.of("link", link)));
    }

    /**
     * GET /api/v1/notifications/telegram/status
     */
    @GetMapping("/telegram/status")
    @Operation(summary = "Kiểm tra trạng thái liên kết Telegram", description = "Trả về thông tin xem người dùng đã liên kết với Telegram chưa.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTelegramStatus(
            @AuthenticationPrincipal UserDetailsImpl user) {
        boolean isLinked = telegramNotificationService.isTelegramLinked(user.getId());
        return ResponseEntity.ok(ApiResponse.success("OK", Map.of("is_linked", isLinked)));
    }

    /**
     * POST /api/v1/notifications/telegram/register
     * @deprecated Use /telegram/link for better UX with auto-linking
     */
    @Deprecated
    @PostMapping("/telegram/register")
    @Operation(summary = "Cấu hình liên kết tài khoản Telegram (Thủ công)", description = "Cho phép người dùng lưu chat ID thủ công. Khuyến khích dùng /telegram/link để tự động hóa.")
    public ResponseEntity<ApiResponse<Void>> registerTelegram(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody Map<String, String> body) {
        telegramNotificationService.linkTelegram(user.getId(), body.get("telegram_chat_id"));
        return ResponseEntity.ok(ApiResponse.success("Đã liên kết Telegram", null));
    }

    /**
     * DELETE /api/v1/notifications/telegram
     */
    @DeleteMapping("/telegram")
    @Operation(summary = "Xóa cấu hình Telegram", description = "Ngừng liên kết với chat ID và ngừng gửi các notify thông qua Telegram.")
    public ResponseEntity<ApiResponse<Void>> unlinkTelegram(
            @AuthenticationPrincipal UserDetailsImpl user) {
        telegramNotificationService.unlinkTelegram(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã hủy liên kết Telegram", null));
    }
}

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

@RestController
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
    public ResponseEntity<ApiResponse<Map<String, Long>>> unreadCount(
            @AuthenticationPrincipal UserDetailsImpl user) {
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(ApiResponse.success("OK", Map.of("count", count)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable UUID id) {
        notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã đọc", null));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal UserDetailsImpl user) {
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã đọc tất cả", null));
    }

    /**
     * POST /api/v1/notifications/telegram/register
     */
    @PostMapping("/telegram/register")
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
    public ResponseEntity<ApiResponse<Void>> unlinkTelegram(
            @AuthenticationPrincipal UserDetailsImpl user) {
        telegramNotificationService.unlinkTelegram(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã hủy liên kết Telegram", null));
    }
}

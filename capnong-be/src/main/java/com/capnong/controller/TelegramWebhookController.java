package com.capnong.controller;

import com.capnong.service.TelegramNotificationService;
import io.swagger.v3.oas.annotations.Hidden;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications/telegram")
@Hidden // Ẩn khỏi Swagger vì đây là endpoint dành riêng cho Telegram Bot
public class TelegramWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(TelegramWebhookController.class);

    private final TelegramNotificationService telegramNotificationService;

    @Value("${app.telegram.webhook-secret-token:}")
    private String expectedSecretToken;

    public TelegramWebhookController(TelegramNotificationService telegramNotificationService) {
        this.telegramNotificationService = telegramNotificationService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestHeader(value = "X-Telegram-Bot-Api-Secret-Token", required = false) String secretToken,
            @RequestBody Map<String, Object> update) {

        // 1. Kiểm tra bảo mật
        if (expectedSecretToken != null && !expectedSecretToken.isBlank()) {
            if (!expectedSecretToken.equals(secretToken)) {
                logger.warn("Unauthorized attempt to access Telegram Webhook. IP: {}, Token: {}", 
                    "Unknown", secretToken);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        // 2. Xử lý update
        try {
            telegramWebhookService(update);
        } catch (Exception e) {
            logger.error("Error processing Telegram update: {}", e.getMessage());
        }

        // 3. Luôn trả về 200 OK cho Telegram để không bị gửi lại
        return ResponseEntity.ok().build();
    }

    private void telegramWebhookService(Map<String, Object> update) {
        telegramNotificationService.handleTelegramUpdate(update);
    }
}

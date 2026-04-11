package com.capnong.service;

import com.capnong.model.Notification;
import com.capnong.model.User;
import com.capnong.model.enums.NotificationType;
import com.capnong.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Kết nối Notification + Telegram: khi tạo notification in-app,
 * đồng thời gửi Telegram nếu user đã link chat_id.
 */
@Service
public class TelegramNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(TelegramNotificationService.class);

    private final NotificationService notificationService;
    private final TelegramBotService telegramBotService;
    private final UserRepository userRepository;

    public TelegramNotificationService(NotificationService notificationService,
                                        TelegramBotService telegramBotService,
                                        UserRepository userRepository) {
        this.notificationService = notificationService;
        this.telegramBotService = telegramBotService;
        this.userRepository = userRepository;
    }

    /**
     * Tạo notification in-app + gửi Telegram (nếu user đã link).
     */
    public Notification notify(UUID userId, NotificationType type, String title, String body) {
        // 1. In-app notification
        Notification notification = notificationService.createNotification(userId, type, title, body);

        // 2. Telegram (async, non-blocking)
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getTelegramChatId() != null) {
                String message = "🔔 *" + title + "*\n" + body;
                telegramBotService.sendMessage(user.getTelegramChatId(), message);
            }
        } catch (Exception e) {
            logger.warn("Failed to send Telegram notification to user {}: {}", userId, e.getMessage());
        }

        return notification;
    }

    /**
     * Link Telegram chat với user account.
     */
    public void linkTelegram(UUID userId, String chatId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setTelegramChatId(chatId);
        userRepository.save(user);
    }

    /**
     * Unlink Telegram.
     */
    public void unlinkTelegram(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setTelegramChatId(null);
        userRepository.save(user);
    }
}

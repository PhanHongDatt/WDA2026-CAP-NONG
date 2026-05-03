package com.capnong.service.impl;

import com.capnong.model.Notification;
import com.capnong.model.User;
import com.capnong.model.enums.NotificationType;
import com.capnong.repository.UserRepository;
import com.capnong.service.NotificationService;
import com.capnong.service.TelegramBotService;
import com.capnong.service.TelegramNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class TelegramNotificationServiceImpl implements TelegramNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(TelegramNotificationServiceImpl.class);

    private final NotificationService notificationService;
    private final TelegramBotService telegramBotService;
    private final UserRepository userRepository;

    public TelegramNotificationServiceImpl(NotificationService notificationService,
                                            TelegramBotService telegramBotService,
                                            UserRepository userRepository) {
        this.notificationService = notificationService;
        this.telegramBotService = telegramBotService;
        this.userRepository = userRepository;
    }

    @Override
    public Notification notify(UUID userId, NotificationType type, String title, String body) {
        // 1. In-app notification (DB)
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

    @Override
    public void linkTelegram(UUID userId, String chatId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setTelegramChatId(chatId);
        userRepository.save(user);
    }

    @Override
    public boolean isTelegramLinked(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        return user != null && user.getTelegramChatId() != null;
    }

    @Override
    public void unlinkTelegram(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setTelegramChatId(null);
        userRepository.save(user);
    }

    @Override
    public String generateLinkingUrl(UUID userId) {
        String botUsername = telegramBotService.getBotUsername();
        if (botUsername == null || botUsername.isBlank()) {
            return null;
        }
        return "https://t.me/" + botUsername + "?start=" + userId.toString();
    }

    @Override
    public void handleTelegramUpdate(Map<String, Object> update) {
        try {
            if (!update.containsKey("message")) return;
            Map<String, Object> message = (Map<String, Object>) update.get("message");
            
            if (!message.containsKey("text") || !message.containsKey("chat")) return;
            String text = (String) message.get("text");
            Map<String, Object> chat = (Map<String, Object>) message.get("chat");
            String chatId = String.valueOf(chat.get("id"));

            // Check lệnh /start {userId}
            if (text.startsWith("/start ")) {
                String userIdStr = text.substring(7).trim();
                try {
                    UUID userId = UUID.fromString(userIdStr);
                    linkTelegram(userId, chatId);
                    
                    telegramBotService.sendMessage(chatId, 
                        "🎉 *Liên kết thành công!*\n\nChào mừng bạn đến với *Cạp Nông*. " +
                        "Từ giờ bạn sẽ nhận được thông báo về đơn hàng và các hoạt động HTX trực tiếp tại đây.");
                    
                    logger.info("Telegram linked successfully for user {} with chat {}", userId, chatId);
                } catch (IllegalArgumentException e) {
                    logger.warn("Invalid userId in Telegram start command: {}", userIdStr);
                }
            }
        } catch (Exception e) {
            logger.error("Error processing Telegram update: {}", e.getMessage());
        }
    }
}

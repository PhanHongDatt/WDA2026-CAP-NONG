package com.capnong.service;

import com.capnong.model.Notification;
import com.capnong.model.enums.NotificationType;

import java.util.Map;
import java.util.UUID;

public interface TelegramNotificationService {
    Notification notify(UUID userId, NotificationType type, String title, String body);
    void linkTelegram(UUID userId, String chatId);
    boolean isTelegramLinked(UUID userId);
    void unlinkTelegram(UUID userId);
    String generateLinkingUrl(UUID userId);
    void handleTelegramUpdate(Map<String, Object> update);
}

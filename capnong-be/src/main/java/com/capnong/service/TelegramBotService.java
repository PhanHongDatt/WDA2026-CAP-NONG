package com.capnong.service;

public interface TelegramBotService {
    boolean sendMessage(String chatId, String text);
    String getBotUsername();
    void registerWebhook();
}

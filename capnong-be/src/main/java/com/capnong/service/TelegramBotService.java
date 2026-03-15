package com.capnong.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Service for sending messages via Telegram Bot API.
 */
@Service
public class TelegramBotService {

    private static final Logger logger = LoggerFactory.getLogger(TelegramBotService.class);
    private static final String TELEGRAM_API_URL = "https://api.telegram.org/bot";

    @Value("${app.telegram.bot-token:}")
    private String botToken;

    @Value("${app.telegram.bot-username:}")
    private String botUsername;

    private final RestTemplate restTemplate;

    public TelegramBotService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Send a text message to a Telegram chat.
     *
     * @param chatId the target chat ID
     * @param text   the message text (supports Markdown)
     * @return true if the message was sent successfully
     */
    public boolean sendMessage(String chatId, String text) {
        if (botToken == null || botToken.isBlank()) {
            logger.warn("Telegram bot token is not configured");
            return false;
        }

        try {
            String url = TELEGRAM_API_URL + botToken + "/sendMessage";

            Map<String, Object> requestBody = Map.of(
                    "chat_id", chatId,
                    "text", text,
                    "parse_mode", "Markdown"
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Telegram message sent to chat: {}", chatId);
                return true;
            }

            logger.error("Failed to send Telegram message. Status: {}", response.getStatusCode());
            return false;

        } catch (Exception e) {
            logger.error("Error sending Telegram message: {}", e.getMessage());
            return false;
        }
    }

    public String getBotUsername() {
        return botUsername;
    }
}

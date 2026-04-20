package com.capnong.service.impl;

import com.capnong.service.TelegramBotService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
public class TelegramBotServiceImpl implements TelegramBotService {

    private static final Logger logger = LoggerFactory.getLogger(TelegramBotServiceImpl.class);
    private static final String TELEGRAM_API_URL = "https://api.telegram.org/bot";

    @Value("${app.telegram.bot-token:}")
    private String botToken;

    @Value("${app.telegram.bot-username:}")
    private String botUsername;

    @Value("${app.telegram.webhook-url:}")
    private String webhookUrl;

    @Value("${app.telegram.webhook-secret-token:}")
    private String webhookSecretToken;

    private final RestTemplate restTemplate;

    public TelegramBotServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
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
                    url, Objects.requireNonNull(HttpMethod.POST), entity, String.class);

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

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    @PostConstruct
    public void registerWebhook() {
        if (botToken == null || botToken.isBlank() || webhookUrl == null || webhookUrl.isBlank()) {
            logger.info("Telegram Webhook registration skipped: Token or URL not configured");
            return;
        }

        try {
            String url = TELEGRAM_API_URL + botToken + "/setWebhook";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("url", webhookUrl);
            if (webhookSecretToken != null && !webhookSecretToken.isBlank()) {
                requestBody.put("secret_token", webhookSecretToken);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Telegram Webhook registered successfully: {}", webhookUrl);
            } else {
                logger.error("Failed to register Telegram Webhook. Status: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("Error registering Telegram Webhook: {}", e.getMessage());
        }
    }
}

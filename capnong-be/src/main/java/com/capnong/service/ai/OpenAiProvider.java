package com.capnong.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * OpenAI-compatible provider via MegaLLM gateway.
 * Tạm thời dùng thay Gemini. Swap bằng cách đổi @Primary sang GeminiProvider.
 */
@Component
@Primary
public class OpenAiProvider implements AiProvider {

    private static final Logger logger = LoggerFactory.getLogger(OpenAiProvider.class);

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.model:openai-gpt-oss-20b}")
    private String model;

    @Value("${app.ai.base-url:https://api.mega-llm.com/v1}")
    private String baseUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenAiProvider(ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    @Override
    public String chat(String systemPrompt, String userMessage) {
        return callApi(systemPrompt, userMessage, null);
    }

    @Override
    public String chatJson(String systemPrompt, String userMessage) {
        return callApi(systemPrompt, userMessage, Map.of("type", "json_object"));
    }

    private String callApi(String systemPrompt, String userMessage, Map<String, String> responseFormat) {
        try {
            String url = baseUrl + "/chat/completions";

            var messages = new java.util.ArrayList<>(List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userMessage)
            ));

            var body = new java.util.HashMap<String, Object>();
            body.put("model", model);
            body.put("messages", messages);
            body.put("temperature", 0.7);
            body.put("max_tokens", 2000);
            if (responseFormat != null) {
                body.put("response_format", responseFormat);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices")
                    .path(0)
                    .path("message")
                    .path("content")
                    .asText();

        } catch (Exception e) {
            logger.error("Error calling AI API: {}", e.getMessage());
            throw new RuntimeException("AI API call failed", e);
        }
    }
}

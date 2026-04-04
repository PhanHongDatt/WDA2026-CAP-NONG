package com.capnong.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Service for interacting with Google Gemini API.
 */
@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);
    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService(ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    /**
     * Generate content using Gemini API.
     *
     * @param prompt the text prompt to send
     * @return the generated text response
     */
    public String generateContent(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            logger.warn("Gemini API key is not configured");
            throw new IllegalStateException("Gemini API key is not configured");
        }

        try {
            String url = GEMINI_API_URL + "?key=" + apiKey;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, Objects.requireNonNull(HttpMethod.POST), entity, String.class);

            // Parse response to extract generated text
            JsonNode root = objectMapper.readTree(
                    Objects.requireNonNull(response.getBody(), "Gemini API returned empty body"));
            return root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();

        } catch (Exception e) {
            logger.error("Error calling Gemini API: {}", e.getMessage());
            throw new RuntimeException("Failed to generate content from Gemini", e);
        }
    }
}

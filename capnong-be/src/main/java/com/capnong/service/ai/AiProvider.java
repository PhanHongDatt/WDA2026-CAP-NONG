package com.capnong.service.ai;

/**
 * Adapter interface for AI providers.
 * Allows swapping between OpenAI (MegaLLM) and Google Gemini.
 */
public interface AiProvider {

    /**
     * Send a prompt and get text response.
     */
    String chat(String systemPrompt, String userMessage);

    /**
     * Send a prompt with JSON response expected.
     */
    String chatJson(String systemPrompt, String userMessage);
}

package com.capnong.service.impl;

import com.capnong.dto.request.AiVoiceRequest;
import com.capnong.dto.request.VoiceTranscriptRequest;
import com.capnong.dto.response.VoiceProductExtractionResponse;
import com.capnong.exception.AppException;
import com.capnong.service.VoiceProductService;

import io.netty.handler.timeout.ReadTimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.net.ConnectException;
import java.time.Duration;
import java.util.Objects;

@Service
public class VoiceProductServiceImpl implements VoiceProductService {

    private static final Logger log = LoggerFactory.getLogger(VoiceProductServiceImpl.class);
    private static final String AI_VOICE_ENDPOINT = "/ai/voice-to-product";

    private final WebClient aiServiceWebClient;

    @Value("${ai.service.timeout:15000}")
    private int timeoutMs;

    public VoiceProductServiceImpl(WebClient aiServiceWebClient) {
        this.aiServiceWebClient = aiServiceWebClient;
    }

    @Override
    public VoiceProductExtractionResponse extractProductFromVoice(VoiceTranscriptRequest request) {
        log.info("Voice extraction requested — transcript length: {} chars, language: {}",
                request.getTranscript().length(), request.getLanguage());

        AiVoiceRequest aiRequest = AiVoiceRequest.builder()
                .transcript(request.getTranscript().trim())
                .language(request.getLanguage())
                .build();

        VoiceProductExtractionResponse response = callAiService(aiRequest);
        validateResponse(response);

        log.info("Voice extraction completed — product: {}, notes: {}",
                response.getProductName() != null ? response.getProductName().getValue() : "N/A",
                response.getProcessingNotes() != null ? response.getProcessingNotes().size() : 0);

        return response;
    }

    private VoiceProductExtractionResponse callAiService(AiVoiceRequest request) {
        try {
            return aiServiceWebClient.post()
                    .uri(AI_VOICE_ENDPOINT)
                    .bodyValue(Objects.requireNonNull(request, "AiVoiceRequest must not be null"))
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .map(body -> {
                                        log.error("AI service returned 4xx: status={}, body={}",
                                                clientResponse.statusCode(), body);
                                        return new AppException(
                                                "Dữ liệu gửi đến AI service không hợp lệ: " + body,
                                                HttpStatus.BAD_REQUEST);
                                    })
                    )
                    .onStatus(HttpStatusCode::is5xxServerError, clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .map(body -> {
                                        log.error("AI service returned 5xx: status={}, body={}",
                                                clientResponse.statusCode(), body);
                                        return new AppException(
                                                "Dịch vụ AI gặp lỗi nội bộ",
                                                HttpStatus.BAD_GATEWAY);
                                    })
                    )
                    .bodyToMono(VoiceProductExtractionResponse.class)
                    .retryWhen(Retry.backoff(1, Duration.ofSeconds(2))
                            .filter(this::isRetryableError)
                            .doBeforeRetry(signal ->
                                    log.warn("Retrying AI service call — attempt: {}, cause: {}",
                                            signal.totalRetries() + 1,
                                            signal.failure().getMessage()))
                    )
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();

        } catch (AppException e) {
            throw e;

        } catch (WebClientRequestException e) {
            log.error("Cannot connect to AI service: {}", e.getMessage());
            if (e.getCause() instanceof ConnectException) {
                throw new AppException(
                        "Không thể kết nối đến dịch vụ AI. Vui lòng thử lại sau.",
                        HttpStatus.SERVICE_UNAVAILABLE);
            }
            throw new AppException(
                    "Lỗi khi gọi dịch vụ AI: " + e.getMessage(),
                    HttpStatus.BAD_GATEWAY);

        } catch (WebClientResponseException e) {
            log.error("AI service response error: status={}, body={}",
                    e.getStatusCode(), e.getResponseBodyAsString());
            throw new AppException(
                    "Dịch vụ AI trả về lỗi: " + e.getStatusCode(),
                    HttpStatus.BAD_GATEWAY);

        } catch (Exception e) {
            if (e.getCause() instanceof ReadTimeoutException
                    || e instanceof java.util.concurrent.TimeoutException
                    || (e.getCause() != null && e.getCause() instanceof java.util.concurrent.TimeoutException)) {
                log.error("AI service timeout after {}ms", timeoutMs);
                throw new AppException(
                        "Dịch vụ AI phản hồi quá thời gian cho phép (" + (timeoutMs / 1000) + "s). Vui lòng thử lại.",
                        HttpStatus.GATEWAY_TIMEOUT);
            }

            log.error("Unexpected error calling AI service: ", e);
            throw new AppException(
                    "Lỗi không xác định khi gọi dịch vụ AI",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private boolean isRetryableError(Throwable throwable) {
        if (throwable instanceof WebClientRequestException) {
            return true;
        }
        if (throwable instanceof WebClientResponseException ex) {
            return ex.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE
                    || ex.getStatusCode() == HttpStatus.GATEWAY_TIMEOUT;
        }
        return false;
    }

    private void validateResponse(VoiceProductExtractionResponse response) {
        if (response == null) {
            log.error("AI service returned null response");
            throw new AppException(
                    "Phản hồi từ dịch vụ AI không hợp lệ (null)",
                    HttpStatus.BAD_GATEWAY);
        }

        if (response.getProductName() == null) {
            log.warn("AI service returned response without product_name field");
            throw new AppException(
                    "Không thể nhận diện sản phẩm từ nội dung giọng nói. Vui lòng nói rõ hơn tên sản phẩm.",
                    HttpStatus.UNPROCESSABLE_ENTITY);
        }

        validateConfidenceBounds(response);
    }

    private void validateConfidenceBounds(VoiceProductExtractionResponse response) {
        clampConfidence(response.getProductName());
        clampConfidence(response.getDescription());
        clampConfidence(response.getPricePerUnit());
        clampConfidence(response.getPriceUnit());
        clampConfidence(response.getQuantity());
        clampConfidence(response.getQuantityUnit());
        clampConfidence(response.getHarvestDate());
        clampConfidence(response.getFarmingMethod());
        clampConfidence(response.getLocation());
    }

    private void clampConfidence(com.capnong.dto.response.FieldWithConfidence field) {
        if (field != null && field.getConfidence() != null) {
            double c = field.getConfidence();
            if (c < 0.0) field.setConfidence(0.0);
            if (c > 1.0) field.setConfidence(1.0);
        }
    }
}

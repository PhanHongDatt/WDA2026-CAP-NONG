package com.capnong.service;

import com.capnong.dto.request.AiVoiceRequest;
import com.capnong.dto.request.VoiceTranscriptRequest;
import com.capnong.dto.response.VoiceProductExtractionResponse;
import com.capnong.exception.AppException;

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

/**
 * Service gọi AI microservice để trích xuất thông tin sản phẩm từ voice transcript.
 *
 * <p>Responsibilities:
 * <ul>
 *   <li>Map request FE → request AI service</li>
 *   <li>Gọi POST /ai/voice-to-product với timeout + retry</li>
 *   <li>Validate response structure</li>
 *   <li>Translate lỗi AI service thành AppException với HTTP status code phù hợp</li>
 * </ul>
 */
@Service
public class VoiceProductService {

    private static final Logger log = LoggerFactory.getLogger(VoiceProductService.class);
    private static final String AI_VOICE_ENDPOINT = "/ai/voice-to-product";

    private final WebClient aiServiceWebClient;

    @Value("${ai.service.timeout:15000}")
    private int timeoutMs;

    public VoiceProductService(WebClient aiServiceWebClient) {
        this.aiServiceWebClient = aiServiceWebClient;
    }

    /**
     * Trích xuất thông tin sản phẩm từ voice transcript.
     *
     * @param request transcript + language từ FE (đã validate)
     * @return kết quả trích xuất với confidence score cho từng field
     * @throws AppException với status 502/503/504 tùy loại lỗi
     */
    public VoiceProductExtractionResponse extractProductFromVoice(VoiceTranscriptRequest request) {
        log.info("Voice extraction requested — transcript length: {} chars, language: {}",
                request.getTranscript().length(), request.getLanguage());

        // 1. Build request body cho AI service
        AiVoiceRequest aiRequest = AiVoiceRequest.builder()
                .transcript(request.getTranscript().trim())
                .language(request.getLanguage())
                .build();

        // 2. Gọi AI service
        VoiceProductExtractionResponse response = callAiService(aiRequest);

        // 3. Validate response
        validateResponse(response);

        log.info("Voice extraction completed — product: {}, notes: {}",
                response.getProductName() != null ? response.getProductName().getValue() : "N/A",
                response.getProcessingNotes() != null ? response.getProcessingNotes().size() : 0);

        return response;
    }

    /**
     * Gọi AI service qua WebClient với retry 1 lần khi gặp 5xx hoặc connection error.
     */
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
            // Re-throw AppException as-is (already has proper status)
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
            // Timeout (java.util.concurrent.TimeoutException) hoặc lỗi khác
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

    /**
     * Kiểm tra lỗi có nên retry không.
     * Chỉ retry khi: connection refused, 503, hoặc timeout.
     */
    private boolean isRetryableError(Throwable throwable) {
        if (throwable instanceof WebClientRequestException) {
            return true; // Connection error
        }
        if (throwable instanceof WebClientResponseException ex) {
            return ex.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE
                    || ex.getStatusCode() == HttpStatus.GATEWAY_TIMEOUT;
        }
        return false;
    }

    /**
     * Validate response từ AI service — đảm bảo các field bắt buộc không null.
     */
    private void validateResponse(VoiceProductExtractionResponse response) {
        if (response == null) {
            log.error("AI service returned null response");
            throw new AppException(
                    "Phản hồi từ dịch vụ AI không hợp lệ (null)",
                    HttpStatus.BAD_GATEWAY);
        }

        // product_name là field quan trọng nhất — nếu null thì AI không trích xuất được gì
        if (response.getProductName() == null) {
            log.warn("AI service returned response without product_name field");
            throw new AppException(
                    "Không thể nhận diện sản phẩm từ nội dung giọng nói. Vui lòng nói rõ hơn tên sản phẩm.",
                    HttpStatus.UNPROCESSABLE_ENTITY);
        }

        // Validate confidence bounds
        validateConfidenceBounds(response);
    }

    /**
     * Đảm bảo confidence score nằm trong khoảng [0.0, 1.0].
     * AI có thể trả giá trị ngoài khoảng → clamp về 0.0–1.0.
     */
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

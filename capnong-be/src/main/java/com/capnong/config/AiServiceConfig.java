package com.capnong.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

/**
 * Cấu hình WebClient để gọi AI microservice (FastAPI).
 * Sử dụng non-blocking HTTP client với timeout và memory limit.
 */
@Configuration
public class AiServiceConfig {

    @Value("${ai.service.base-url}")
    private String baseUrl;

    @Value("${ai.service.timeout:15000}")
    private int timeoutMs;

    @Bean
    public WebClient aiServiceWebClient() {
        // Netty HttpClient với connection + read/write timeout
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, timeoutMs)
                .responseTimeout(Duration.ofMillis(timeoutMs))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(timeoutMs, TimeUnit.MILLISECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(timeoutMs, TimeUnit.MILLISECONDS))
                );

        // Tăng buffer size lên 512KB (AI response có thể lớn)
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(cfg -> cfg.defaultCodecs().maxInMemorySize(512 * 1024))
                .build();

        return WebClient.builder()
                .baseUrl(Objects.requireNonNull(baseUrl, "ai.service.base-url must be configured"))
                .clientConnector(new ReactorClientHttpConnector(Objects.requireNonNull(httpClient)))
                .exchangeStrategies(strategies)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}

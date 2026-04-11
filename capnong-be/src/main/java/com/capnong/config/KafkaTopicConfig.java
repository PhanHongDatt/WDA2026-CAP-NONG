package com.capnong.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Tạo Kafka topics tự động khi ứng dụng khởi động.
 */
@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic voiceExtractionRequestTopic() {
        return TopicBuilder.name("ai.voice.extraction.request")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic voiceExtractionResultTopic() {
        return TopicBuilder.name("ai.voice.extraction.result")
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic refineRequestTopic() {
        return TopicBuilder.name("ai.refine.request")
                .partitions(2)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic refineResultTopic() {
        return TopicBuilder.name("ai.refine.result")
                .partitions(2)
                .replicas(1)
                .build();
    }
}

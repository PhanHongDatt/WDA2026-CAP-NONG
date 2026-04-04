package com.capnong.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Objects;

/**
 * Redis configuration for caching and RedisTemplate.
 * <p>
 * - Enables Spring Cache abstraction (@Cacheable, @CacheEvict, @CachePut)
 * - Configures RedisTemplate with Jackson JSON serializer for values
 * - Sets default cache TTL to 10 minutes
 */
@Configuration
@EnableCaching
public class RedisConfig {

    /**
     * Configures a RedisTemplate with:
     * - StringRedisSerializer for keys (readable key format)
     * - GenericJackson2JsonRedisSerializer for values (JSON storage)
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(Objects.requireNonNull(connectionFactory));

        // Key serializer: plain string
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        // Value serializer: Jackson JSON
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(Objects.requireNonNull(redisObjectMapper()));
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }

    /**
     * Configures the RedisCacheManager with a default TTL of 10 minutes
     * and JSON serialization for cached values.
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer(Objects.requireNonNull(redisObjectMapper()));

        RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Objects.requireNonNull(Duration.ofMinutes(10)))
                .serializeKeysWith(Objects.requireNonNull(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer())))
                .serializeValuesWith(Objects.requireNonNull(
                        RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer)))
                .disableCachingNullValues();

        return RedisCacheManager.builder(Objects.requireNonNull(connectionFactory))
                .cacheDefaults(cacheConfig)
                .transactionAware()
                .build();
    }

    /**
     * Creates an ObjectMapper configured for Redis serialization:
     * - Supports Java 8 date/time types
     * - Includes type information for polymorphic deserialization
     * - Accesses all fields regardless of visibility
     */
    private ObjectMapper redisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        return mapper;
    }
}

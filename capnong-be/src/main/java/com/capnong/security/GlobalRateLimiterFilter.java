package com.capnong.security;

import com.capnong.exception.RateLimitExceededException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;
import java.time.Duration;

@Component
public class GlobalRateLimiterFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redisTemplate;
    private final HandlerExceptionResolver resolver;

    private static final int MAX_REQUESTS_PER_MINUTE = 100;

    public GlobalRateLimiterFilter(StringRedisTemplate redisTemplate,
                                   @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolver) {
        this.redisTemplate = redisTemplate;
        this.resolver = resolver;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestIp = getClientIp(request);
        String key = "global_rate_limit:" + requestIp;

        try {
            Long requests = redisTemplate.opsForValue().increment(key);
            if (requests != null && requests == 1L) {
                redisTemplate.expire(key, Duration.ofMinutes(1));
            }

            if (requests != null && requests > MAX_REQUESTS_PER_MINUTE) {
                throw new RateLimitExceededException("Quá nhiều yêu cầu. Hệ thống đang bảo vệ tài nguyên, vui lòng thử lại sau 1 phút.");
            }
        } catch (RateLimitExceededException ex) {
            resolver.resolveException(request, response, null, ex);
            return;
        }

        filterChain.doFilter(request, response);
    }
}

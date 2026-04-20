package com.capnong.service;

import com.capnong.exception.AppException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class LoginRateLimiterService {

    private final StringRedisTemplate redisTemplate;
    
    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_TIME_DURATION_MINUTES = 15;

    private String getClientIp() {
        if (RequestContextHolder.getRequestAttributes() == null) {
            return "unknown";
        }
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    public void checkRateLimit(String identifier) {
        String requestIp = getClientIp();
        String ipKey = "login_attempt:ip:" + requestIp;
        String userKey = "login_attempt:user:" + identifier;

        checkKey(ipKey, "Quá nhiều lần đăng nhập từ địa chỉ IP này. Vui lòng thử lại sau " + LOCK_TIME_DURATION_MINUTES + " phút.");
        checkKey(userKey, "Tài khoản bị khóa tạm thời do nhập sai quá nhiều lần. Vui lòng thử lại sau " + LOCK_TIME_DURATION_MINUTES + " phút.");
    }
    
    private void checkKey(String key, String errorMessage) {
        String attemptsStr = redisTemplate.opsForValue().get(key);
        if (attemptsStr != null && Integer.parseInt(attemptsStr) >= MAX_ATTEMPTS) {
            throw new AppException(errorMessage, HttpStatus.TOO_MANY_REQUESTS);
        }
    }

    public int recordFailedAttempt(String identifier) {
        String requestIp = getClientIp();
        incrementAttempt("login_attempt:ip:" + requestIp);
        Long attemptsLong = incrementAttempt("login_attempt:user:" + identifier);
        int attempts = (attemptsLong != null) ? attemptsLong.intValue() : 1;
        int remaining = MAX_ATTEMPTS - attempts;
        return Math.max(0, remaining);
    }
    
    public void resetAttempts(String identifier) {
        String requestIp = getClientIp();
        redisTemplate.delete("login_attempt:ip:" + requestIp);
        redisTemplate.delete("login_attempt:user:" + identifier);
    }

    private Long incrementAttempt(String key) {
        Long attempts = redisTemplate.opsForValue().increment(key);
        if (attempts != null && attempts == 1L) {
            redisTemplate.expire(key, Duration.ofMinutes(LOCK_TIME_DURATION_MINUTES));
        }
        return attempts;
    }
}

package com.capnong.service;

public interface LoginRateLimiterService {
    void checkRateLimit(String identifier);
    int recordFailedAttempt(String identifier);
    void resetAttempts(String identifier);
}

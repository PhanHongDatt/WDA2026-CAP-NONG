package com.capnong.service.impl;

import com.capnong.exception.AppException;
import com.capnong.service.OtpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Mock implementation of OtpService for development.
 * In a real scenario, this would use Redis for storage and Twilio/Firebase for SMS.
 */
@Service
@Primary
public class MockOtpServiceImpl implements OtpService {

    private static final Logger logger = LoggerFactory.getLogger(MockOtpServiceImpl.class);

    // In-memory mock storage: identifier -> otp_code. Use Redis in production.
    private final Map<String, String> mockOtpStorage = new ConcurrentHashMap<>();

    @Override
    public void sendOtp(String identifier) {
        // Generate a standard test OTP "123456" for dev. 
        // In reality, random 6 digits: String.format("%06d", new Random().nextInt(999999))
        String code = "123456";
        
        mockOtpStorage.put(identifier, code);
        
        String type = identifier.contains("@") ? "EMAIL" : "SMS";
        
        // Log to console instead of sending SMS/Email
        logger.info("========================================");
        logger.info("MOCK {}: Gửi mã OTP [{}] đến {}", type, code, identifier);
        logger.info("========================================");
    }

    @Override
    public void verifyOtp(String identifier, String code) {
        if (identifier == null || code == null) {
            throw new AppException("Thông tin định danh và mã OTP là bắt buộc", HttpStatus.BAD_REQUEST);
        }

        String storedCode = mockOtpStorage.get(identifier);
        
        if (storedCode == null) {
            throw new AppException("Mã OTP đã hết hạn hoặc chưa được gửi", HttpStatus.BAD_REQUEST);
        }

        if (!storedCode.equals(code)) {
            throw new AppException("Mã OTP không chính xác", HttpStatus.BAD_REQUEST);
        }

        // OTP verified successfully, clear it
        mockOtpStorage.remove(identifier);
        String type = identifier.contains("@") ? "EMAIL" : "SMS";
        logger.info("MOCK {}: Xác minh OTP thành công cho {}", type, identifier);
    }
}

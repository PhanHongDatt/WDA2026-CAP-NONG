package com.capnong.service;

public interface OtpService {

    /**
     * Gửi mã OTP xác nhận đến SĐT hoặc Email.
     */
    void sendOtp(String identifier);

    /**
     * Xác minh mã OTP. Ném ra AppException nếu không hợp lệ hoặc hết hạn.
     */
    void verifyOtp(String identifier, String code);
}

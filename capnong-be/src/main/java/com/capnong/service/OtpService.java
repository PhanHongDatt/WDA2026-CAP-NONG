package com.capnong.service;

public interface OtpService {

    /**
     * Gửi mã OTP xác nhận đến số điện thoại.
     */
    void sendOtp(String phone);

    /**
     * Xác minh mã OTP. Ném ra AppException nếu không hợp lệ hoặc hết hạn.
     */
    void verifyOtp(String phone, String code);
}

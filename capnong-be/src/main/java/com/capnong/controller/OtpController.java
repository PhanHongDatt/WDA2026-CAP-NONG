package com.capnong.controller;

import com.capnong.dto.request.OtpRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/otp")
@Tag(name = "OTP Verification", description = "Gửi và xác minh OTP qua SMS")
public class OtpController {

    private final OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping("/send")
    @Operation(summary = "Yêu cầu gửi OTP", description = "Gửi mã OTP qua SMS. (Dev mode: luôn trả về 123456 trong console log)")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody OtpRequest request) {
        otpService.sendOtp(request.getPhone());
        return ResponseEntity.ok(ApiResponse.success("Mã OTP đã được gửi đến số điện thoại của bạn"));
    }

    @PostMapping("/verify")
    @Operation(summary = "Xác nhận OTP", description = "Xác nhận mã OTP người dùng nhập vào. Trả lỗi nếu sai hoặc hết hạn.")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody OtpRequest request) {
        otpService.verifyOtp(request.getPhone(), request.getCode());
        return ResponseEntity.ok(ApiResponse.success("Xác nhận mã OTP thành công"));
    }
}

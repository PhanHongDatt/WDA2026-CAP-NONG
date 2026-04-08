package com.capnong.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckoutRequest {
    @Email(message = "Invalid email format")
    private String guestEmail;

    @Pattern(regexp = "^(0|\\+84)\\d{9}$", message = "Invalid Vietnamese phone number")
    private String guestPhone;

    private String guestName;

    private String streetAddress; // Địa chỉ cụ thể (Số nhà, tên đường)
    private String wardCode;      // Mã Xã/Phường (từ select box)
    private String provinceCode;  // Mã Tỉnh/Thành phố (từ select box)
    private String orderNotes;    // Ghi chú thêm

    private String otpCode;
}

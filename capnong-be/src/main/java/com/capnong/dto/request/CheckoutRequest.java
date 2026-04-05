package com.capnong.dto.request;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckoutRequest {
    @Email(message = "Invalid email format")
    private String guestEmail;

    private String guestPhone;
}

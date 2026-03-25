package com.capnong.dto.request;

import com.capnong.model.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CheckoutRequest {
    @NotNull @Valid private AddressDto shippingAddress;
    @NotNull private PaymentMethod paymentMethod;
    private String note;
    private String guestToken;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AddressDto {
        @NotBlank private String fullName;
        @NotBlank private String phone;
        @NotBlank private String street;
        @NotBlank private String district;
        @NotBlank private String province;
    }
}

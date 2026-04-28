package com.capnong.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderResponseDto {
    private UUID id;
    private String orderCode;
    private UserSummaryDto buyer;
    private String guestPhone;
    private List<SubOrderDto> subOrders;
    private AddressDto shippingAddress;
    private String paymentMethod;
    private String paymentStatus;
    private Double totalPrice;
    private LocalDateTime createdAt;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SubOrderDto {
        private UUID id;
        private String orderCode;
        private String buyerName;
        private String buyerPhone;
        private LocalDateTime createdAt;
        private ShopResponseDto shop;
        private List<CartResponseDto.CartItemDto> items;
        private Double subtotal;
        private String status;
        private String cancelReason;
        private String cancelledBy;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AddressDto {
        private String fullName;
        private String phone;
        private String street;
        private String ward;
        private String province;
    }
}

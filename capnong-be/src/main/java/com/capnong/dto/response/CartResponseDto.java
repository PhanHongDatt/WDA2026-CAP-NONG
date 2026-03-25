package com.capnong.dto.response;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CartResponseDto {
    private UUID id;
    private List<CartItemDto> items;
    private Double totalPrice;
    private Integer totalShops;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CartItemDto {
        private UUID id;
        private ProductResponseDto product;
        private Double quantity;
        private Double subtotal;
    }
}

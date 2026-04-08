package com.capnong.dto.response;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
public class CartItemResponse {
    private UUID id;
    private UUID productId;
    private String productName;
    private BigDecimal quantity;
    private BigDecimal pricePerUnit;
}

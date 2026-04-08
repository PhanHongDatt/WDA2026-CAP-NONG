package com.capnong.dto.response;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class CartResponse {
    private UUID id;
    private String guestSessionId;
    private UUID userId;
    private List<CartItemResponse> items;
}

package com.capnong.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class CartResponse {
    private Long id;
    private String guestSessionId;
    private Long userId;
    private List<CartItemResponse> items;
}

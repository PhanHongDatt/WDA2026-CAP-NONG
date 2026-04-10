package com.capnong.service;

import com.capnong.dto.request.AddToCartRequest;
import com.capnong.dto.response.CartResponse;

import java.util.UUID;

public interface CartService {
    CartResponse addToCart(String guestSessionId, UUID userId, AddToCartRequest request);
    CartResponse getCart(String guestSessionId, UUID userId);
    void mergeGuestCartToUser(String guestSessionId, UUID userId);
    void clearCart(String guestSessionId, UUID userId);
}

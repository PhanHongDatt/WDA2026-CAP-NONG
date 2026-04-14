package com.capnong.service;

import com.capnong.dto.request.AddToCartRequest;
import com.capnong.dto.response.CartResponse;

import java.math.BigDecimal;
import java.util.UUID;

public interface CartService {
    CartResponse addToCart(String guestSessionId, UUID userId, AddToCartRequest request);
    CartResponse getCart(String guestSessionId, UUID userId);
    CartResponse updateCartItem(String guestSessionId, UUID userId, UUID itemId, BigDecimal quantity);
    CartResponse removeCartItem(String guestSessionId, UUID userId, UUID itemId);
    void mergeGuestCartToUser(String guestSessionId, UUID userId);
    void clearCart(String guestSessionId, UUID userId);
}

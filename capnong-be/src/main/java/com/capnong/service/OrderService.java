package com.capnong.service;

import com.capnong.dto.request.CheckoutRequest;
import com.capnong.dto.response.OrderResponse;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderResponse checkout(String guestSessionId, UUID userId, CheckoutRequest checkoutRequest);
    void mergeGuestOrdersToUser(String phone, String email, UUID userId);
    List<OrderResponse> getMyOrders(UUID userId);
}

package com.capnong.service;

import com.capnong.dto.request.CheckoutRequest;
import com.capnong.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface OrderService {
    OrderResponse checkout(String guestSessionId, UUID userId, CheckoutRequest checkoutRequest);
    void mergeGuestOrdersToUser(String phone, String email, UUID userId);
    Page<OrderResponse> getMyOrders(UUID userId, String status, Pageable pageable);
}

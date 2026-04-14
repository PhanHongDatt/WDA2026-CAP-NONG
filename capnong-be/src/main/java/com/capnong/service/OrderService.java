package com.capnong.service;

import com.capnong.dto.request.CheckoutRequest;
import com.capnong.dto.request.UpdateSubOrderStatusRequest;
import com.capnong.dto.response.OrderResponseDto;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderResponseDto checkout(String guestSessionId, UUID userId, CheckoutRequest checkoutRequest);
    OrderResponseDto getOrderDetail(UUID orderId, UUID userId);
    OrderResponseDto getGuestOrder(String orderCode, String phone);
    List<OrderResponseDto> getMyOrders(UUID userId);
    List<OrderResponseDto.SubOrderDto> getSellerSubOrders(UUID sellerId, String status);
    void cancelOrder(UUID orderId, UUID userId);
    void updateSubOrderStatus(UUID subOrderId, UUID sellerId, UpdateSubOrderStatusRequest request);
    void mergeGuestOrdersToUser(String phone, String email, UUID userId);
}

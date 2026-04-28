package com.capnong.service;

import com.capnong.dto.request.CheckoutRequest;
import com.capnong.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.capnong.dto.request.UpdateSubOrderStatusRequest;
import com.capnong.dto.response.OrderResponseDto;

import java.util.UUID;

public interface OrderService {
    OrderResponseDto checkout(String guestSessionId, UUID userId, CheckoutRequest checkoutRequest);
    OrderResponseDto getOrderDetail(UUID orderId, UUID userId);
    OrderResponseDto getGuestOrder(String orderCode, String phone);
    Page<OrderResponseDto> getMyOrders(UUID userId, String status, Pageable pageable);
    Page<OrderResponseDto.SubOrderDto> getSellerSubOrders(UUID sellerId, String status, Pageable pageable);
    void cancelOrder(UUID orderId, UUID userId);
    void cancelGuestOrder(String orderCode, String phone);
    void updateSubOrderStatus(UUID subOrderId, UUID sellerId, UpdateSubOrderStatusRequest request);
    OrderResponseDto.SubOrderDto getSellerSubOrderDetail(UUID subOrderId, UUID sellerId);
    Page<OrderResponseDto.SubOrderDto> getSubOrdersByShopId(UUID shopId, UUID ownerId, String status, Pageable pageable);
    int mergeGuestOrdersToUser(String phone, String email, UUID userId);
}

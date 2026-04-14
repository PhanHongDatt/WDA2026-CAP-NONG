package com.capnong.service.impl;

import com.capnong.dto.request.CheckoutRequest;
import com.capnong.dto.response.OrderResponse;
import com.capnong.exception.InsufficientStockException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.mapper.OrderMapper;
import com.capnong.model.*;
import com.capnong.model.enums.OrderStatus;
import com.capnong.repository.CartRepository;
import com.capnong.repository.OrderRepository;
import com.capnong.repository.ProductRepository;
import com.capnong.repository.UserRepository;
import com.capnong.service.AddressService;
import com.capnong.service.CartService;
import com.capnong.service.OrderService;
import com.capnong.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final OtpService otpService;
    private final AddressService addressService;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public OrderResponse checkout(String guestSessionId, UUID userId, CheckoutRequest checkoutRequest) {
        Cart cart;
        User user = null;

        if (userId != null) {
            cart = cartRepository.findByUser_Id(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        } else {
            if (checkoutRequest.getGuestPhone() == null || checkoutRequest.getOtpCode() == null) {
                throw new IllegalArgumentException("Khách vãng lai cần nhập số điện thoại và mã OTP");
            }
            if (checkoutRequest.getGuestName() == null || checkoutRequest.getStreetAddress() == null
                    || checkoutRequest.getProvinceCode() == null) {
                throw new IllegalArgumentException("Khách vãng lai cần nhập họ tên, địa chỉ và tỉnh/thành phố");
            }

            otpService.verifyOtp(checkoutRequest.getGuestPhone(), checkoutRequest.getOtpCode());

            cart = cartRepository.findByGuestSessionId(guestSessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        }

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        String provinceName = addressService.getProvinceName(checkoutRequest.getProvinceCode());
        String wardName = addressService.getWardName(checkoutRequest.getWardCode());

        Order order = Order.builder()
                .orderNumber(UUID.randomUUID().toString())
                .user(user)
                .guestEmail(checkoutRequest.getGuestEmail())
                .guestPhone(checkoutRequest.getGuestPhone())
                .guestName(checkoutRequest.getGuestName())
                .streetAddress(checkoutRequest.getStreetAddress())
                .wardCode(checkoutRequest.getWardCode())
                .wardName(wardName)
                .provinceCode(checkoutRequest.getProvinceCode())
                .provinceName(provinceName)
                .orderNotes(checkoutRequest.getOrderNotes())
                .status(OrderStatus.PENDING)
                .isMerged(false)
                .items(new ArrayList<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findByIdWithLock(cartItem.getProduct().getId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Product not found: " + cartItem.getProduct().getId()));

            if (product.getAvailableQuantity().compareTo(cartItem.getQuantity()) < 0) {
                throw new InsufficientStockException("Not enough stock for product: " + product.getName() +
                        ". Available: " + product.getAvailableQuantity() +
                        ", Requested: " + cartItem.getQuantity());
            }

            product.setAvailableQuantity(product.getAvailableQuantity().subtract(cartItem.getQuantity()));
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .pricePerUnit(product.getPricePerUnit())
                    .build();

            order.getItems().add(orderItem);
            totalAmount = totalAmount.add(product.getPricePerUnit().multiply(cartItem.getQuantity()));
        }

        order.setTotalAmount(totalAmount);
        orderRepository.save(order);

        cartService.clearCart(guestSessionId, userId);

        return mapToOrderResponse(order);
    }

    @Override
    @Transactional
    public void mergeGuestOrdersToUser(String phone, String email, UUID userId) {
        if (userId == null)
            return;

        List<Order> unmergedOrders = orderRepository.findUnmergedGuestOrders(phone, email);
        if (unmergedOrders.isEmpty())
            return;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        for (Order order : unmergedOrders) {
            order.setUser(user);
            order.setIsMerged(true);
            orderRepository.save(order);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getMyOrders(UUID userId, String status, Pageable pageable) {
        Page<Order> orders;
        if (status != null && !status.isBlank()) {
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                orders = orderRepository.findByUser_IdAndStatusOrderByCreatedAtDesc(userId, orderStatus, pageable);
            } catch (IllegalArgumentException e) {
                orders = orderRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);
            }
        } else {
            orders = orderRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);
        }
        return orders.map(this::mapToOrderResponse);
    }

    /**
     * Order mapping is complex (nested items with null checks), so we keep it partially manual.
     * OrderMapper handles individual OrderItem mapping.
     */
    private OrderResponse mapToOrderResponse(Order order) {
        var itemResponses = (order.getItems() == null || order.getItems().isEmpty())
                ? Collections.<com.capnong.dto.response.OrderItemResponse>emptyList()
                : order.getItems().stream()
                        .map(orderMapper::toOrderItemResponse)
                        .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .guestEmail(order.getGuestEmail())
                .guestPhone(order.getGuestPhone())
                .guestName(order.getGuestName())
                .streetAddress(order.getStreetAddress())
                .wardCode(order.getWardCode())
                .wardName(order.getWardName())
                .provinceCode(order.getProvinceCode())
                .provinceName(order.getProvinceName())
                .orderNotes(order.getOrderNotes())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .isMerged(order.getIsMerged())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}

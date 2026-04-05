package com.capnong.service;

import com.capnong.dto.request.CheckoutRequest;
import com.capnong.dto.response.OrderItemResponse;
import com.capnong.dto.response.OrderResponse;
import com.capnong.exception.InsufficientStockException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.model.*;
import com.capnong.model.enums.OrderStatus;
import com.capnong.repository.CartRepository;
import com.capnong.repository.OrderRepository;
import com.capnong.repository.ProductRepository;
import com.capnong.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartService cartService;

    @Transactional
    public OrderResponse checkout(String guestSessionId, Long userId, CheckoutRequest checkoutRequest) {
        Cart cart;
        User user = null;

        if (userId != null) {
            cart = cartRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        } else {
            cart = cartRepository.findByGuestSessionId(guestSessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        }

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        Order order = Order.builder()
                .orderNumber(UUID.randomUUID().toString())
                .user(user)
                .guestEmail(checkoutRequest.getGuestEmail())
                .guestPhone(checkoutRequest.getGuestPhone())
                .status(OrderStatus.PENDING)
                .isMerged(false)
                .items(new ArrayList<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            // Locking the product to prevent Race Condition
            Product product = productRepository.findByIdWithLock(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + cartItem.getProduct().getId()));

            if (product.getAvailableQuantity().compareTo(cartItem.getQuantity()) < 0) {
                throw new InsufficientStockException("Not enough stock for product: " + product.getName() +
                        ". Available: " + product.getAvailableQuantity() +
                        ", Requested: " + cartItem.getQuantity());
            }

            // Deduct inventory
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

        // Clear cart after successful checkout
        cartService.clearCart(guestSessionId, userId);

        return mapToOrderResponse(order);
    }

    @Transactional
    public void mergeGuestOrdersToUser(String phone, String email, Long userId) {
        if (userId == null) return;
        
        List<Order> unmergedOrders = orderRepository.findUnmergedGuestOrders(phone, email);
        if (unmergedOrders.isEmpty()) return;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        for (Order order : unmergedOrders) {
            order.setUser(user);
            order.setIsMerged(true);
            orderRepository.save(order);
        }
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse mapToOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .guestEmail(order.getGuestEmail())
                .guestPhone(order.getGuestPhone())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .isMerged(order.getIsMerged())
                .createdAt(order.getCreatedAt())
                .items(order.getItems() == null ? new ArrayList<>() : order.getItems().stream()
                        .map(item -> OrderItemResponse.builder()
                                .id(item.getId())
                                .productId(item.getProduct().getId())
                                .productName(item.getProduct().getName())
                                .quantity(item.getQuantity())
                                .pricePerUnit(item.getPricePerUnit())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}

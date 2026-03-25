package com.capnong.service;

import com.capnong.exception.AppException;
import com.capnong.model.*;
import com.capnong.model.enums.OrderStatus;
import com.capnong.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final SubOrderRepository subOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        SubOrderRepository subOrderRepository,
                        OrderItemRepository orderItemRepository,
                        CartRepository cartRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.subOrderRepository = subOrderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    /**
     * Tạo đơn hàng: tách sub-orders theo shop, lock inventory.
     */
    @Transactional
    public Order createOrder(UUID buyerId, String guestPhone, Order orderData, UUID cartId) {
        List<CartItem> cartItems = cartItemRepository.findByCartId(cartId);
        if (cartItems.isEmpty()) {
            throw new AppException("Giỏ hàng trống", HttpStatus.BAD_REQUEST);
        }

        // Generate order code
        orderData.setOrderCode(generateOrderCode());
        orderData.setBuyerId(buyerId);
        orderData.setGuestPhone(guestPhone);

        // Tính tổng + tách theo shop
        Map<UUID, List<CartItem>> itemsByShop = new HashMap<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        for (CartItem item : cartItems) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new AppException("Sản phẩm không tồn tại", HttpStatus.BAD_REQUEST));

            // Lock inventory
            if (product.getAvailableQuantity().compareTo(item.getQuantity()) < 0) {
                throw new AppException("Sản phẩm " + product.getName() + " không đủ số lượng", HttpStatus.CONFLICT);
            }
            product.setAvailableQuantity(product.getAvailableQuantity().subtract(item.getQuantity()));
            productRepository.save(product);

            totalPrice = totalPrice.add(product.getPricePerUnit().multiply(item.getQuantity()));
            itemsByShop.computeIfAbsent(product.getShopId(), k -> new ArrayList<>()).add(item);
        }

        orderData.setTotalPrice(totalPrice);
        Order savedOrder = orderRepository.save(orderData);

        // Tạo sub-orders theo shop
        for (var entry : itemsByShop.entrySet()) {
            BigDecimal subtotal = BigDecimal.ZERO;
            SubOrder subOrder = SubOrder.builder()
                    .orderId(savedOrder.getId())
                    .shopId(entry.getKey())
                    .subtotal(BigDecimal.ZERO)
                    .build();
            SubOrder savedSub = subOrderRepository.save(subOrder);

            for (CartItem cartItem : entry.getValue()) {
                Product product = productRepository.findById(cartItem.getProductId()).get();
                BigDecimal itemTotal = product.getPricePerUnit().multiply(cartItem.getQuantity());
                subtotal = subtotal.add(itemTotal);

                OrderItem orderItem = OrderItem.builder()
                        .subOrderId(savedSub.getId())
                        .productId(product.getId())
                        .productNameSnapshot(product.getName())
                        .unitCodeSnapshot(product.getUnitCode())
                        .priceSnapshot(product.getPricePerUnit())
                        .quantity(cartItem.getQuantity())
                        .subtotal(itemTotal)
                        .build();
                orderItemRepository.save(orderItem);
            }
            savedSub.setSubtotal(subtotal);
            subOrderRepository.save(savedSub);
        }

        // Clear cart
        cartItemRepository.deleteByCartId(cartId);

        return savedOrder;
    }

    public Page<Order> getBuyerOrders(UUID buyerId, Pageable pageable) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId, pageable);
    }

    public Order getByCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND));
    }

    public Order guestLookup(String orderCode, String phone) {
        return orderRepository.findByOrderCodeAndGuestPhone(orderCode, phone)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND));
    }

    public List<SubOrder> getSubOrders(UUID orderId) {
        return subOrderRepository.findByOrderId(orderId);
    }

    public List<SubOrder> getSellerOrders(UUID shopId) {
        return subOrderRepository.findByShopIdOrderByCreatedAtDesc(shopId);
    }

    @Transactional
    public SubOrder updateSubOrderStatus(UUID subOrderId, OrderStatus newStatus) {
        SubOrder subOrder = subOrderRepository.findById(subOrderId)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn hàng con", HttpStatus.NOT_FOUND));
        subOrder.setStatus(newStatus);
        return subOrderRepository.save(subOrder);
    }

    private String generateOrderCode() {
        return "CN" + System.currentTimeMillis();
    }
}

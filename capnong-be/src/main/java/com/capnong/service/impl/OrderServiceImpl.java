package com.capnong.service.impl;

import com.capnong.dto.request.CheckoutRequest;
import com.capnong.dto.request.UpdateSubOrderStatusRequest;
import com.capnong.dto.response.InventoryConflictDto;
import com.capnong.dto.response.OrderResponseDto;
import com.capnong.dto.response.CartResponseDto;
import com.capnong.dto.response.ShopResponseDto;
import com.capnong.dto.response.UserSummaryDto;
import com.capnong.exception.AppException;
import com.capnong.exception.InsufficientStockException;
import com.capnong.exception.ResourceNotFoundException;
import com.capnong.model.*;
import com.capnong.model.enums.*;
import com.capnong.repository.*;
import com.capnong.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final BigDecimal FLAT_SHIPPING_FEE = new BigDecimal("30000");

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final SubOrderRepository subOrderRepository;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final CartService cartService;
    private final OtpService otpService;
    private final AddressService addressService;
    private final OrderEventNotifier orderEventNotifier;

    @Override
    @Transactional
    public OrderResponseDto checkout(String guestSessionId, UUID userId, CheckoutRequest req) {
        Cart cart;
        User user = null;

        if (userId != null) {
            cart = cartRepository.findByUser_Id(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        } else {
            // Guest checkout: requires OTP
            if (req.getGuestPhone() == null || req.getOtpCode() == null) {
                throw new IllegalArgumentException("Khách vãng lai cần nhập số điện thoại và mã OTP");
            }
            if (req.getGuestName() == null || req.getStreetAddress() == null || req.getProvinceCode() == null) {
                throw new IllegalArgumentException("Khách vãng lai cần nhập họ tên, địa chỉ và tỉnh/thành phố");
            }
            otpService.verifyOtp(req.getGuestPhone(), req.getOtpCode());
            cart = cartRepository.findByGuestSessionId(guestSessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        }

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Giỏ hàng trống");
        }

        // Resolve address names
        String provinceName = addressService.getProvinceName(req.getProvinceCode());
        String wardName = addressService.getWardName(req.getWardCode());

        // ── Step 1: Group cart items by shop ──
        Map<UUID, List<CartItem>> itemsByShop = cart.getItems().stream()
                .collect(Collectors.groupingBy(ci -> ci.getProduct().getShop().getId()));

        // ── Step 2: Lock products and check stock ──
        List<InventoryConflictDto> conflicts = new ArrayList<>();
        Map<UUID, Product> lockedProducts = new HashMap<>();

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findByIdWithLock(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found: " + cartItem.getProduct().getId()));
            lockedProducts.put(product.getId(), product);

            if (product.getAvailableQuantity().compareTo(cartItem.getQuantity()) < 0) {
                conflicts.add(InventoryConflictDto.builder()
                        .productId(product.getId())
                        .productName(product.getName())
                        .requestedQuantity(cartItem.getQuantity())
                        .availableQuantity(product.getAvailableQuantity())
                        .build());
            }
        }

        // If any product insufficient → rollback (transactional) with 409
        if (!conflicts.isEmpty()) {
            throw new InsufficientStockException("Một số sản phẩm không đủ tồn kho", conflicts);
        }

        // ── Step 3: Create Order ──
        PaymentMethod pm = req.getPaymentMethod() != null ? req.getPaymentMethod() : PaymentMethod.COD;

        Order order = Order.builder()
                .orderNumber(generateOrderCode())
                .user(user)
                .guestEmail(req.getGuestEmail())
                .guestPhone(req.getGuestPhone())
                .guestName(req.getGuestName())
                .streetAddress(req.getStreetAddress())
                .wardCode(req.getWardCode())
                .wardName(wardName)
                .provinceCode(req.getProvinceCode())
                .provinceName(provinceName)
                .orderNotes(req.getOrderNotes())
                .status(OrderStatus.PENDING)
                .paymentMethod(pm)
                .paymentStatus(pm == PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.PENDING)
                .isMerged(false)
                .totalAmount(BigDecimal.ZERO)
                .subOrders(new LinkedHashSet<>())
                .build();

        BigDecimal grandTotal = BigDecimal.ZERO;

        // ── Step 4: Create SubOrders per shop ──
        for (Map.Entry<UUID, List<CartItem>> entry : itemsByShop.entrySet()) {
            UUID shopId = entry.getKey();
            List<CartItem> shopItems = entry.getValue();

            Shop shop = shopRepository.findById(shopId)
                    .orElseThrow(() -> new ResourceNotFoundException("Shop not found: " + shopId));

            SubOrder subOrder = SubOrder.builder()
                    .order(order)
                    .shop(shop)
                    .status(OrderStatus.PENDING)
                    .shippingFee(FLAT_SHIPPING_FEE)
                    .subtotal(BigDecimal.ZERO)
                    .items(new LinkedHashSet<>())
                    .build();

            BigDecimal subtotal = BigDecimal.ZERO;

            for (CartItem cartItem : shopItems) {
                Product product = lockedProducts.get(cartItem.getProduct().getId());

                // Deduct inventory
                product.setAvailableQuantity(product.getAvailableQuantity().subtract(cartItem.getQuantity()));
                // Auto-set OUT_OF_STOCK
                if (product.getAvailableQuantity().compareTo(BigDecimal.ZERO) == 0) {
                    product.setStatus(ProductStatus.OUT_OF_STOCK);
                }
                productRepository.save(product);

                OrderItem orderItem = OrderItem.builder()
                        .subOrder(subOrder)
                        .product(product)
                        .quantity(cartItem.getQuantity())
                        .pricePerUnit(product.getPricePerUnit())
                        .build();

                subOrder.getItems().add(orderItem);
                subtotal = subtotal.add(product.getPricePerUnit().multiply(cartItem.getQuantity()));
            }

            subOrder.setSubtotal(subtotal);
            order.getSubOrders().add(subOrder);
            grandTotal = grandTotal.add(subtotal).add(FLAT_SHIPPING_FEE);
        }

        order.setTotalAmount(grandTotal);
        Order savedOrder = orderRepository.save(order);

        // Clear cart after checkout
        cartService.clearCart(guestSessionId, userId);

        // Fire notifications to farmers
        orderEventNotifier.notifyNewOrder(savedOrder, savedOrder.getSubOrders());

        return mapToOrderResponseDto(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDto getOrderDetail(UUID orderId, UUID userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

        // Verify ownership: buyer sees own orders
        if (order.getUser() != null && !order.getUser().getId().equals(userId)) {
            throw new AppException("Bạn không có quyền xem đơn hàng này", HttpStatus.FORBIDDEN);
        }

        return mapToOrderResponseDto(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDto getGuestOrder(String orderCode, String phone) {
        Order order = orderRepository.findByOrderNumberAndGuestPhone(orderCode, phone)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng"));
        return mapToOrderResponseDto(order);
    }

    // getMyOrders list method removed in favor of paginated version.

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponseDto.SubOrderDto> getSellerSubOrders(UUID sellerId, String status, Pageable pageable) {
        // Find seller's shop
        Shop shop = shopRepository.findByOwner_Id(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Bạn chưa có gian hàng"));

        Page<SubOrder> subOrders;
        if (status != null && !status.isBlank()) {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            subOrders = subOrderRepository.findByShop_IdAndStatusOrderByCreatedAtDesc(shop.getId(), orderStatus, pageable);
        } else {
            subOrders = subOrderRepository.findByShop_IdOrderByCreatedAtDesc(shop.getId(), pageable);
        }

        return subOrders.map(this::mapToSubOrderDto);
    }

    @Override
    @Transactional
    public void cancelOrder(UUID orderId, UUID userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

        // Verify buyer ownership
        if (order.getUser() == null || !order.getUser().getId().equals(userId)) {
            throw new AppException("Bạn không có quyền hủy đơn hàng này", HttpStatus.FORBIDDEN);
        }

        // Check ALL sub-orders are PENDING
        boolean allPending = order.getSubOrders().stream()
                .allMatch(so -> so.getStatus() == OrderStatus.PENDING);
        if (!allPending) {
            throw new AppException("Chỉ có thể hủy khi tất cả đơn con đang ở trạng thái PENDING",
                    HttpStatus.BAD_REQUEST);
        }

        // Cancel all sub-orders + restore inventory
        for (SubOrder subOrder : order.getSubOrders()) {
            subOrder.setStatus(OrderStatus.CANCELLED);
            subOrder.setCancelledBy(CancelledBy.BUYER);
            subOrder.setCancelReason("Buyer hủy đơn");

            restoreInventory(subOrder);

            // Notify each farmer
            orderEventNotifier.notifyCancellation(subOrder, order, CancelledBy.BUYER);
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void updateSubOrderStatus(UUID subOrderId, UUID sellerId, UpdateSubOrderStatusRequest request) {
        SubOrder subOrder = subOrderRepository.findByIdAndShop_Owner_Id(subOrderId, sellerId)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn con hoặc bạn không có quyền",
                        HttpStatus.FORBIDDEN));

        OrderStatus newStatus = request.getStatus();

        // Validate cancel before SHIPPED
        if (newStatus == OrderStatus.CANCELLED) {
            if (subOrder.getStatus() == OrderStatus.SHIPPED || subOrder.getStatus() == OrderStatus.DELIVERED) {
                throw new AppException("Không thể hủy đơn đã giao/đang giao", HttpStatus.BAD_REQUEST);
            }
            if (request.getCancelReason() == null || request.getCancelReason().isBlank()) {
                throw new AppException("Vui lòng nhập lý do hủy đơn", HttpStatus.BAD_REQUEST);
            }
            subOrder.setCancelReason(request.getCancelReason());
            subOrder.setCancelledBy(CancelledBy.SELLER);

            // Restore inventory
            restoreInventory(subOrder);
        }

        // Validate forward-only status transitions
        validateStatusTransition(subOrder.getStatus(), newStatus);

        subOrder.setStatus(newStatus);
        subOrderRepository.save(subOrder);

        // Parent order is already loaded via lazy proxy — no need to re-fetch
        Order order = subOrder.getOrder();

        if (newStatus == OrderStatus.CANCELLED) {
            orderEventNotifier.notifyCancellation(subOrder, order, CancelledBy.SELLER);
        } else {
            orderEventNotifier.notifyStatusChange(subOrder, order);
        }

        // Increment totalSold on products when sub-order is delivered
        if (newStatus == OrderStatus.DELIVERED) {
            List<Product> productsToUpdate = new java.util.ArrayList<>();
            for (OrderItem item : subOrder.getItems()) {
                Product product = productRepository.findById(item.getProduct().getId()).orElse(null);
                if (product != null) {
                    product.setTotalSold(
                            (product.getTotalSold() != null ? product.getTotalSold() : 0)
                                    + item.getQuantity().intValue());
                    productsToUpdate.add(product);
                }
            }
            if (!productsToUpdate.isEmpty()) {
                productRepository.saveAll(productsToUpdate);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDto.SubOrderDto getSellerSubOrderDetail(UUID subOrderId, UUID sellerId) {
        SubOrder subOrder = subOrderRepository.findByIdAndShop_Owner_Id(subOrderId, sellerId)
                .orElseThrow(() -> new AppException("Không tìm thấy đơn con hoặc bạn không có quyền",
                        HttpStatus.FORBIDDEN));
        return mapToSubOrderDto(subOrder);
    }

    @Override
    @Transactional
    public void mergeGuestOrdersToUser(String phone, String email, UUID userId) {
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

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponseDto> getMyOrders(UUID userId, String status, Pageable pageable) {
        Page<Order> orders;
        if (status != null && !status.isBlank()) {
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                orders = orderRepository.findByUserIdAndStatusWithDetails(userId, orderStatus, pageable);
            } catch (IllegalArgumentException e) {
                orders = orderRepository.findByUserIdWithDetails(userId, pageable);
            }
        } else {
            orders = orderRepository.findByUserIdWithDetails(userId, pageable);
        }
        return orders.map(this::mapToOrderResponseDto);
    }

    // ─── Helpers ───

    private void restoreInventory(SubOrder subOrder) {
        for (OrderItem item : subOrder.getItems()) {
            Product product = productRepository.findByIdWithLock(item.getProduct().getId())
                    .orElse(null);
            if (product != null) {
                product.setAvailableQuantity(product.getAvailableQuantity().add(item.getQuantity()));
                if (product.getStatus() == ProductStatus.OUT_OF_STOCK
                        && product.getAvailableQuantity().compareTo(BigDecimal.ZERO) > 0) {
                    product.setStatus(ProductStatus.IN_SEASON); // Restore to in-season
                }
                productRepository.save(product);
            }
        }
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus target) {
        // Allowed forward transitions
        Map<OrderStatus, List<OrderStatus>> allowed = Map.of(
                OrderStatus.PENDING, List.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
                OrderStatus.CONFIRMED, List.of(OrderStatus.PREPARING, OrderStatus.CANCELLED),
                OrderStatus.PREPARING, List.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
                OrderStatus.SHIPPED, List.of(OrderStatus.DELIVERED)
        );

        List<OrderStatus> validTargets = allowed.getOrDefault(current, List.of());
        if (!validTargets.contains(target)) {
            throw new AppException(
                    "Không thể chuyển từ " + current + " sang " + target, HttpStatus.BAD_REQUEST);
        }
    }

    private String generateOrderCode() {
        // Format: CN-YYYYMMDD-XXXXX (short, human-readable)
        String datePart = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        return "CN-" + datePart + "-" + randomPart;
    }

    // ─── Mapping ───

    private OrderResponseDto mapToOrderResponseDto(Order order) {
        List<OrderResponseDto.SubOrderDto> subOrderDtos = order.getSubOrders() != null
                ? order.getSubOrders().stream().map(this::mapToSubOrderDto).collect(Collectors.toList())
                : List.of();

        UserSummaryDto buyerDto = null;
        if (order.getUser() != null) {
            User u = order.getUser();
            buyerDto = UserSummaryDto.builder()
                    .id(u.getId())
                    .fullName(u.getFullName())
                    .phone(u.getPhone())
                    .role(u.getRole().name())
                    .avatarUrl(u.getAvatarUrl())
                    .build();
        }

        OrderResponseDto.AddressDto addressDto = OrderResponseDto.AddressDto.builder()
                .fullName(order.getGuestName() != null ? order.getGuestName()
                        : (order.getUser() != null ? order.getUser().getFullName() : null))
                .phone(order.getGuestPhone() != null ? order.getGuestPhone()
                        : (order.getUser() != null ? order.getUser().getPhone() : null))
                .street(order.getStreetAddress())
                .district(order.getWardName())
                .province(order.getProvinceName())
                .build();

        return OrderResponseDto.builder()
                .id(order.getId())
                .orderCode(order.getOrderNumber())
                .buyer(buyerDto)
                .guestPhone(order.getGuestPhone())
                .subOrders(subOrderDtos)
                .shippingAddress(addressDto)
                .paymentMethod(order.getPaymentMethod().name())
                .paymentStatus(order.getPaymentStatus().name())
                .totalPrice(order.getTotalAmount().doubleValue())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderResponseDto.SubOrderDto mapToSubOrderDto(SubOrder subOrder) {
        Shop shop = subOrder.getShop();
        ShopResponseDto shopDto = shop != null ? ShopResponseDto.builder()
                .id(shop.getId())
                .slug(shop.getSlug())
                .name(shop.getName())
                .province(shop.getProvince())
                .district(shop.getDistrict())
                .avatarUrl(shop.getAvatarUrl())
                .build() : null;

        List<CartResponseDto.CartItemDto> itemDtos = subOrder.getItems() != null
                ? subOrder.getItems().stream().map(item -> {
                    Product p = item.getProduct();
                    return CartResponseDto.CartItemDto.builder()
                            .id(item.getId())
                            .product(com.capnong.dto.response.ProductResponseDto.builder()
                                    .id(p.getId())
                                    .name(p.getName())
                                    .pricePerUnit(p.getPricePerUnit().doubleValue())
                                    .build())
                            .quantity(item.getQuantity().doubleValue())
                            .subtotal(item.getPricePerUnit().multiply(item.getQuantity()).doubleValue())
                            .build();
                }).collect(Collectors.toList())
                : List.of();

        return OrderResponseDto.SubOrderDto.builder()
                .id(subOrder.getId())
                .shop(shopDto)
                .items(itemDtos)
                .subtotal(subOrder.getSubtotal().doubleValue())
                .status(subOrder.getStatus().name())
                .cancelReason(subOrder.getCancelReason())
                .cancelledBy(subOrder.getCancelledBy() != null ? subOrder.getCancelledBy().name() : null)
                .build();
    }
}

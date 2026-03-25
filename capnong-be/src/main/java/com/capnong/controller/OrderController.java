package com.capnong.controller;

import com.capnong.dto.response.ApiResponse;
import com.capnong.model.Order;
import com.capnong.model.SubOrder;
import com.capnong.model.enums.OrderStatus;
import com.capnong.model.enums.PaymentMethod;
import com.capnong.repository.CartRepository;
import com.capnong.repository.ShopRepository;
import com.capnong.security.UserDetailsImpl;
import com.capnong.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;
    private final CartRepository cartRepository;
    private final ShopRepository shopRepository;

    public OrderController(OrderService orderService,
                           CartRepository cartRepository,
                           ShopRepository shopRepository) {
        this.orderService = orderService;
        this.cartRepository = cartRepository;
        this.shopRepository = shopRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Order>> createOrder(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> body) {
        Order orderData = Order.builder()
                .shippingName((String) body.get("shippingName"))
                .shippingPhone((String) body.get("shippingPhone"))
                .shippingStreet((String) body.get("shippingStreet"))
                .shippingDistrict((String) body.get("shippingDistrict"))
                .shippingProvince((String) body.get("shippingProvince"))
                .paymentMethod(PaymentMethod.valueOf((String) body.get("paymentMethod")))
                .note((String) body.get("note"))
                .build();

        var cart = cartRepository.findByUserId(userDetails.getId())
                .orElseThrow(() -> new com.capnong.exception.AppException("Giỏ hàng trống", HttpStatus.BAD_REQUEST));

        Order created = orderService.createOrder(userDetails.getId(), null, orderData, cart.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đặt hàng thành công", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Order>>> getMyOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<Order> orders = orderService.getBuyerOrders(userDetails.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("OK", orders));
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrder(@PathVariable String code) {
        Order order = orderService.getByCode(code);
        List<SubOrder> subOrders = orderService.getSubOrders(order.getId());
        return ResponseEntity.ok(ApiResponse.success("OK",
                Map.of("order", order, "subOrders", subOrders)));
    }

    @PostMapping("/guest-lookup")
    public ResponseEntity<ApiResponse<Order>> guestLookup(@RequestBody Map<String, String> body) {
        Order order = orderService.guestLookup(body.get("orderCode"), body.get("phone"));
        return ResponseEntity.ok(ApiResponse.success("OK", order));
    }

    @PatchMapping("/sub-orders/{id}/status")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER','HTX_MANAGER')")
    public ResponseEntity<ApiResponse<SubOrder>> updateSubOrderStatus(
            @PathVariable java.util.UUID id,
            @RequestBody Map<String, String> body) {
        OrderStatus status = OrderStatus.valueOf(body.get("status"));
        SubOrder updated = orderService.updateSubOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", updated));
    }
}

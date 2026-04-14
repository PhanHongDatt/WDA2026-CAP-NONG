package com.capnong.controller;

import java.util.List;
import java.util.UUID;

import com.capnong.dto.request.CheckoutRequest;
import com.capnong.dto.request.UpdateSubOrderStatusRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.OrderResponseDto;
import com.capnong.dto.response.PagedResponse;
import com.capnong.security.UserDetailsImpl;
import com.capnong.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/orders — Checkout: tạo đơn hàng từ giỏ.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponseDto>> checkout(
            @RequestHeader(value = "Guest-Session-Id", required = false) String guestSessionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CheckoutRequest request) {

        UUID userId = userDetails != null ? userDetails.getId() : null;
        if (userId == null && guestSessionId == null) {
            throw new IllegalArgumentException("Either User ID or Guest-Session-Id must be provided for checkout");
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đặt hàng thành công",
                        orderService.checkout(guestSessionId, userId, request)));
    }

    /**
     * GET /api/orders — Lịch sử đơn hàng của buyer.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponseDto>>> getMyOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        Page<OrderResponseDto> page = orderService.getMyOrders(userDetails.getId(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success("OK", PagedResponse.from(page)));
    }

    /**
     * GET /api/orders/{orderId} — Chi tiết đơn hàng.
     */
    @GetMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<OrderResponseDto>> getOrderDetail(
            @PathVariable UUID orderId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return ResponseEntity.ok(ApiResponse.success("OK",
                orderService.getOrderDetail(orderId, userDetails.getId())));
    }

    /**
     * GET /api/orders/guest/{orderCode}?phone=... — Tra cứu đơn hàng cho khách vãng lai.
     */
    @GetMapping("/guest/{orderCode}")
    public ResponseEntity<ApiResponse<OrderResponseDto>> getGuestOrder(
            @PathVariable String orderCode,
            @RequestParam String phone) {

        return ResponseEntity.ok(ApiResponse.success("OK",
                orderService.getGuestOrder(orderCode, phone)));
    }

    /**
     * POST /api/orders/{orderId}/cancel — Buyer hủy đơn (chỉ khi tất cả sub-orders PENDING).
     */
    @PostMapping("/{orderId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(
            @PathVariable UUID orderId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        orderService.cancelOrder(orderId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã hủy đơn hàng"));
    }

    /**
     * PATCH /api/orders/sub-orders/{subOrderId}/status — Farmer cập nhật trạng thái đơn con.
     */
    @PatchMapping("/sub-orders/{subOrderId}/status")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER','HTX_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> updateSubOrderStatus(
            @PathVariable UUID subOrderId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UpdateSubOrderStatusRequest request) {

        orderService.updateSubOrderStatus(subOrderId, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái"));
    }

    /**
     * GET /api/orders/seller?status=... — Farmer xem danh sách đơn con của mình.
     */
    @GetMapping("/seller")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER','HTX_MANAGER')")
    public ResponseEntity<ApiResponse<List<OrderResponseDto.SubOrderDto>>> getSellerSubOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(ApiResponse.success("OK", 
                orderService.getSellerSubOrders(userDetails.getId(), status)));
    }
}

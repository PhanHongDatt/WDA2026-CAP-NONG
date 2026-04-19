package com.capnong.controller;

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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Tag(name = "Order", description = "Quản lý đơn đặt hàng, thao tác checkout, và theo dõi quá trình giao hàng")
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/orders — Checkout: tạo đơn hàng từ giỏ.
     */
    @PostMapping
    @Operation(summary = "Tạo đơn hàng mới (Checkout)", description = "Xử lý việc khởi tạo và phát sinh đơn hàng từ giỏ hàng hiện tại của người dùng hoặc khách hàng không đăng nhập.")
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
    @Operation(summary = "Lịch sử mua hàng", description = "Người dùng (Buyer) xem lại toàn bộ lịch sử các đơn hàng đã đặt của mình.")
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
    @Operation(summary = "Xem chi tiết đơn hàng", description = "Truy xuất danh sách sản phẩm cấu thành bên trong một đơn hàng cụ thể, dành cho Buyer.")
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
    @Operation(summary = "Tra cứu đơn hàng vãng lai", description = "Cho phép khách mua vãng lai không có account dùng mã đơn (order code) và số điện thoại để xem trạng thái đơn.")
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
    @Operation(summary = "Hủy đơn hàng", description = "Người dùng đưa ra yêu cầu hủy đơn. Hệ thống từ chối nếu kiện hàng đã bắt đầu được xử lý.")
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
    @Operation(summary = "Tiến hành/Cập nhật đơn hàng (Farmer)", description = "Nhà vườn hay đơn vị kinh doanh dùng endpoint này để báo Đang Chuẩn Bị, Giao Hàng, v.v. cho kiện phụ.")
    public ResponseEntity<ApiResponse<Void>> updateSubOrderStatus(
            @PathVariable UUID subOrderId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UpdateSubOrderStatusRequest request) {

        orderService.updateSubOrderStatus(subOrderId, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái"));
    }

    /**
     * GET /api/orders/seller?status=...&page=0&size=20 — Farmer xem danh sách đơn con (phân trang).
     */
    @GetMapping("/seller")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER','HTX_MANAGER')")
    @Operation(summary = "Danh sách đơn hàng cần xử lý", description = "Lấy dữ liệu các kiện hàng chưa phân bổ mà Seller hiện có để đóng gói giao hàng.")
    public ResponseEntity<ApiResponse<Page<OrderResponseDto.SubOrderDto>>> getSellerSubOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String status,
            Pageable pageable) {

        return ResponseEntity.ok(ApiResponse.success("OK", 
                orderService.getSellerSubOrders(userDetails.getId(), status, pageable)));
    }

    /**
     * GET /api/orders/sub-orders/{subOrderId} — Farmer xem chi tiết 1 đơn con.
     */
    @GetMapping("/sub-orders/{subOrderId}")
    @PreAuthorize("hasAnyRole('FARMER','HTX_MEMBER','HTX_MANAGER')")
    @Operation(summary = "Chi tiết một kiện của Seller", description = "Người bán truy xuất các thông tin phân phối, item trong một kiện con của họ.")
    public ResponseEntity<ApiResponse<OrderResponseDto.SubOrderDto>> getSellerSubOrderDetail(
            @PathVariable UUID subOrderId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return ResponseEntity.ok(ApiResponse.success("OK",
                orderService.getSellerSubOrderDetail(subOrderId, userDetails.getId())));
    }
}

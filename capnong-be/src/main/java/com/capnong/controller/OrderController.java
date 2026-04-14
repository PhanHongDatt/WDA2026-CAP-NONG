package com.capnong.controller;

import java.util.UUID;

import com.capnong.dto.request.CheckoutRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.OrderResponse;
import com.capnong.dto.response.PagedResponse;
import com.capnong.security.UserDetailsImpl;
import com.capnong.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @RequestHeader(value = "Guest-Session-Id", required = false) String guestSessionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CheckoutRequest request) {

        UUID userId = userDetails != null ? userDetails.getId() : null;
        if (userId == null && guestSessionId == null) {
            throw new IllegalArgumentException("Either User ID or Guest-Session-Id must be provided for checkout");
        }

        return ResponseEntity.ok(orderService.checkout(guestSessionId, userId, request));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        Page<OrderResponse> page = orderService.getMyOrders(userDetails.getId(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success("OK", PagedResponse.from(page)));
    }
}

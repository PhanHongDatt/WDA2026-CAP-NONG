package com.capnong.controller;

import com.capnong.dto.request.CheckoutRequest;
import com.capnong.dto.response.OrderResponse;
import com.capnong.security.UserDetailsImpl;
import com.capnong.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

        Long userId = userDetails != null ? userDetails.getId() : null;
        if (userId == null && guestSessionId == null) {
            throw new IllegalArgumentException("Either User ID or Guest-Session-Id must be provided for checkout");
        }

        return ResponseEntity.ok(orderService.checkout(guestSessionId, userId, request));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(orderService.getMyOrders(userDetails.getId()));
    }
}

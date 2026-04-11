package com.capnong.controller;

import java.util.UUID;

import com.capnong.dto.request.AddToCartRequest;
import com.capnong.dto.response.CartResponse;
import com.capnong.security.UserDetailsImpl;
import com.capnong.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(
            @RequestHeader(value = "Guest-Session-Id", required = false) String guestSessionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody AddToCartRequest request) {

        UUID userId = userDetails != null ? userDetails.getId() : null;
        if (userId == null && guestSessionId == null) {
            throw new IllegalArgumentException("Either User ID or Guest-Session-Id must be provided");
        }

        return ResponseEntity.ok(cartService.addToCart(guestSessionId, userId, request));
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            @RequestHeader(value = "Guest-Session-Id", required = false) String guestSessionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        UUID userId = userDetails != null ? userDetails.getId() : null;
        if (userId == null && guestSessionId == null) {
            throw new IllegalArgumentException("Either User ID or Guest-Session-Id must be provided");
        }

        return ResponseEntity.ok(cartService.getCart(guestSessionId, userId));
    }

    @PostMapping("/merge")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> mergeCart(
            @RequestHeader(value = "Guest-Session-Id") String guestSessionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        if (userDetails != null && guestSessionId != null) {
            cartService.mergeGuestCartToUser(guestSessionId, userDetails.getId());
        }
        return ResponseEntity.ok().build();
    }
}

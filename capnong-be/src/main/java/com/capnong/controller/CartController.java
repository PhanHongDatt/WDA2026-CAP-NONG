package com.capnong.controller;

import java.util.UUID;

import com.capnong.dto.request.AddToCartRequest;
import com.capnong.dto.request.UpdateCartItemRequest;
import com.capnong.dto.response.ApiResponse;
import com.capnong.dto.response.CartResponse;
import com.capnong.security.UserDetailsImpl;
import com.capnong.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @RequestHeader(value = "Guest-Session-Id", required = false) String guestSessionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody AddToCartRequest request) {

        UUID userId = userDetails != null ? userDetails.getId() : null;
        validateCartIdentity(userId, guestSessionId);

        return ResponseEntity.ok(ApiResponse.success("Đã thêm vào giỏ hàng",
                cartService.addToCart(guestSessionId, userId, request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @RequestHeader(value = "Guest-Session-Id", required = false) String guestSessionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        UUID userId = userDetails != null ? userDetails.getId() : null;
        validateCartIdentity(userId, guestSessionId);

        return ResponseEntity.ok(ApiResponse.success("OK",
                cartService.getCart(guestSessionId, userId)));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @RequestHeader(value = "Guest-Session-Id", required = false) String guestSessionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {

        UUID userId = userDetails != null ? userDetails.getId() : null;
        validateCartIdentity(userId, guestSessionId);

        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật giỏ hàng",
                cartService.updateCartItem(guestSessionId, userId, itemId, request.getQuantity())));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(
            @RequestHeader(value = "Guest-Session-Id", required = false) String guestSessionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable UUID itemId) {

        UUID userId = userDetails != null ? userDetails.getId() : null;
        validateCartIdentity(userId, guestSessionId);

        return ResponseEntity.ok(ApiResponse.success("Đã xóa sản phẩm khỏi giỏ",
                cartService.removeCartItem(guestSessionId, userId, itemId)));
    }

    @PostMapping("/merge")
    public ResponseEntity<ApiResponse<Void>> mergeCart(
            @RequestHeader(value = "Guest-Session-Id") String guestSessionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        if (userDetails != null && guestSessionId != null) {
            cartService.mergeGuestCartToUser(guestSessionId, userDetails.getId());
        }
        return ResponseEntity.ok(ApiResponse.success("Đã merge giỏ hàng"));
    }

    private void validateCartIdentity(UUID userId, String guestSessionId) {
        if (userId == null && guestSessionId == null) {
            throw new IllegalArgumentException("Either User ID or Guest-Session-Id must be provided");
        }
    }
}

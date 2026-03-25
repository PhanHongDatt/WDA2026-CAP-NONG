package com.capnong.controller;

import com.capnong.dto.response.ApiResponse;
import com.capnong.model.Cart;
import com.capnong.model.CartItem;
import com.capnong.exception.AppException;
import com.capnong.repository.CartItemRepository;
import com.capnong.repository.CartRepository;
import com.capnong.security.UserDetailsImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public CartController(CartRepository cartRepository, CartItemRepository cartItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Cart cart = getOrCreateCart(userDetails.getId());
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        return ResponseEntity.ok(ApiResponse.success("OK",
                Map.of("cart", cart, "items", items)));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartItem>> addItem(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody Map<String, Object> body) {
        Cart cart = getOrCreateCart(userDetails.getId());
        UUID productId = UUID.fromString((String) body.get("productId"));
        BigDecimal quantity = new BigDecimal(body.get("quantity").toString());

        // Check if item exists — update quantity
        var existing = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity().add(quantity));
            cartItemRepository.save(item);
            return ResponseEntity.ok(ApiResponse.success("Cập nhật số lượng", item));
        }

        CartItem item = CartItem.builder()
                .cartId(cart.getId())
                .productId(productId)
                .quantity(quantity)
                .build();
        cartItemRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đã thêm vào giỏ hàng", item));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartItem>> updateItem(
            @PathVariable UUID itemId,
            @RequestBody Map<String, Object> body) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new AppException("Item not found", HttpStatus.NOT_FOUND));
        item.setQuantity(new BigDecimal(body.get("quantity").toString()));
        cartItemRepository.save(item);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", item));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<Void>> removeItem(@PathVariable UUID itemId) {
        cartItemRepository.deleteById(itemId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa khỏi giỏ hàng", null));
    }

    private Cart getOrCreateCart(UUID userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
    }
}
